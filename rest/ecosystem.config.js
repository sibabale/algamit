module.exports = {
  apps: [
    {
      name: 'transactions-service',
      cwd: './transactions',
      script: 'yarn dev',
      watch: true,
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'accounts-service',
      cwd: './accounts',
      script: 'yarn dev',
      watch: true,
      env: {
        NODE_ENV: 'development',
        PORT: 3002
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3002
      }
    },
    {
      name: 'gateway-service',
      cwd: './gateway',
      script: 'yarn dev',
      watch: true,
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        TRANSACTIONS_SERVICE_URL: 'http://localhost:3001',
        ACCOUNTS_SERVICE_URL: 'http://localhost:3002'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        TRANSACTIONS_SERVICE_URL: 'http://localhost:3001',
        ACCOUNTS_SERVICE_URL: 'http://localhost:3002'
      }
    }
  ]
}; 