# Transactions Subgraph

This subgraph handles transaction-related operations in the Fixa federated GraphQL API.

## Setup

### Prerequisites

- Node.js (>=14.0.0 <=20)
- npm (>=6.0.0)
- Google Cloud Platform account
- Cloud SQL PostgreSQL instance
- Google Cloud CLI
- Prisma ORM

### Installation

1. Install dependencies:

```bash
npm install
```

2. Install Google Cloud CLI:

```bash
# Mac
brew install google-cloud-sdk

# Other platforms
# Visit https://cloud.google.com/sdk/docs/install
```

### GCP Setup

1. Login to Google Cloud:

```bash
gcloud auth login
```

2. Set your project:

```bash
gcloud config set project YOUR_PROJECT_ID
```

3. Create Service Account:

- Go to GCP Console → IAM & Admin → Service Accounts
- Click "Create Service Account"
- Name: `fixa-transactions-service`
- Grant roles: "Cloud SQL Client"
- Click "Create Key" (JSON format)
- Download and save as `service-account.json` in project root

### Database Setup

1. Connect to your database using Cloud SQL Auth proxy:

```bash
# Download proxy
curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.1/cloud-sql-proxy.darwin.amd64

# Make executable
chmod +x cloud-sql-proxy

# Run proxy
./cloud-sql-proxy --credentials-file=./service-account.json INSTANCE_CONNECTION_NAME
```

2. Set up Prisma and database:

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Seed the database
npm run prisma:seed
```

### Environment Setup

Create a `.env` file:

```env

DB_USER=your-database-user
DB_NAME=your-database-name
DB_PASSWORD=your-database-password
INSTANCE_CONNECTION_NAME=your-project:region:instance-name
DATABASE_URL="postgresql://DB_USER:DB_PASSWORD@localhost:5432/DB_NAME?host=/cloudsql/INSTANCE_CONNECTION_NAME"

# For local development with Cloud SQL proxy
DATABASE_URL="postgresql://DB_USER:DB_PASSWORD@localhost:5432/DB_NAME"

GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
```

### Database Schema

The schema is managed by Prisma and defined in `prisma/schema.prisma`:

```prisma
model Transaction {
  id            String         @id
  userId        String
  accountId     String
  type          TransactionType
  amount        Decimal        @db.Decimal(15, 2)
  category      String?
  description   String?
  createdAt     DateTime       @default(now()) @db.Timestamptz
  withdrawalDate DateTime?     @db.Timestamptz
  balanceAfter  Decimal       @db.Decimal(15, 2)
  updatedAt     DateTime      @default(now()) @updatedAt @db.Timestamptz
}

enum TransactionType {
  DEPOSIT
  WITHDRAWAL
}
```

### Running the Service

1. Start the service:

```bash
npm start
```

2. The service will be available at `http://localhost:4002`

### Testing the Setup

1. Query a transaction:

```graphql
query {
    transaction(id: "txn-1") {
        id
        userId
        accountId
        type
        amount
        category
        description
    }
}
```

2. Create a transaction:

```graphql
mutation {
    createTransaction(
        input: {
            id: "txn-new"
            userId: "usr-1"
            accountId: "acc-1"
            type: DEPOSIT
            amount: 100.50
            category: "Salary"
            description: "Monthly salary deposit"
            balanceAfter: 1500.75
        }
    ) {
        id
        type
        amount
        balanceAfter
    }
}
```

## File Structure

```
subgraph-transactions/
├── config/
│   └── database.js         # Database configuration
├── datasources/
│   └── TransactionsAPI.js  # Transactions data source implementation
├── prisma/
│   ├── schema.prisma      # Prisma schema definition
│   └── seed.js            # Database seeding script
├── schema.graphql         # GraphQL schema
├── resolvers.js           # GraphQL resolvers
├── index.js               # Server entry point
└── .env                   # Environment variables
```

## Common Issues

1. **Connection Failed**

    - Check if Cloud SQL Auth proxy is running
    - Verify service account has correct permissions
    - Confirm instance connection name is correct

2. **Authentication Failed**

    - Verify DB_USER and DB_PASSWORD are correct
    - Check if user has proper database permissions

3. **ENUM Type Errors**
    - Ensure transaction_type ENUM exists in database
    - Check if ENUM values match schema definition

4. **Balance Calculation Issues**
    - Verify balance_after values are correctly calculated
    - Check decimal precision handling

## Security Notes

- Never commit `.env` or `service-account.json` to version control
- Keep Cloud SQL Auth proxy running for local development
- Regularly rotate database passwords and service account keys
- Ensure proper validation of transaction amounts and balances
- Implement proper authorization for transaction operations

## Transaction Types

The service supports two types of transactions:
- `DEPOSIT`: Incoming funds
- `WITHDRAWAL`: Outgoing funds

Each transaction maintains:
- Current balance after transaction
- Creation and update timestamps
- Optional withdrawal date for scheduled transactions

