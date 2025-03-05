const { ApolloServer } = require('@apollo/server');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const { startStandaloneServer } = require('@apollo/server/standalone');
const {
    ApolloServerPluginInlineTrace,
} = require('@apollo/server/plugin/inlineTrace');
const database = require('./config/database.js');

const { readFileSync } = require('fs');
const gql = require('graphql-tag');

const typeDefs = gql(readFileSync('./accounts.graphql', { encoding: 'utf-8' }));
const resolvers = require('./resolvers');
const AccountsAPI = require('./datasources/AccountsApi');
const { handleUserCreated } = require('./kafka/consumers/users/user.created');

async function startApolloServer() {
    // Initialize database connection
    await database.connect();

    const server = new ApolloServer({
        schema: buildSubgraphSchema({ typeDefs, resolvers }),
        introspection: true,
        plugins: [
            ApolloServerPluginInlineTrace(),
            {
                async serverWillStop() {
                    // Properly close database connection when server stops
                    await database.disconnect();
                },
            },
        ],
    });

    const port = 4001;
    const subgraphName = 'accounts';

    try {
        const { url } = await startStandaloneServer(server, {
            context: async () => {
                return {
                    dataSources: {
                        accountsAPI: new AccountsAPI(),
                    },
                };
            },
            listen: { port },
        });

        console.log(`🚀 Subgraph ${subgraphName} running at ${url}`);
    } catch (err) {
        console.error(err);
    }
}

const accountsAPI = new AccountsAPI();

// Start the consumer
handleUserCreated(accountsAPI).catch(error => {
    console.error('Failed to start user.created consumer:', error);
    process.exit(1);
});

startApolloServer();
