import { PrismaClient, AccountStatus, AccountType } from '@prisma/client'

const prisma = new PrismaClient()

const accountData = [
    {
        id: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
        status: 'ACTIVE' as AccountStatus,
        balance: 1000.0,
        ownerId: 'john-doe',
        accountType: 'SAVINGS' as AccountType,
        dateOpened: new Date('2024-03-08'),
        accountNumber: 'acc-1234-5678-9012',
    },
    {
        id: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q',
        status: 'ACTIVE' as AccountStatus,
        balance: 2000.0,
        ownerId: 'jane-doe',
        accountType: 'CURRENT' as AccountType,
        dateOpened: new Date('2024-03-08'),
        accountNumber: 'acc-2345-6789-0123',
    },
    {
        id: '3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r',
        status: 'ACTIVE' as AccountStatus,
        balance: 3000.0,
        ownerId: 'alice-smith',
        accountType: 'FIXED_DEPOSIT' as AccountType,
        dateOpened: new Date('2024-03-08'),
        accountNumber: 'acc-3456-7890-1234',
    },
    {
        id: '4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s',
        status: 'CLOSED' as AccountStatus,
        balance: 4000.0,
        ownerId: 'bob-johnson',
        accountType: 'SAVINGS' as AccountType,
        dateOpened: new Date('2024-03-08'),
        accountNumber: 'acc-4567-8901-2345',
    },
    {
        id: '5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t',
        status: 'ACTIVE' as AccountStatus,
        balance: 5000.0,
        ownerId: 'charlie-brown',
        accountType: 'CURRENT' as AccountType,
        dateOpened: new Date('2024-03-08'),
        accountNumber: 'acc-5678-9012-3456',
    },
]

async function main() {
    console.log('Start seeding ...')

    // Clear existing data
    await prisma.account.deleteMany()

    for (const account of accountData) {
        const createdAccount = await prisma.account.create({
            data: account,
        })
        console.log(`Created account with id: ${createdAccount.id}`)
    }

    console.log('Seeding finished')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
