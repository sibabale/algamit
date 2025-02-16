const pg = require('pg')
const dotenv = require('dotenv')
const { Connector } = require('@google-cloud/cloud-sql-connector')

const { Pool } = pg

dotenv.config()
class Database {
    constructor() {
        this.pool = null
        this.connector = null
    }

    async connect() {
        if (this.pool) {
            return this.pool
        }

        this.connector = new Connector()
        const clientOpts = await this.connector.getOptions({
            instanceConnectionName: process.env.INSTANCE_CONNECTION_NAME,
            ipType: 'PUBLIC',
        })

        this.pool = new Pool({
            ...clientOpts,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            max: 5,
        })

        // Test the connection
        try {
            await this.pool.query('SELECT NOW()')
            console.log('🗄️ ✅ Accounts database connection established')
        } catch (error) {
            console.error('🗄️ ❌ Accounts database connection failed:', error)
            throw error
        }

        return this.pool
    }

    async disconnect() {
        if (this.pool) {
            await this.pool.end()
        }
        if (this.connector) {
            await this.connector.close()
        }
    }

    getPool() {
        if (!this.pool) {
            throw new Error('Database not connected. Call connect() first.')
        }
        return this.pool
    }
}

module.exports = new Database()
