const { PrismaClient } = require('@prisma/client')
const transactionsData = require('../datasources/transactions_data.json')

const prisma = new PrismaClient()

async function main() {
    console.log('Starting to seed transactions...')
    
    for (const transaction of transactionsData.transactions) {
        await prisma.transaction.upsert({
            where: { id: transaction.id },
            update: {},
            create: {
                id: transaction.id,
                userId: transaction.userId,
                accountId: transaction.accountId,
                type: transaction.type,
                amount: transaction.amount,
                category: transaction.category,
                description: transaction.description,
                createdAt: new Date(transaction.createdAt),
                withdrawalDate: transaction.withdrawalDate ? new Date(transaction.withdrawalDate) : null,
                balanceAfter: transaction.balanceAfter
            }
        })
        console.log(`Created transaction with id: ${transaction.id}`)
    }
    
    console.log('Seeding finished.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })