const { integrateWithUserCreation } = require('./kafka/producers/user.create')
const UsersAPI = require('./datasources/UsersApi')

const resolvers = {
    Query: {
        user: (_, { id }, { dataSources }) => {
            return dataSources.usersAPI.getUser(id)
        },
        me: (_, __, { dataSources }) => {
            return dataSources.usersAPI.getCurrentUser()
        },
    },
    Mutation: {
        createUser: async (_, { input }, { dataSources }) => {
            try {
                const user = await dataSources.usersAPI.createUser(input)
                return {
                    code: 200,
                    success: true,
                    message: 'User created successfully',
                    user,
                }
            } catch (error) {
                return {
                    code: 400,
                    success: false,
                    message: error.message,
                    user: null,
                }
            }
        },
        updateUser: async (_, { input }, { dataSources }) => {
            try {
                const user = await dataSources.usersAPI.updateUser(input)
                return {
                    code: 200,
                    success: true,
                    message: 'User updated successfully',
                    user,
                }
            } catch (error) {
                return {
                    code: error.message === 'User not found' ? 404 : 400,
                    success: false,
                    message: error.message,
                    user: null,
                }
            }
        },
    },
    User: {
        fullName: (user) => user.fullName,
        phoneNumber: (user) => user.phoneNumber,
        dateOfBirth: (user) => user.dateOfBirth,
        lastLoginAt: (user) => user.lastLoginAt,
        postalCode: (user) => user.postalCode,
        address: (user) => ({
            street: user.street,
            city: user.city,
            state: user.state,
            postalCode: user.postalCode,
            country: user.country,
        }),
        createdAt: (user) => {
            return new Date(user.createdAt).toISOString()
        },
        accounts: async (user, _, { dataSources }) => {
            // Get all accounts and filter by ownerId
            const allAccounts = await dataSources.accountsAPI.getAllAccounts()
            return allAccounts.filter((account) => account.ownerId === user.id)
        },
        __resolveReference: async (reference, { dataSources }) => {
            // Add error handling and logging to debug
            return dataSources.usersAPI.getUser(reference.id)
        },
    },
}

// Initialize and integrate with Kafka
const usersAPI = new UsersAPI()
integrateWithUserCreation(usersAPI)

module.exports = resolvers
