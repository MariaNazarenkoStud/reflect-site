const express = require('express');
const router  = express.Router();
const db      = require('../db');

// всі замовлення (для адміна) з фільтром за статусом
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM orders';
    const params = [];
    if (status) {
      query += ' WHERE status=$1';
      params.push(status);
    }
    query += ' ORDER BY created_at DESC';
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// статистика замовлень
router.get('/stats', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT
        COUNT(*)                                        AS total,
        COUNT(*) FILTER (WHERE status='pending')        AS pending,
        COUNT(*) FILTER (WHERE status='confirmed')      AS confirmed,
        COUNT(*) FILTER (WHERE status='in_progress')    AS in_progress,
        COUNT(*) FILTER (WHERE status='done')           AS done,
        COUNT(*) FILTER (WHERE status='rejected')       AS rejected
      FROM orders
    `);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// нове замовлення (публічна форма)
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, material_description, product_type, quantity, notes } = req.body;
    if (!name || !email || !material_description || !product_type) {
      return res.status(400).json({ error: 'name, email, material_description and product_type are required' });
    }
    const { rows } = await db.query(
      `INSERT INTO orders (name, email, phone, material_description, product_type, quantity, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [name, email, phone, material_description, product_type, quantity || 1, notes]
    );
    res.status(201).json({ id: rows[0].id, message: 'Order received. We will contact you soon.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// змінити статус замовлення (для адміна)
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'in_progress', 'done', 'rejected'];
    if (!allowed.includes(status)) return res.status(400).json({ error: 'invalid status' });
    const { rowCount } = await db.query('UPDATE orders SET status=$1 WHERE id=$2', [status, req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// видалити замовлення
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await db.query('DELETE FROM orders WHERE id=$1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
