const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const migrate  = require('./migrate');

const app  = express();
const PORT = process.env.PORT || 5173;

app.use(express.json());
app.use(cors());

// роздаємо статичні файли фронтенду
app.use(express.static(path.join(__dirname, '../frontend')));

// всі маршрути API
app.use('/api/auth',    require('./routes/auth'));
app.use('/api/brand',   require('./routes/brand'));
app.use('/api/colors',  require('./routes/colors'));
app.use('/api/mockups', require('./routes/mockups'));
app.use('/api/slogans', require('./routes/slogans'));
app.use('/api/orders',  require('./routes/orders'));

// /admin → адмін-панель
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin.html'));
});

// для решти шляхів — index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// спочатку мігруємо базу, потім запускаємо сервер
migrate()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Re:flect running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Startup error:', err.message);
    process.exit(1);
  });

module.exports = app;
