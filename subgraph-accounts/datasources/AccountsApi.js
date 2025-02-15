const database = require('../config/database');

class AccountsAPI {
  constructor() {
    this.db = database;
  }

  async getAllAccounts() {
    try {
      const pool = this.db.getPool();
      console.log('Fetching all accounts');
      
      const result = await pool.query('SELECT * FROM accounts');
      console.log('Found', result.rowCount, 'accounts');
      
      return result.rows;
    } catch (error) {
      console.error('Error in getAllAccounts:', error.message);
      throw error;
    }
  }

  async getAccount(id) {
    try {
      const pool = this.db.getPool();
      console.log('Database pool obtained');
      console.log('Executing query for account ID:', id);
      
      const query = 'SELECT * FROM accounts WHERE id = $1';
      console.log('Query:', query);
      
      const result = await pool.query(query, [id]);
      console.log('Query executed. Row count:', result.rowCount);
      console.log('Result rows:', JSON.stringify(result.rows, null, 2));
      
      return result.rows[0];
    } catch (error) {
      console.error('Error in getAccount:', error.message);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  async getAccountsByType(accountType) {
    const pool = this.db.getPool();
    const result = await pool.query('SELECT * FROM accounts WHERE account_type = $1', [accountType]);
    return result.rows;
  }

  async getAccountsByStatus(status) {
    const pool = this.db.getPool();
    const result = await pool.query('SELECT * FROM accounts WHERE status = $1', [status]);
    return result.rows;
  }

  async getTransactionsForAccount(accountId) {
    // This will be handled by the transactions subgraph
    return [];
  }
}

module.exports = AccountsAPI;
