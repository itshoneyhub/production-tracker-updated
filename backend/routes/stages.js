const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');

// GET all stages
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM Stages');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching stages:', err);
    res.status(500).send(err.message);
  }
});

// GET a single stage by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM Stages WHERE id = $1', [req.params.id]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).send('Stage not found');
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// POST a new stage
router.post('/', 
  body('name').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.body) {
      return res.status(400).send('Request body is missing.');
    }
    const { name, remarks } = req.body;
    try {
      const id = req.body.id || uuidv4();
      await query('INSERT INTO Stages (id, name, remarks) VALUES ($1, $2, $3)', [id, name, remarks]);
      res.status(201).send('Stage created');
    } catch (err) {
      res.status(500).send(err.message);
    }
});

// PUT (update) a stage
router.put('/:id', 
  body('name').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.body) {
      return res.status(400).send('Request body is missing.');
    }
    const { name, remarks } = req.body;
    try {
      const result = await query('UPDATE Stages SET name = $1, remarks = $2 WHERE id = $3', [name, remarks, req.params.id]);
      if (result.rowCount > 0) {
        res.send('Stage updated');
      } else {
        res.status(404).send('Stage not found');
      }
    } catch (err) {
      res.status(500).send(err.message);
    }
});

// DELETE a stage
router.delete('/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM Stages WHERE id = $1', [req.params.id]);
    if (result.rowCount > 0) {
      res.send('Stage deleted');
    }
    else {
      res.status(404).send('Stage not found');
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;