const express = require('express');
const router = express.Router();
const { db } = require('../db/init');

router.get('/', (req, res) => {
  // Check if database is accessible
  db.get('SELECT 1', [], (err) => {
    if (err) {
      return res.status(500).json({ status: 'error', database: 'disconnected', details: err.message });
    }
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime()
    });
  });
});

module.exports = router;
