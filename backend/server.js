const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5173;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'brand.db');

// щоб читати JSON з запитів
app.use(express.json());
app.use(cors());

// роздаємо статичні файли фронтенду (html, css, картинки)
app.use(express.static(path.join(__dirname, '../frontend')));

// всі маршрути API
app.use('/api/brand',   require('./routes/brand'));
app.use('/api/colors',  require('./routes/colors'));
app.use('/api/mockups', require('./routes/mockups'));
app.use('/api/slogans', require('./routes/slogans'));

// для будь-якого іншого шляху — повертаємо index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`Re:flect server running at http://localhost:${PORT}`);
});

module.exports = app;
