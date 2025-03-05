const { PrismaClient } = require('@prisma/client')

class UsersAPI {
    constructor() {
        this.prisma = new PrismaClient()
    }

    async initialize() {
        // Prisma automatically handles connection
    }

    async getUser(id) {
        return this.prisma.user.findUnique({
            where: { id },
        })
    }

    async getUserByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
        })
    }

    async createUser(userInput) {
        // Check if email already exists
        const existingUser = await this.getUserByEmail(userInput.email)
        if (existingUser) {
            throw new Error('Email already exists')
        }

        return this.prisma.user.create({
            data: {
                id: `usr-${Date.now()}`,
                fullName: userInput.fullName,
                email: userInput.email,
                phoneNumber: userInput.phoneNumber,
                dateOfBirth: userInput.dateOfBirth,
                status: 'PENDING_VERIFICATION',
                createdAt: new Date().toISOString(),
                street: userInput.address.street,
                city: userInput.address.city,
                state: userInput.address.state,
                postalCode: userInput.address.postalCode,
                country: userInput.address.country,
            },
        })
    }

    async updateUser(input) {
        try {
            return await this.prisma.user.update({
                where: { id: input.id },
                data: {
                    ...(input.fullName && { fullName: input.fullName }),
                    ...(input.phoneNumber && {
                        phoneNumber: input.phoneNumber,
                    }),
                    ...(input.address?.street && {
                        street: input.address.street,
                    }),
                    ...(input.address?.city && { city: input.address.city }),
                    ...(input.address?.state && { state: input.address.state }),
                    ...(input.address?.postalCode && {
                        postalCode: input.address.postalCode,
                    }),
                    ...(input.address?.country && {
                        country: input.address.country,
                    }),
                },
            })
        } catch (error) {
            if (error.code === 'P2025') {
                throw new Error('User not found')
            }
            throw error
        }
    }

    async getCurrentUser() {
        return this.prisma.user.findFirst({
            where: { status: 'ACTIVE' },
        })
    }

    async updateLoginTimestamp(userId) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { lastLoginAt: new Date().toISOString() },
        })
    }
}

module.exports = UsersAPI
