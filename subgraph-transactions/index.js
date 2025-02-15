const { ApolloServer } = require('@apollo/server');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const { startStandaloneServer } = require('@apollo/server/standalone');
const {
    ApolloServerPluginInlineTrace,
} = require('@apollo/server/plugin/inlineTrace');
const database = require('./config/database.js');

const { readFileSync } = require('fs');
const { gql } = require('graphql-tag');

const typeDefs = gql(readFileSync('./transactions.graphql', { encoding: 'utf-8' }));
const resolvers = require('./resolvers');
const TransactionsAPI = require('./datasources/TransactionsApi');

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

    const port = 4002;
    const subgraphName = 'transactions';

    try {
        const { url } = await startStandaloneServer(server, {
            context: async () => {
                return {
                    dataSources: {
                        transactionsAPI: new TransactionsAPI(),
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

startApolloServer();

// Handle shutdown gracefully
process.on('SIGINT', async () => {
    console.log('Received SIGINT. Performing graceful shutdown...');
    await require('./config/database').disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Received SIGTERM. Performing graceful shutdown...');
    await require('./config/database').disconnect();
    process.exit(0);
});
