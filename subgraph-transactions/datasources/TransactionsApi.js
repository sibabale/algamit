const { PrismaClient } = require('@prisma/client')

class TransactionsAPI {
    constructor() {
        this.prisma = new PrismaClient({
            log: ['query', 'info', 'warn', 'error']
        })
    }

    async getAllTransactions() {
        return this.prisma.transaction.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        })
    }

    async getTransaction(id) {
        return this.prisma.transaction.findUnique({
            where: { id }
        })
    }

    async getTransactionsByUserId(userId) {
        return this.prisma.transaction.findMany({
            where: { userId },
            orderBy: {
                createdAt: 'desc'
            }
        })
    }

    async getTransactionsByAccountId(accountId) {
        return this.prisma.transaction.findMany({
            where: { accountId },
            orderBy: {
                createdAt: 'desc'
            }
        })
    }

    async createTransaction(data) {
        return this.prisma.transaction.create({
            data
        })
    }

    async updateTransaction(id, data) {
        return this.prisma.transaction.update({
            where: { id },
            data
        })
    }

    async deleteTransaction(id) {
        return this.prisma.transaction.delete({
            where: { id }
        })
    }

    async testConnection() {
        try {
            await this.prisma.$connect()
            // Try to query the database
            const count = await this.prisma.transaction.count()
            console.log(`Connected to database. Found ${count} transactions.`)
            return true
        } catch (error) {
            console.error('Database connection test failed:', error)
            return false
        }
    }
}

module.exports = TransactionsAPI
