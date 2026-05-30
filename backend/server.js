const app     = require('./app');
const migrate = require('./migrate');

const PORT = process.env.PORT || 5173;

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
