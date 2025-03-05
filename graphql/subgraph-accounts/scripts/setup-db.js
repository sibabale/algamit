const database = require('../config/database');
const accountsData = require('../datasources/accounts_data.json');

async function setupDatabase() {
    try {
        console.log('Starting database setup...');
        await database.connect();
        const pool = database.getPool();

        // Create ENUM types
        console.log('Creating ENUM types...');
        await pool.query(`
            DO $$ BEGIN
                CREATE TYPE account_type AS ENUM ('SAVINGS', 'CURRENT', 'FIXED_DEPOSIT');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        await pool.query(`
            DO $$ BEGIN
                CREATE TYPE account_status AS ENUM ('ACTIVE', 'FROZEN', 'CLOSED', 'INACTIVE');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        // Create accounts table
        console.log('Creating accounts table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS accounts (
                id VARCHAR(50) PRIMARY KEY,
                account_number VARCHAR(50) UNIQUE NOT NULL,
                account_type account_type NOT NULL,
                balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
                date_opened DATE NOT NULL DEFAULT CURRENT_DATE,
                status account_status NOT NULL DEFAULT 'ACTIVE',
                owner_id VARCHAR(50) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Insert sample data
        console.log('Inserting sample data...');
        await pool.query('TRUNCATE TABLE accounts CASCADE;');

        for (const account of accountsData.accounts) {
            await pool.query(`
                INSERT INTO accounts (
                    id, 
                    account_number, 
                    account_type, 
                    balance, 
                    date_opened, 
                    status, 
                    owner_id
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
                account.id,
                account.accountNumber,
                account.accountType,
                account.balance,
                account.dateOpened,
                account.status,
                account.ownerId
            ]);
            console.log(`Inserted account ${account.id}`);
        }

        // Verify data
        const verifyResult = await pool.query('SELECT COUNT(*) FROM accounts');
        console.log(`Setup complete. Total accounts: ${verifyResult.rows[0].count}`);

        const accounts = await pool.query('SELECT * FROM accounts ORDER BY id');
        console.log('Inserted accounts:', accounts.rows);

    } catch (error) {
        console.error('Error setting up database:', error);
        throw error;
    } finally {
        await database.disconnect();
    }
}

setupDatabase().catch(console.error); 