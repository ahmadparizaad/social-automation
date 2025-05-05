const express = require('express');
const postRoutes = require('./post.routes');
const authRoutes = require('./auth.routes');

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Post-related routes
router.use('/posts', postRoutes);

// Authentication routes
router.use('/auth', authRoutes);

module.exports = router; 