const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Clean database before seeding
  await prisma.transaction.deleteMany({})
  await prisma.destination.deleteMany({})
  await prisma.account.deleteMany({})
  await prisma.user.deleteMany({})

  // Seed users
  const user1 = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'test@example.com',
      password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // Secret42
      active: true,
    },
  })

  const user2 = await prisma.user.create({
    data: {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // Secret42
      active: true,
    },
  })

  // Seed accounts
  const account1 = await prisma.account.create({
    data: {
      accountType: 'SAVINGS',
      ownerId: user1.id,
      balance: 1000.00,
      accountNumber: '1234567890',
    },
  })

  const account2 = await prisma.account.create({
    data: {
      accountType: 'CURRENT',
      ownerId: user2.id,
      balance: 2500.00,
      accountNumber: '0987654321',
    },
  })

  // Seed destinations
  const destination1 = await prisma.destination.create({
    data: {
      ownerId: user1.id,
      accountNumber: '9876543210',
    },
  })

  const destination2 = await prisma.destination.create({
    data: {
      ownerId: user2.id,
      accountNumber: '5678901234',
    },
  })

  // Seed transactions
  await prisma.transaction.create({
    data: {
      type: 'DEPOSIT',
      status: 'COMPLETED',
      amount: 500.00,
      accountId: account1.id,
      accountBalance: 1500.00,
      accountCurrency: 'USD',
      destinationId: destination1.id,
    },
  })

  await prisma.transaction.create({
    data: {
      type: 'WITHDRAWAL',
      status: 'COMPLETED',
      amount: 200.00,
      accountId: account2.id,
      accountBalance: 2300.00,
      accountCurrency: 'EUR',
      destinationId: destination2.id,
    },
  })

  await prisma.transaction.create({
    data: {
      type: 'TRANSFER',
      status: 'PENDING',
      amount: 300.00,
      accountId: account1.id,
      accountBalance: 1200.00,
      accountCurrency: 'USD',
      destinationId: destination2.id,
    },
  })

  console.log('Database has been seeded!')
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  }) 