const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');

// GET all debtors
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT d.id, d.customer_name, d.advance_date, d.advance_amount, p.project_name, p.project_no FROM Debtors d LEFT JOIN projects p ON d.project_id = p.id');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching debtors:', err);
    res.status(500).send(err.message);
  }
});

// POST a new debtor
router.post('/', 
  body('customer_name').notEmpty().withMessage('Customer name is required'),
  body('advance_date').notEmpty().isDate().withMessage('Advance date is required and must be a valid date'),
  body('advance_amount').optional({ nullable: true }).isDecimal().withMessage('Advance amount must be a decimal'),
  body('project_id').optional({ nullable: true }).isUUID().withMessage('Project ID must be a valid UUID'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { customer_name, advance_date, advance_amount, project_id } = req.body;
    try {
      const id = uuidv4();
      await query(
        'INSERT INTO Debtors (id, customer_name, advance_date, advance_amount, project_id) VALUES ($1, $2, $3, $4, $5)',
        [id, customer_name, advance_date, advance_amount, project_id]
      );
      res.status(201).send('Debtor created');
    } catch (err) {
      res.status(500).send(err.message);
    }
});

// PUT to update a debtor
router.put('/:id', 
  body('customer_name').notEmpty().withMessage('Customer name is required'),
  body('advance_date').notEmpty().isDate().withMessage('Advance date is required and must be a valid date'),
  body('advance_amount').optional({ nullable: true }).isDecimal().withMessage('Advance amount must be a decimal'),
  body('project_id').optional({ nullable: true }).isUUID().withMessage('Project ID must be a valid UUID'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { customer_name, advance_date, advance_amount, project_id } = req.body;
    try {
      await query(
        'UPDATE Debtors SET customer_name = $1, advance_date = $2, advance_amount = $3, project_id = $4 WHERE id = $5',
        [customer_name, advance_date, advance_amount, project_id, id]
      );
      res.status(200).send('Debtor updated');
    } catch (err) {
      res.status(500).send(err.message);
    }
});

// DELETE a debtor
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM Debtors WHERE id = $1', [id]);
    res.status(200).send('Debtor deleted');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;