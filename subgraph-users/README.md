# Users Subgraph

This subgraph handles user-related operations in the Fixa federated GraphQL API.

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
- Name: `fixa-users-service`
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

2. Create schema and tables (using DataGrip or psql):

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

### Environment Setup

Create a `.env` file:

```env
INSTANCE_CONNECTION_NAME=your-project:region:instance-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
```

### Running the Service

1. Start the service:

```bash
npm start
```

2. The service will be available at `http://localhost:4003`

### Testing the Setup

1. Query a user:

```graphql
query {
    user(id: "usr-1") {
        id
        fullName
        email
        status
    }
}
```

2. Create a user:

```graphql
mutation {
    createUser(
        input: {
            fullName: "Test User"
            email: "test@example.com"
            phoneNumber: "+1234567890"
            dateOfBirth: "1990-01-01"
            address: {
                street: "123 Test St"
                city: "Test City"
                state: "TS"
                postalCode: "12345"
                country: "USA"
            }
        }
    ) {
        code
        success
        message
        user {
            id
            fullName
        }
    }
}
```

## File Structure

```
subgraph-users/
├── config/
│   └── database.js     # Database configuration
├── datasources/
│   └── UsersApi.js     # User data source implementation
├── users.graphql       # GraphQL schema
├── resolvers.js        # GraphQL resolvers
├── index.js           # Server entry point
└── .env               # Environment variables
```

## Common Issues

1. **Connection Failed**

    - Check if Cloud SQL Auth proxy is running
    - Verify service account has correct permissions
    - Confirm instance connection name is correct

2. **Authentication Failed**

    - Verify DB_USER and DB_PASSWORD are correct
    - Check if user has proper database permissions

3. **Schema Not Found**
    - Confirm schema 'users' exists in database
    - Check if database user has access to schema

## Security Notes

- Never commit `.env` or `service-account.json` to version control
- Keep Cloud SQL Auth proxy running for local development
- Regularly rotate database passwords and service account keys
