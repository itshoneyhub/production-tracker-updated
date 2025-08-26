const express = require('express');
const router = express.Router();
const { query } = require('../db');

// GET monthly aggregated advances for debtors and creditors
router.get('/summary', async (req, res) => {
  try {
    const debtorSummary = await query(`
      SELECT
        TO_CHAR(advance_date, 'YYYY-MM') AS month,
        SUM(advance_amount) AS total_amount
      FROM Debtors
      GROUP BY TO_CHAR(advance_date, 'YYYY-MM')
      ORDER BY month
    `);

    const creditorSummary = await query(`
      SELECT
        TO_CHAR(advance_date, 'YYYY-MM') AS month,
        SUM(advance_amount) AS total_amount
      FROM Creditors
      GROUP BY TO_CHAR(advance_date, 'YYYY-MM')
      ORDER BY month
    `);

    res.json({
      debtors: debtorSummary.rows,
      creditors: creditorSummary.rows,
    });
  } catch (err) {
    console.error('Error fetching advances summary:', err);
    res.status(500).send(err.message);
  }
});

// GET detailed advances for a specific month and type
router.get('/details', async (req, res) => {
  const { month, year, type } = req.query;

  if (!month || !year || !type) {
    return res.status(400).json({ error: 'Month, year, and type are required.' });
  }

  const datePrefix = `${year}-${month.padStart(2, '0')}`;
  let tableName;

  if (type === 'debtor') {
    tableName = 'Debtors';
  } else if (type === 'creditor') {
    tableName = 'Creditors';
  } else {
    return res.status(400).json({ error: 'Invalid type. Must be "debtor" or "creditor".' });
  }

  try {
    const result = await query(`
      SELECT
        t.id,
        p.projectNo,
        p.projectName,
        p.customerName,
        t.advance_date,
        t.advance_amount
      FROM ${tableName} t
      JOIN Projects p ON t.project_id = p.id
      WHERE TO_CHAR(t.advance_date, 'YYYY-MM') = $1
      ORDER BY t.advance_date DESC
    `, [datePrefix]);
    res.json(result.rows);
  } catch (err) {
    console.error(`Error fetching ${type} details for ${datePrefix}:`, err);
    res.status(500).send(err.message);
  }
});

module.exports = router;
