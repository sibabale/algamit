const { PrismaClient } = require('@prisma/client')
const accountsData = require('../datasources/accounts_data.json')

const prisma = new PrismaClient()

async function main() {
    console.log('Starting to seed accounts...')
    
    for (const account of accountsData.accounts) {
        await prisma.account.upsert({
            where: { id: account.id },
            update: {},
            create: {
                id: account.id,
                accountNumber: account.accountNumber,
                accountType: account.accountType,
                balance: account.balance,
                dateOpened: new Date(account.dateOpened),
                status: account.status,
                ownerId: account.ownerId
            }
        })
        console.log(`Created account with id: ${account.id}`)
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