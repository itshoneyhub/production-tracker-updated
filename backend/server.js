
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { poolPromise } = require('./db');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// API routes
const projectsRouter = require('./routes/projects');
const stagesRouter = require('./routes/stages');
const debtorsRouter = require('./routes/debtors');
const creditorsRouter = require('./routes/creditors');
const advancesDashboardRouter = require('./routes/advancesDashboard');

app.use('/api/projects', projectsRouter);
app.use('/api/stages', stagesRouter);
app.use('/api/debtors', debtorsRouter);
app.use('/api/creditors', creditorsRouter);
app.use('/api/advances', advancesDashboardRouter);

// Test DB connection
app.get('/api/test-db', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.query('SELECT 1 AS number');
    res.json(result.rows);
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).send({ message: err.message });
  }
});

// Serve frontend
app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

app.use((err, req, res) => {
  console.error('Unhandled backend error:', err);
  res.status(500).send({ message: 'An unexpected error occurred on the server.' });
});

app.listen(PORT, () => {
  console.log(`Server starting on port ${PORT}`);
});
