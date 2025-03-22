import {
    PrismaClient,
    TransactionType,
    TransactionStatus,
    Currency,
} from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding ...')

    // Clear existing data
    await prisma.transaction.deleteMany()
    await prisma.destination.deleteMany()

    const transactions = [
        {
            type: 'DEPOSIT' as TransactionType,
            status: 'PENDING' as TransactionStatus,
            amount: 1000,
            accountId: uuidv4(),
            currency: 'USD' as Currency,
            destination: {
                create: {
                    ownerId: uuidv4(),
                    accountNumber: '1234567890',
                },
            },
        },
        {
            type: 'WITHDRAWAL' as TransactionType,
            status: 'COMPLETED' as TransactionStatus,
            amount: 500,
            accountId: uuidv4(),
            currency: 'EUR' as Currency,
            destination: {
                create: {
                    ownerId: uuidv4(),
                    accountNumber: '2345678901',
                },
            },
        },
        {
            type: 'DEPOSIT' as TransactionType,
            status: 'COMPLETED' as TransactionStatus,
            amount: 2000,
            accountId: uuidv4(),
            currency: 'GBP' as Currency,
            destination: {
                create: {
                    ownerId: uuidv4(),
                    accountNumber: '3456789012',
                },
            },
        },
        {
            type: 'TRANSFER' as TransactionType,
            status: 'FAILED' as TransactionStatus,
            amount: 750,
            accountId: uuidv4(),
            currency: 'USD' as Currency,
            destination: {
                create: {
                    ownerId: uuidv4(),
                    accountNumber: '4567890123',
                },
            },
        },
        {
            type: 'DEPOSIT' as TransactionType,
            status: 'COMPLETED' as TransactionStatus,
            amount: 3000,
            accountId: uuidv4(),
            currency: 'EUR' as Currency,
            destination: {
                create: {
                    ownerId: uuidv4(),
                    accountNumber: '5678901234',
                },
            },
        },
    ]

    for (const transaction of transactions) {
        const created = await prisma.transaction.create({
            data: transaction,
        })
        console.log(`Created transaction with id: ${created.id}`)
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
