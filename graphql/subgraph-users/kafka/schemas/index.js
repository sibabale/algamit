const userCreatedSchema = {
    type: 'record',
    name: 'UserCreated',
    namespace: 'io.banking.events.users',
    fields: [
        { name: 'event_type', type: 'string' },
        { name: 'timestamp', type: 'long', logicalType: 'timestamp-millis' },
        {
            name: 'payload',
            type: {
                type: 'record',
                name: 'UserPayload',
                fields: [
                    { name: 'id', type: 'string' },
                    { name: 'fullName', type: 'string' },
                    { name: 'email', type: 'string' },
                    { name: 'phoneNumber', type: 'string' },
                    { name: 'dateOfBirth', type: 'string' },
                    {
                        name: 'address',
                        type: {
                            type: 'record',
                            name: 'Address',
                            fields: [
                                { name: 'street', type: 'string' },
                                { name: 'city', type: 'string' },
                                { name: 'state', type: 'string' },
                                { name: 'postalCode', type: 'string' },
                                { name: 'country', type: 'string' },
                            ],
                        },
                    },
                    {
                        name: 'status',
                        type: {
                            type: 'enum',
                            name: 'UserStatus',
                            symbols: [
                                'ACTIVE',
                                'INACTIVE',
                                'SUSPENDED',
                                'PENDING_VERIFICATION',
                            ],
                        },
                        default: 'PENDING_VERIFICATION',
                    },
                    { name: 'createdAt', type: 'string' },
                    {
                        name: 'lastLoginAt',
                        type: ['null', 'string'],
                        default: null,
                    },
                ],
            },
        },
    ],
}

module.exports = {
    userCreatedSchema,
}
