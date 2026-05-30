const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api/auth',    require('./routes/auth'));
app.use('/api/brand',   require('./routes/brand'));
app.use('/api/colors',  require('./routes/colors'));
app.use('/api/mockups', require('./routes/mockups'));
app.use('/api/slogans', require('./routes/slogans'));
app.use('/api/orders',  require('./routes/orders'));

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

module.exports = app;
