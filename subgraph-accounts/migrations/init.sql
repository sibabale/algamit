CREATE TYPE account_type AS ENUM ('SAVINGS', 'CURRENT', 'FIXED_DEPOSIT');
CREATE TYPE account_status AS ENUM ('ACTIVE', 'FROZEN', 'CLOSED', 'INACTIVE');

CREATE TABLE accounts (
    id VARCHAR(50) PRIMARY KEY,
    account_number VARCHAR(50) UNIQUE NOT NULL,
    account_type account_type NOT NULL,
    balance DECIMAL(15,2) NOT NULL,
    date_opened DATE NOT NULL,
    status account_status NOT NULL,
    owner_id VARCHAR(50) NOT NULL
);

-- Insert sample data
INSERT INTO accounts (id, account_number, account_type, balance, date_opened, status, owner_id)
VALUES 
    ('acc-1', '1001-2345-6789', 'SAVINGS', 5000.50, '2024-01-15', 'ACTIVE', 'usr-1'),
    ('acc-2', '1001-2345-6790', 'CURRENT', 25000.75, '2023-11-20', 'ACTIVE', 'usr-3'),
    ('acc-3', '1001-2345-6791', 'FIXED_DEPOSIT', 100000.00, '2024-02-01', 'ACTIVE', 'usr-2'),
    ('acc-4', '1001-2345-6792', 'SAVINGS', 100.25, '2023-08-10', 'INACTIVE', 'usr-4'),
    ('acc-5', '1001-2345-6793', 'CURRENT', 0.00, '2023-05-15', 'CLOSED', 'usr-5'); 