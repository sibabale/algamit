const resolvers = {
  Query: {
    accountTransactions: (_, { accountId }, { dataSources }) => {
      return dataSources.transactionsAPI.getTransactionsByAccount(accountId);
    },
    transaction: (_, { id }, { dataSources }) => {
      return dataSources.transactionsAPI.getTransaction(id);
    },
    latestTransactions: (_, { limit }, { dataSources }) => {
      return dataSources.transactionsAPI.getLatestTransactions(limit);
    }
  },
  Mutation: {
    createTransaction: async (_, { input }, { dataSources }) => {
      try {
        // Get account details to check if it's a fixed deposit account
        const account = await dataSources.accountsAPI.getAccount(input.accountId);
        
        // Add userId to the input before creating transaction
        const enrichedInput = {
          ...input,
          userId: context.userId // You'll need to get this from the context
        };

        // Validation for fixed deposit accounts
        if (account.accountType === 'FIXED_DEPOSIT' && input.type === 'DEPOSIT') {
          if (!input.withdrawalDate) {
            return {
              code: 400,
              success: false,
              message: 'Withdrawal date is required for fixed deposit accounts',
              transaction: null
            };
          }

          // Validate that withdrawal date is in the future
          const withdrawalDate = new Date(input.withdrawalDate);
          if (withdrawalDate <= new Date()) {
            return {
              code: 400,
              success: false,
              message: 'Withdrawal date must be in the future',
              transaction: null
            };
          }
        }

        // Validate withdrawal attempts
        if (input.type === 'WITHDRAWAL') {
          if (account.accountType === 'FIXED_DEPOSIT') {
            const currentDate = new Date();
            const maturityDate = new Date(account.fixedDepositDetails.withdrawalDate);
            
            if (currentDate < maturityDate) {
              return {
                code: 400,
                success: false,
                message: 'Cannot withdraw from fixed deposit before maturity date',
                transaction: null
              };
            }
          }

          // Check if withdrawal amount is available
          if (account.balance < input.amount) {
            return {
              code: 400,
              success: false,
              message: 'Insufficient funds',
              transaction: null
            };
          }
        }

        // If all validations pass, create the transaction
        const transaction = await dataSources.transactionsAPI.createTransaction(enrichedInput);
        
        return {
          code: 200,
          success: true,
          message: 'Transaction created successfully',
          transaction
        };
      } catch (error) {
        return {
          code: 500,
          success: false,
          message: error.message,
          transaction: null
        };
      }
    }
  },
  Transaction: {
    user: (transaction) => {
      return { __typename: "User", id: transaction.userId };
    },
    account: (transaction) => {
      // Return a reference to the Account entity that Apollo Federation can resolve
      return { __typename: "Account", id: transaction.accountId };
    },
    __resolveReference: (reference, { dataSources }) => {
      // This resolver is called when another subgraph references this Transaction
      return dataSources.transactionsAPI.getTransaction(reference.id);
    }
  }
};

module.exports = resolvers;