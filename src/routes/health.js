import express from 'express';
import { pool } from '../db/postgres.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ status: 'error', error: String(err) });
  }
});

export default router;
