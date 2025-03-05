const { Kafka } = require('kafkajs')
const avro = require('avsc')
const { userCreatedSchema } = require('../schemas')
const { UsersAPI } = require('../../datasources/UsersApi')

const kafka = new Kafka({
    clientId: 'users-subgraph',
    brokers: ['localhost:9092'],
    retry: {
        initialRetryTime: 100,
        retries: 8, // Will retry for ~25.5 seconds total
    },
})

const producer = kafka.producer({
    // Enable idempotent writes to prevent duplicate events
    idempotent: true,
    // Configure batching for high throughput
    transactionalId: 'users-producer-tx',
    maxInFlightRequests: 5,
    // Batch configuration
    batch: {
        size: 100, // 100KB
        lingerMs: 10, // Wait 10ms to batch messages
    },
})

const type = avro.Type.forSchema(userCreatedSchema)

// Maintain a queue of failed events
const failedEventsQueue = []

const publishUserCreated = async (user) => {
    const message = {
        event_type: 'USER_CREATED',
        timestamp: Date.now(),
        payload: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            dateOfBirth: user.dateOfBirth,
            address: {
                street: user.street,
                city: user.city,
                state: user.state,
                postalCode: user.postalCode,
                country: user.country,
            },
            status: user.status || 'PENDING_VERIFICATION',
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt || null,
        },
    }

    const buffer = type.toBuffer(message)

    try {
        await producer.send({
            topic: 'user.created',
            messages: [
                {
                    key: user.id,
                    value: buffer,
                    headers: {
                        'retry-count': '0',
                        'original-timestamp': Date.now().toString(),
                    },
                },
            ],
        })

        console.log(`Published user.created event for ${user.id}`)
    } catch (error) {
        console.error('Error publishing user.created event:', error)
        // Store failed event for retry
        failedEventsQueue.push({
            message,
            retryCount: 0,
            timestamp: Date.now(),
        })
        // Trigger retry mechanism
        scheduleRetry()
    }
}

// Retry mechanism for failed events
const scheduleRetry = async () => {
    while (failedEventsQueue.length > 0) {
        const failedEvent = failedEventsQueue[0]

        if (failedEvent.retryCount >= 5) {
            // Move to DLQ after 5 retries
            await sendToDLQ(failedEvent)
            failedEventsQueue.shift()
            continue
        }

        try {
            await producer.send({
                topic: 'user.created',
                messages: [
                    {
                        key: failedEvent.message.payload.id,
                        value: type.toBuffer(failedEvent.message),
                        headers: {
                            'retry-count': failedEvent.retryCount.toString(),
                            'original-timestamp':
                                failedEvent.timestamp.toString(),
                        },
                    },
                ],
            })

            // Success - remove from queue
            failedEventsQueue.shift()
        } catch (error) {
            // Increment retry count and wait before next attempt
            failedEvent.retryCount++
            await new Promise((resolve) =>
                setTimeout(
                    resolve,
                    Math.min(1000 * Math.pow(2, failedEvent.retryCount), 30000)
                )
            )
        }
    }
}

// Dead Letter Queue for failed events
const sendToDLQ = async (failedEvent) => {
    try {
        await producer.send({
            topic: 'user.created.dlq',
            messages: [
                {
                    key: failedEvent.message.payload.id,
                    value: type.toBuffer({
                        ...failedEvent.message,
                        error_info: {
                            retries: failedEvent.retryCount,
                            original_timestamp: failedEvent.timestamp,
                            final_failure_time: Date.now(),
                        },
                    }),
                },
            ],
        })
    } catch (error) {
        console.error('Failed to send to DLQ:', error)
        // At this point, you might want to write to a local file or alert an admin
    }
}

// Non-blocking integration with UsersAPI
const integrateWithUserCreation = (usersAPI) => {
    const originalCreateUser = usersAPI.createUser

    usersAPI.createUser = async (userInput) => {
        try {
            const createdUser = await originalCreateUser.call(
                usersAPI,
                userInput
            )

            // Publish event asynchronously - don't await
            publishUserCreated(createdUser).catch((error) => {
                console.error('Async event publishing failed:', error)
                // Event will be retried through the retry mechanism
            })

            return createdUser
        } catch (error) {
            // If user creation fails, don't publish event
            throw error
        }
    }
}

// Export the initialization function
const initializeKafkaProducer = async () => {
    try {
        await producer.connect()
        console.log('🔌 Kafka producer connected successfully')

        // Handle graceful shutdown
        process.on('SIGTERM', async () => {
            try {
                console.log('SIGTERM received, processing remaining events...')
                // Process any remaining events in the queue
                await scheduleRetry()
                await producer.disconnect()
                console.log('Kafka producer shut down gracefully')
            } catch (error) {
                console.error('Error during Kafka shutdown:', error)
                process.exit(1)
            }
            process.exit(0)
        })

        process.on('SIGINT', async () => {
            try {
                console.log('SIGINT received, processing remaining events...')
                await scheduleRetry()
                await producer.disconnect()
                console.log('Kafka producer shut down gracefully')
            } catch (error) {
                console.error('Error during Kafka shutdown:', error)
                process.exit(1)
            }
            process.exit(0)
        })
    } catch (error) {
        console.error('Failed to connect Kafka producer:', error)
        throw error
    }
}

module.exports = {
    publishUserCreated,
    integrateWithUserCreation,
    initializeKafkaProducer,
}
