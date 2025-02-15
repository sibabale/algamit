const database = require('../config/database.js')

class UsersAPI {
    constructor() {
        this.db = database
    }

    async initialize() {
        await this.db.connect()
    }

    async getUser(id) {
        const pool = this.db.getPool()
        const query = {
            text: 'SELECT * FROM users.users WHERE id = $1',
            values: [id],
        }

        const { rows } = await pool.query(query)
        return rows[0]
    }

    async getUserByEmail(email) {
        const pool = this.db.getPool()
        const query = {
            text: 'SELECT * FROM users.users WHERE email = $1',
            values: [email],
        }

        const { rows } = await pool.query(query)
        return rows[0]
    }

    async createUser(userInput) {
        const pool = this.db.getPool()

        // Check if email already exists
        const existingUser = await this.getUserByEmail(userInput.email)
        if (existingUser) {
            throw new Error('Email already exists')
        }

        const query = {
            text: `
                INSERT INTO users.users (
                    id,
                    full_name,
                    email,
                    phone_number,
                    date_of_birth,
                    status,
                    created_at,
                    street,
                    city,
                    state,
                    postal_code,
                    country
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                RETURNING *
            `,
            values: [
                `usr-${Date.now()}`,
                userInput.fullName,
                userInput.email,
                userInput.phoneNumber,
                userInput.dateOfBirth,
                'PENDING_VERIFICATION',
                new Date().toISOString(),
                userInput.address.street,
                userInput.address.city,
                userInput.address.state,
                userInput.address.postalCode,
                userInput.address.country,
            ],
        }

        const { rows } = await pool.query(query)
        return rows[0]
    }

    async updateUser(input) {
        const pool = this.db.getPool()

        const query = {
            text: `
                UPDATE users.users
                SET 
                    full_name = COALESCE($2, full_name),
                    phone_number = COALESCE($3, phone_number),
                    street = COALESCE($4, street),
                    city = COALESCE($5, city),
                    state = COALESCE($6, state),
                    postal_code = COALESCE($7, postal_code),
                    country = COALESCE($8, country)
                WHERE id = $1
                RETURNING *
            `,
            values: [
                input.id,
                input.fullName,
                input.phoneNumber,
                input.address?.street,
                input.address?.city,
                input.address?.state,
                input.address?.postalCode,
                input.address?.country,
            ],
        }

        const { rows } = await pool.query(query)
        if (rows.length === 0) {
            throw new Error('User not found')
        }
        return rows[0]
    }

    async getCurrentUser() {
        const pool = this.db.getPool()
        const query = {
            text: 'SELECT * FROM users.users WHERE status = $1 LIMIT 1',
            values: ['ACTIVE'],
        }

        const { rows } = await pool.query(query)
        return rows[0]
    }

    updateLoginTimestamp(userId) {
        const userIndex = users.findIndex((user) => user.id === userId)
        if (userIndex !== -1) {
            users[userIndex] = {
                ...users[userIndex],
                lastLoginAt: new Date().toISOString(),
            }
        }
    }
}

module.exports = UsersAPI
