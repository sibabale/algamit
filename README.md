# Fixa - Federated Banking API

Fixa is a modern banking API built using Apollo Federation, providing a unified GraphQL interface for banking operations. The system is composed of multiple microservices (subgraphs) that handle different aspects of the banking system.

## Architecture Overview

The application uses a federated GraphQL architecture with the following components:

### Subgraphs
- **Users** (`localhost:4003`): Manages user profiles and authentication
- **Accounts** (`localhost:4001`): Handles bank account operations
- **Transactions** (`localhost:4002`): Processes financial transactions

### Gateway
Apollo Router serves as the gateway (`localhost:4000`), combining all subgraphs into a unified API.

## Prerequisites

- Node.js (>=14.0.0 <=20)
- npm (>=6.0.0)
- Google Cloud Platform account
- Cloud SQL PostgreSQL instance
- Google Cloud CLI
- Apollo Router

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/your-username/fixa.git
cd fixa
```

2. Set up each subgraph:
```bash
# Install dependencies for all subgraphs
cd subgraph-users && npm install
cd ../subgraph-accounts && npm install
cd ../subgraph-transactions && npm install
```

3. Set up the Apollo Router:
```bash
# Download router binary (Mac Apple Silicon)
curl -sSL https://router.apollo.dev/download/nix/latest | sh

# Make executable
chmod +x router
```

4. Create `.env` files in each subgraph directory using their respective `.env.example` templates.

5. Start the services:
```bash
# Start subgraphs (in separate terminals)
cd subgraph-users && npm start
cd subgraph-accounts && npm start
cd subgraph-transactions && npm start

# Start the router
./router
```

## Detailed Setup

Each subgraph has its own detailed setup instructions:
- [Users Subgraph](./subgraph-users/README.md)
- [Accounts Subgraph](./subgraph-accounts/README.md)
- [Transactions Subgraph](./subgraph-transactions/README.md)

## Database Schema

### Users
```sql
CREATE SCHEMA users;
CREATE TABLE users.users (
    id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    date_of_birth DATE,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    last_login_at TIMESTAMP,
    street VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(100)
);
```

### Accounts
```sql
CREATE TYPE account_type AS ENUM ('SAVINGS', 'CURRENT', 'FIXED_DEPOSIT');
CREATE TYPE account_status AS ENUM ('ACTIVE', 'FROZEN', 'CLOSED', 'INACTIVE');

CREATE TABLE accounts (
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
```

### Transactions
```sql
CREATE TYPE transaction_type AS ENUM ('DEPOSIT', 'WITHDRAWAL');

CREATE TABLE transactions (
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
```

## API Examples

### Query User with Accounts
```graphql
query GetUserWithAccounts($userId: ID!) {
  user(id: $userId) {
    id
    fullName
    email
    accounts {
      id
      accountNumber
      balance
      transactions {
        id
        amount
        type
      }
    }
  }
}
```

## Security Notes

- Never commit `.env` or `service-account.json` files
- Keep Cloud SQL Auth proxy running for local development
- Regularly rotate database passwords and service account keys
- Implement proper authorization for all operations
- Ensure proper validation of financial transactions

## Resources

- [Apollo Federation Documentation](https://www.apollographql.com/docs/federation/)
- [Apollo Router Documentation](https://www.apollographql.com/docs/router/)
- [Google Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)


