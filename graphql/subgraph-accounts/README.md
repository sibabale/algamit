# Accounts Subgraph

This subgraph handles account-related operations in the Fixa federated GraphQL API.

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
- Name: `fixa-accounts-service`
- Grant role: "Cloud SQL Client"
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

DB_NAME=accounts
DB_USER=your-database-user
DB_PASSWORD=your-database-password
INSTANCE_CONNECTION_NAME=your-project:region:instance-name
# For Cloud SQL with Unix socket
DATABASE_URL="postgresql://DB_USER:DB_PASSWORD@localhost:5432/DB_NAME?host=/cloudsql/INSTANCE_CONNECTION_NAME"

# For local development with Cloud SQL proxy
DATABASE_URL="postgresql://DB_USER:DB_PASSWORD@localhost:5432/DB_NAME"

GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
```

### Database Schema

The schema is managed by Prisma and defined in `prisma/schema.prisma`:

```prisma
model Account {
  id            String       @id @default(uuid())
  accountNumber String       @unique @default(uuid())
  accountType   AccountType  @default(SAVINGS)
  balance       Decimal      @db.Decimal(15, 2) @default(0)
  dateOpened    DateTime     @default(now()) @db.Date
  status        AccountStatus @default(ACTIVE)
  ownerId       String       @default("default-owner")
  createdAt     DateTime     @default(now()) @db.Timestamptz
  updatedAt     DateTime     @default(now()) @updatedAt @db.Timestamptz
}

enum AccountType {
  SAVINGS
  CURRENT
  FIXED_DEPOSIT
}

enum AccountStatus {
  ACTIVE
  FROZEN
  CLOSED
  INACTIVE
}
```

### Running the Service

1. Start the service:

```bash
npm start
```

2. The service will be available at `http://localhost:4002`

### Testing the Setup

1. Query an account:

```graphql
query {
    account(id: "acc-1") {
        id
        accountNumber
        accountType
        balance
        status
        owner {
            id
        }
    }
}
```

2. Query all accounts:

```graphql
query {
    accounts {
        id
        accountNumber
        accountType
        balance
        status
        dateOpened
        owner {
            id
        }
    }
}
```

## File Structure

```
subgraph-accounts/
├── config/
│   └── database.js     # Database configuration
├── datasources/
│   └── AccountsApi.js  # Account data source implementation
├── prisma/
│   ├── schema.prisma   # Prisma schema definition
│   └── seed.js         # Database seeding script
├── accounts.graphql    # GraphQL schema
├── resolvers.js        # GraphQL resolvers
├── index.js            # Server entry point
└── .env                # Environment variables
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
    - Ensure account_type and account_status ENUMs exist in database
    - Values must match exactly: 'SAVINGS', 'CURRENT', 'FIXED_DEPOSIT' for account_type
    - Values must match exactly: 'ACTIVE', 'FROZEN', 'CLOSED', 'INACTIVE' for account_status

## Security Notes

- Never commit `.env` or `service-account.json` to version control
- Keep Cloud SQL Auth proxy running for local development
- Regularly rotate database passwords and service account keys
- Ensure proper access controls for account data
- Implement proper balance manipulation safeguards

## Federation Notes

This subgraph is part of a federated GraphQL API and:
- Provides account data to other services
- References the User type from the users subgraph
- Will be referenced by the transactions subgraph
