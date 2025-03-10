# Algamit - Modern Banking API Implementations

![Algamit Logo](./assets/images/algamit-dark.png)

Algamit is a modern banking API built using a microservices architecture, providing a unified REST interface for banking operations. The system is composed of multiple microservices that handle different aspects of the banking system.

## Architecture Overview

The application uses a REST-based microservices architecture with the following components:

### Microservices
<!-- - **Users Service** (`localhost:3300`): Manages user profiles and authentication -->
- **Accounts Service** (`localhost:3100`): Handles bank account operations
- **Transactions Service** (`localhost:3200`): Processes financial transactions

### API Gateway
An API Gateway serves as the entry point (`localhost:3000`), routing requests to appropriate microservices.

## Prerequisites

- Node.js (>=14.0.0 <=20)
- npm (>=6.0.0)
- Google Cloud Platform account
- Cloud SQL PostgreSQL instance
- Google Cloud CLI

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/your-username/algamit.git
cd algamit
```

2. Set up each microservice:
```bash
# Install dependencies for all services
# cd users && yarn install
cd ../accounts && yarn install
cd ../transactions && yarn install
```

3. Create `.env` files in each service directory using their respective `.env.example` templates.

4. Start the services:
```bash
# Start services (in separate terminals)
# cd users && yarn dev
cd accounts && yarn dev
cd transactions && yarn dev

# Start the API gateway
cd gateway && yarn dev
```

## Detailed Setup

Each service has its own detailed setup instructions:
<!-- - [Users Service](./users/README.md) -->
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

<!-- ### Users Service (Coming soon)
- `GET /api/users` - List all users
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user -->

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

- Never commit `.env`  files
- Keep Cloud SQL Auth proxy running for local development
- Regularly rotate database passwords and service account keys
- Implement proper authorization for all operations
- Ensure proper validation of financial transactions

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [REST API Best Practices](https://restfulapi.net/)
- [Google Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)


