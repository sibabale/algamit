const { ApolloServer } = require('@apollo/server')
const { buildSubgraphSchema } = require('@apollo/subgraph')
const { startStandaloneServer } = require('@apollo/server/standalone')
const {
    ApolloServerPluginInlineTrace,
} = require('@apollo/server/plugin/inlineTrace')
const database = require('./config/database.js')

const { readFileSync } = require('fs')
const gql = require('graphql-tag')

const typeDefs = gql(readFileSync('./users.graphql', { encoding: 'utf-8' }))
const resolvers = require('./resolvers')
const UsersAPI = require('./datasources/UsersApi')
const AccountsAPI = require('../subgraph-accounts/datasources/AccountsApi')

async function startApolloServer() {
    // Initialize database connection
    await database.connect()

    const server = new ApolloServer({
        schema: buildSubgraphSchema({ typeDefs, resolvers }),
        introspection: true,
        plugins: [
            ApolloServerPluginInlineTrace(),
            {
                async serverWillStop() {
                    // Properly close database connection when server stops
                    await database.disconnect()
                },
            },
        ],
    })

    const port = 4003
    const subgraphName = 'users'

    try {
        const { url } = await startStandaloneServer(server, {
            context: async () => {
                return {
                    dataSources: {
                        usersAPI: new UsersAPI(),
                        accountsAPI: new AccountsAPI(),
                    },
                }
            },
            listen: { port },
        })

        console.log(`🚀 Subgraph ${subgraphName} running at ${url}`)
    } catch (err) {
        console.error(err)
    }
}

startApolloServer()
