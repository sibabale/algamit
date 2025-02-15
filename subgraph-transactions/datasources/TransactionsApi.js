const database = require('../config/database')

class TransactionsAPI {
    constructor() {
        this.db = database
    }

    async initialize() {
        await this.db.connect()
    }

    async getAllTransactions() {
        const pool = this.db.getPool()
        const result = await pool.query('SELECT * FROM transactions ORDER BY created_at DESC')
        return result.rows
    }

    async getTransaction(id) {
        const pool = this.db.getPool()
        const result = await pool.query('SELECT * FROM transactions WHERE id = $1', [id])
        return result.rows[0]
    }

    async getTransactionsByUserId(userId) {
        const pool = this.db.getPool()
        const result = await pool.query(
            'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        )
        return result.rows
    }

    async getTransactionsByAccountId(accountId) {
        const pool = this.db.getPool()
        const result = await pool.query(
            'SELECT * FROM transactions WHERE account_id = $1 ORDER BY created_at DESC',
            [accountId]
        )
        return result.rows
    }

    async createTransaction(transactionData) {
        const pool = this.db.getPool()
        const {
            id,
            userId,
            accountId,
            type,
            amount,
            category,
            description,
            withdrawalDate,
            balanceAfter
        } = transactionData

        const result = await pool.query(
            `INSERT INTO transactions 
            (id, user_id, account_id, type, amount, category, description, withdrawal_date, balance_after) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
            RETURNING *`,
            [id, userId, accountId, type, amount, category, description, withdrawalDate, balanceAfter]
        )
        return result.rows[0]
    }

    async updateTransaction(id, updates) {
        const pool = this.db.getPool()
        const setClause = []
        const values = []
        let paramCount = 1

        // Build dynamic SET clause
        Object.entries(updates).forEach(([key, value]) => {
            if (value !== undefined) {
                setClause.push(`${this.snakeCaseKey(key)} = $${paramCount}`)
                values.push(value)
                paramCount++
            }
        })

        if (setClause.length === 0) {
            throw new Error('No valid updates provided')
        }

        values.push(id)
        const query = `
            UPDATE transactions 
            SET ${setClause.join(', ')} 
            WHERE id = $${paramCount} 
            RETURNING *
        `

        const result = await pool.query(query, values)
        return result.rows[0]
    }

    async deleteTransaction(id) {
        const pool = this.db.getPool()
        const result = await pool.query(
            'DELETE FROM transactions WHERE id = $1 RETURNING *',
            [id]
        )
        return result.rows[0]
    }

    // Helper method to convert camelCase to snake_case
    snakeCaseKey(key) {
        return key.replace(/([A-Z])/g, '_$1').toLowerCase()
    }
}

module.exports = TransactionsAPI
