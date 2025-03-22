# Algamit - Modern Banking API Implementations

![Algamit Logo](./assets/images/algamit-dark.png)

Algamit is a modern banking API built using a microservices architecture, providing a unified REST interface for banking operations. The system is composed of multiple microservices that handle different aspects of the banking system.

## Architecture Overview

The application uses a REST-based microservices architecture with the following components:

### Microservices
- **Accounts Service** (`localhost:3100`): Handles bank account operations
- **Transactions Service** (`localhost:3200`): Processes financial transactions

### API Gateway
An API Gateway serves as the entry point (`localhost:3000`), routing requests to appropriate microservices.

## Prerequisites

- Node.js (>=14.0.0 <=20)
- npm (>=6.0.0) or yarn
- Google Cloud Platform account
- Cloud SQL PostgreSQL instance
- Google Cloud CLI
- Docker

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/your-username/algamit.git
cd algamit/rest
```

2. Set up each microservice:
```bash
# Install dependencies for all services
cd accounts && yarn install
cd ../transactions && yarn install
cd ../gateway && yarn install
cd ../ && yarn install  # Install root dependencies including PM2
```

3. Create `.env` files in each service directory using their respective `.env.example` templates.


## Database Setup

### Prerequisites
- Supabase account or PostgreSQL database
- Database connection strings (pooled and direct URLs)

### Setting up Databases

Each microservice (accounts, transactions) has its own database. Follow these steps for each service:

1. **Set Environment Variables**
```bash
# In service/.env file
DATABASE_URL="postgresql://user:password@host:6543/db?pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:5432/db"
```

2. **Initialize Database**
```bash
# Navigate to service directory
cd accounts  # or cd transactions

# Reset database (if needed)
npx prisma migrate reset --force

# Apply migrations
npx prisma migrate deploy

# Seed database
npx prisma db seed
```

### Troubleshooting Database Setup

If you encounter migration issues:

1. **Reset Database State**
```bash
# Force reset database
npx prisma db push --force-reset
```

2. **Create Baseline Migration**
```bash
# Create migration from current state
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > baseline.sql

# Apply baseline
npx prisma migrate reset --force
npx prisma migrate resolve --applied "init"
```

3. **Verify Database State**
```bash
# Check database status
npx prisma db pull
```

[... rest of existing content ...]

## Running Services

### Development Mode (Individual Services)
```bash
# Start services (in separate terminals)
cd accounts && yarn dev
cd transactions && yarn dev
cd gateway && yarn dev
```

### Production Mode (Using PM2)
From the root directory:
```bash
# Start all services
yarn start

# Other PM2 commands
yarn stop      # Stop all services
yarn restart   # Restart all services
yarn status    # Check services status
yarn logs      # View logs
yarn monit     # Monitor services
yarn delete    # Remove services from PM2
```

## Deployment

### Docker Deployment
Build and push Docker images to Google Container Registry:
```bash
# Authenticate with Google Cloud
yarn docker:publish
```

### GCP Cloud Run Deployment
Deploy services to Google Cloud Run:
```bash
# Deploy all services
yarn deploy
```

## Detailed Setup

Each service has its own detailed setup instructions:
- [Accounts Service](./accounts/README.md)
- [Transactions Service](./transactions/README.md)

## API Examples

### Get User with Accounts
```http
GET /api/accounts/{accountNumber}
```

Response:
```json
{
    "success": true,
    "data": {
        "id": "3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r",
        "status": "ACTIVE",
        "balance": "3000",
        "ownerId": "a5f151a6-af2e-49c9-b11e-3122ad120e08",
        "createdAt": "2025-03-08T15:29:17.614Z",
        "updatedAt": "2025-03-08T15:29:17.614Z",
        "accountType": "FIXED_DEPOSIT",
        "dateOpened": "2024-03-08T00:00:00.000Z",
        "accountNumber": "acc-3456-7890-1234"
    }
}
```

## API Endpoints

### Accounts Service
- `GET /api/accounts` - List all accounts
- `GET /api/accounts/{id}` - Get account by ID
- `POST /api/accounts` - Create new account
- `PUT /api/accounts/{id}` - Update account
- `DELETE /api/accounts/{id}` - Close account

### Transactions Service
- `GET /api/transactions` - List all transactions
- `GET /api/transactions/{id}` - Get transaction by ID
- `POST /api/transactions` - Create new transaction
- `GET /api/accounts/{id}/transactions` - Get transactions for account (Coming soon)

## Security Notes

- Never commit `.env` files
- Keep Cloud SQL Auth proxy running for local development
- Regularly rotate database passwords and service account keys
- Implement proper authorization for all operations
- Ensure proper validation of financial transactions

## Deployment Notes

### Local Deployment
- PM2 manages all microservices locally
- Each service runs in its own process
- Services auto-restart on failure
- Logs are centrally managed

### Cloud Deployment
- Services run as containers on Cloud Run
- Each service scales independently
- Region: africa-south1 (Johannesburg)
- Public access enabled (configurable)

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [REST API Best Practices](https://restfulapi.net/)
- [Google Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)