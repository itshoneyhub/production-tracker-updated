import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

import { connectDB, getPool } from './backend/db.js';

async function queryProjects() {
  try {
    await connectDB(); // Initialize the connection pool
    const pool = getPool();
    const result = await pool.request().query('SELECT * FROM Projects');
    console.log(JSON.stringify(result.recordset, null, 2));
  } catch (err) {
    console.error('Error querying Projects table:', err);
  } finally {
    // Close the pool connection after the query
    if (getPool().connected) {
      getPool().close();
    }
  }
}

queryProjects();