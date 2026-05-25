const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../db');

// куди зберігати завантажені файли
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../frontend/images'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + file.originalname;
    cb(null, unique);
  }
});
const upload = multer({ storage });

// всі мокапи
router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM mockups').all());
});

// один мокап
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM mockups WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json(row);
});

// додати мокап (з файлом)
router.post('/', upload.single('image'), (req, res) => {
  const { title, category } = req.body;
  if (!title || !req.file) return res.status(400).json({ error: 'title and image are required' });
  const imagePath = 'images/' + req.file.filename;
  const result = db.prepare('INSERT INTO mockups (title, image_path, category) VALUES (?, ?, ?)').run(title, imagePath, category);
  res.status(201).json({ id: result.lastInsertRowid });
});

// оновити мокап
router.put('/:id', (req, res) => {
  const { title, category } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });
  const result = db.prepare('UPDATE mockups SET title=?, category=? WHERE id=?').run(title, category, req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true });
});

// видалити мокап
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM mockups WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true });
});

module.exports = router;
