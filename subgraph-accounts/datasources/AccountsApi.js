const { PrismaClient } = require('@prisma/client')

class AccountsAPI {
  constructor() {
    this.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error']
    })
  }

  async getAllAccounts() {
    try {
      console.log('Fetching all accounts')
      const accounts = await this.prisma.account.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      })
      console.log('Found', accounts.length, 'accounts')
      return accounts
    } catch (error) {
      console.error('Error in getAllAccounts:', error.message)
      throw error
    }
  }

  async getAccount(id) {
    try {
      console.log('Fetching account with ID:', id)
      const account = await this.prisma.account.findUnique({
        where: { id }
      })
      console.log('Account found:', account)
      return account
    } catch (error) {
      console.error('Error in getAccount:', error.message)
      throw error
    }
  }

  async getAccountsByType(accountType) {
    return this.prisma.account.findMany({
      where: { accountType }
    })
  }

  async getAccountsByStatus(status) {
    return this.prisma.account.findMany({
      where: { status }
    })
  }

  async getTransactionsForAccount(accountId) {
    // This will be handled by the transactions subgraph
    return []
  }

  async testConnection() {
    try {
      await this.prisma.$connect()
      const count = await this.prisma.account.count()
      console.log(`Connected to database. Found ${count} accounts.`)
      return true
    } catch (error) {
      console.error('Database connection test failed:', error)
      return false
    }
  }
}

module.exports = AccountsAPI
