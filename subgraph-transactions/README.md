# Transactions Subgraph

This subgraph handles transaction-related operations in the Fixa federated GraphQL API.

## Setup

### Prerequisites

- Node.js (>=14.0.0 <=20)
- npm (>=6.0.0)
- Google Cloud Platform account
- Cloud SQL PostgreSQL instance
- Google Cloud CLI

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
- Grant roles:  "Cloud SQL Client"
- Click "Create Key" (JSON format)
- Download and save as `service-account.json` in project root

4. Get Cloud SQL Connection Info:

- Go to GCP Console → SQL
- Click on your instance
- Note the "Instance connection name"

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

2. Seed initial data:

```bash
npm run setup-db
```



### Environment Setup

Create a `.env` file:

```env
DB_USER=your-database-user
DB_NAME=your-database-name
DB_PASSWORD=your-database-password
INSTANCE_CONNECTION_NAME=your-project:region:instance-name
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
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
├── scripts/
│   └── setup-db.js         # Database setup script
├── schema.graphql          # GraphQL schema
├── resolvers.js            # GraphQL resolvers
├── index.js                # Server entry point
└── .env                    # Environment variables
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


This README includes:
1. All necessary setup steps
2. Database schema specific to transactions
3. Transaction-specific testing examples
4. Common issues related to transactions
5. Security considerations for financial data
6. Transaction type documentation


