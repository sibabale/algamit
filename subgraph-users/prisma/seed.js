const { PrismaClient } = require('@prisma/client')
const usersData = require('../datasources/users_data.json')

const prisma = new PrismaClient()

async function main() {
    console.log('Starting to seed users...')

    for (const user of usersData.users) {
        await prisma.user.upsert({
            where: { id: user.id },
            update: {},
            create: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                dateOfBirth: user.dateOfBirth,
                street: user.address.street,
                city: user.address.city,
                state: user.address.state,
                postalCode: user.address.postalCode,
                country: user.address.country,
                status: user.status,
                createdAt: new Date(user.createdAt),
                lastLoginAt: user.lastLoginAt
                    ? new Date(user.lastLoginAt)
                    : null,
            },
        })
        console.log(`Created user with id: ${user.id}`)
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
