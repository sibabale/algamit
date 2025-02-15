const database = require('../config/database')
const usersData = require('../datasources/users_data.json')

async function setupDatabase() {
    try {
        console.log('Starting users database setup...')
        await database.connect()
        const pool = database.getPool()

        // Create ENUM type for user status
        console.log('Creating ENUM types...')
        await pool.query(`
            DO $$ BEGIN
                CREATE TYPE user_status AS ENUM (
                    'ACTIVE',
                    'INACTIVE',
                    'PENDING_VERIFICATION',
                    'SUSPENDED'
                );
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `)

        // Create users table
        console.log('Creating users table...')
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(50) PRIMARY KEY,
                full_name VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                phone_number VARCHAR(20),
                date_of_birth DATE,
                street VARCHAR(255),
                city VARCHAR(100),
                state VARCHAR(50),
                postal_code VARCHAR(20),
                country VARCHAR(100),
                status user_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                last_login_at TIMESTAMP WITH TIME ZONE,
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

            DROP TRIGGER IF EXISTS update_users_updated_at ON users;
            
            CREATE TRIGGER update_users_updated_at
                BEFORE UPDATE ON users
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        `)

        // Insert sample data
        console.log('Inserting sample data...')
        await pool.query('TRUNCATE TABLE users CASCADE;')

        for (const user of usersData.users) {
            await pool.query(
                `
                INSERT INTO users (
                    id,
                    full_name,
                    email,
                    phone_number,
                    date_of_birth,
                    street,
                    city,
                    state,
                    postal_code,
                    country,
                    status,
                    created_at,
                    last_login_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            `,
                [
                    user.id,
                    user.fullName,
                    user.email,
                    user.phoneNumber,
                    user.dateOfBirth,
                    user.address.street,
                    user.address.city,
                    user.address.state,
                    user.address.postalCode,
                    user.address.country,
                    user.status,
                    user.createdAt,
                    user.lastLoginAt,
                ]
            )
            console.log(`Inserted user ${user.id}`)
        }

        // Verify data
        const verifyResult = await pool.query('SELECT COUNT(*) FROM users')
        console.log(
            `Setup complete. Total users: ${verifyResult.rows[0].count}`
        )

        const users = await pool.query('SELECT * FROM users')
        console.log('Inserted users:', users.rows)
    } catch (error) {
        console.error('Error setting up database:', error)
        throw error
    } finally {
        await database.disconnect()
    }
}

setupDatabase().catch(console.error)
