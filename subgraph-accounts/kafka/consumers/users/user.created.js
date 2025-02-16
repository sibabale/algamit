const { Kafka } = require('kafkajs');
const avro = require('avsc');
const {userCreatedSchema} = require('../../schemas');

const kafka = new Kafka({
    clientId: 'accounts-subgraph',
    brokers: ['localhost:9092'],
    retry: {
        initialRetryTime: 100,
        retries: 8
    }
});

const consumer = kafka.consumer({ 
    groupId: 'accounts-service',
    // Enable parallel message processing
    maxParallelHandles: 10,
    // Ensure ordered processing within each partition
    readUncommitted: false
});

const type = avro.Type.forSchema(userCreatedSchema);

// Track processed message IDs to prevent duplicates
const processedMessages = new Set();
const PROCESSED_MESSAGES_TTL = 24 * 60 * 60 * 1000; // 24 hours

const createDefaultAccount = async (accountsAPI, userId) => {
    try {
        const account = {
            id: `acc-${Date.now()}`,
            ownerId: userId,
            accountType: 'SAVINGS',
            balance: 0,
            status: 'ACTIVE',
            accountNumber: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            dateOpened: new Date().toISOString()
        };

        // Use the AccountsAPI to create the account
        const createdAccount = await accountsAPI.createAccount(account);
        console.log(`Created default account ${account.id} for user ${userId}`);
        return createdAccount;
    } catch (error) {
        console.error(`Error creating account for user ${userId}:`, error);
        throw error;
    }
};

const handleUserCreated = async (accountsAPI) => {
    await consumer.connect();
    await consumer.subscribe({ 
        topic: 'user.created',
        fromBeginning: true
    });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const messageId = `${topic}-${partition}-${message.offset}`;
            
            // Skip if message already processed
            if (processedMessages.has(messageId)) {
                console.log(`Skipping duplicate message: ${messageId}`);
                return;
            }

            try {
                // Deserialize with Avro
                const event = type.fromBuffer(message.value);
                const user = event.payload;
                const retryCount = parseInt(message.headers['retry-count'] || '0');
                
                console.log(`Processing user creation for ${user.id}, retry: ${retryCount}`);

                // Create default account
                await createDefaultAccount(accountsAPI, user.id);

                // Mark message as processed
                processedMessages.add(messageId);
                setTimeout(() => processedMessages.delete(messageId), PROCESSED_MESSAGES_TTL);

                // Commit offset only after successful processing
                await consumer.commitOffsets([{
                    topic,
                    partition,
                    offset: (parseInt(message.offset) + 1).toString()
                }]);

            } catch (error) {
                console.error('Error processing user.created event:', error);
                
                // Implement dead-letter queue for failed messages
                if (retryCount >= 5) {
                    await sendToDLQ(message, error);
                    return;
                }

                // Retry with backoff
                const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 30000);
                await new Promise(resolve => setTimeout(resolve, backoffTime));
                
                // Message will be reprocessed due to not committing offset
            }
        },
        // Configure batch processing
        eachBatchAutoResolve: true,
        autoCommitInterval: 5000, // Commit every 5 seconds
        autoCommitThreshold: 100  // Or every 100 messages
    });
};

// Dead Letter Queue handling
const sendToDLQ = async (message, error) => {
    try {
        const dlqProducer = kafka.producer();
        await dlqProducer.connect();
        
        await dlqProducer.send({
            topic: 'accounts.user-created.dlq',
            messages: [{
                key: message.key,
                value: message.value,
                headers: {
                    ...message.headers,
                    'error-message': error.message,
                    'failed-at': new Date().toISOString()
                }
            }]
        });
        
        await dlqProducer.disconnect();
    } catch (dlqError) {
        console.error('Failed to send to DLQ:', dlqError);
    }
};

// Graceful shutdown handling
const shutdown = async () => {
    try {
        console.log('Shutting down user.created consumer...');
        await consumer.disconnect();
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
    process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Export for use in application
module.exports = { handleUserCreated };