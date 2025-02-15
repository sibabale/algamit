const database = require('../config/database')
const transactionsData = require('../datasources/transactions_data.json')

async function setupDatabase() {
    try {
        console.log('Starting transactions database setup...')
        await database.connect()
        const pool = database.getPool()

        // Create ENUM type for transaction type
        console.log('Creating ENUM types...')
        await pool.query(`
            DO $$ BEGIN
                CREATE TYPE transaction_type AS ENUM (
                    'DEPOSIT',
                    'WITHDRAWAL'
                );
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `)

        // Create transactions table
        console.log('Creating transactions table...')
        await pool.query(`
            CREATE TABLE IF NOT EXISTS transactions (
                id VARCHAR(50) PRIMARY KEY,
                user_id VARCHAR(50) NOT NULL,
                account_id VARCHAR(50) NOT NULL,
                type transaction_type NOT NULL,
                amount DECIMAL(15,2) NOT NULL,
                category VARCHAR(50),
                description TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                withdrawal_date TIMESTAMP WITH TIME ZONE,
                balance_after DECIMAL(15,2) NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `)

        // Create updated_at trigger
        console.log('Creating trigger for updated_at...')
        await pool.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';

            DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
            
            CREATE TRIGGER update_transactions_updated_at
                BEFORE UPDATE ON transactions
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        `)

        // Insert sample data
        console.log('Inserting sample data...')
        await pool.query('TRUNCATE TABLE transactions CASCADE;')

        for (const transaction of transactionsData.transactions) {
            await pool.query(
                `
                INSERT INTO transactions (
                    id,
                    user_id,
                    account_id,
                    type,
                    amount,
                    category,
                    description,
                    created_at,
                    withdrawal_date,
                    balance_after
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            `,
                [
                    transaction.id,
                    transaction.userId,
                    transaction.accountId,
                    transaction.type,
                    transaction.amount,
                    transaction.category,
                    transaction.description,
                    transaction.createdAt,
                    transaction.withdrawalDate,
                    transaction.balanceAfter
                ]
            )
            console.log(`Inserted transaction ${transaction.id}`)
        }

        // Verify data
        const verifyResult = await pool.query('SELECT COUNT(*) FROM transactions')
        console.log(
            `Setup complete. Total transactions: ${verifyResult.rows[0].count}`
        )

        const transactions = await pool.query('SELECT * FROM transactions')
        console.log('Inserted transactions:', transactions.rows)
    } catch (error) {
        console.error('Error setting up database:', error)
        throw error
    } finally {
        await database.disconnect()
    }
}

setupDatabase().catch(console.error) 