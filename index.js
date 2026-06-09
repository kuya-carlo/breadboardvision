require('dotenv').config();
const express = require('express');
const path = require('path');
const apiRoutes = require('./routes/api');
const healthRoutes = require('./routes/health');
const { initDb } = require('./db/init');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Serve static frontend assets
app.use(express.static(path.join(__dirname, 'public')));

// Set up routes
app.use('/api', apiRoutes);
app.use('/health', healthRoutes);

// Fallback to index.html for SPA frontend routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (require.main === module) {
  // Initialize database and then start server
  initDb()
    .then(() => {
      app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
      });
    })
    .catch((err) => {
      console.error('Failed to start server due to database initialization error:', err);
      process.exit(1);
    });
}

module.exports = app; // For testing purposes
