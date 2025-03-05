const resolvers = {
  Query: {
    accounts: async (_, __, { dataSources }) => {
      try {
        return await dataSources.accountsAPI.getAllAccounts();
      } catch (error) {
        console.error('Error in accounts resolver:', error);
        throw error;
      }
    },
    account: async (_, { id }, { dataSources }) => {
      try {
        console.log('Account resolver called with ID:', id);
        const account = await dataSources.accountsAPI.getAccount(id);
        console.log('Account resolver result:', account);
        return account;
      } catch (error) {
        console.error('Error in account resolver:', error);
        throw error;
      }
    },
  },
  Account: {
    // Optional field resolvers if needed
    // For example, if you want to format the balance or date
    balance: (account) => {
      return parseFloat(account.balance);
    },
    dateOpened: (account) => {
      return account.date_opened.toISOString().split('T')[0];
    },
    accountType: (account) => {
      return account.account_type;
    },
    ownerId: (account) => {
      return account.owner_id;
    },
    owner: (account) => {
      // Return a reference to the User entity
      // This tells Apollo Federation to fetch the full user data from the users subgraph
      return { __typename: "User", id: account.owner_id };
    },
    transactions: async (account, _, { dataSources }) => {
      return []; // Placeholder for transactions implementation
    },
    __resolveReference: async (reference, { dataSources }) => {
      // This resolver is called when another subgraph references this Account
      return await dataSources.accountsAPI.getAccount(reference.id);
    }
  }
};

module.exports = resolvers;

