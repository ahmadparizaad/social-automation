const express = require('express');
const postController = require('../controllers/post.controller');

const router = express.Router();

// Route to generate a post draft
router.post('/generate', postController.generatePost);

// Route to get feedback and refine a post
router.post('/refine', postController.refinePost);

// Route to publish a post to LinkedIn
router.post('/publish', postController.publishPost);

// Route to get engagement metrics for a post
router.get('/engagement/:postId', postController.getPostEngagement);

// Route to get LinkedIn authorization URL
router.get('/linkedin-auth', postController.getLinkedInAuthUrl);

// Route to get user configuration
router.get('/config', postController.getUserConfig);

// Route to update user configuration
router.put('/config', postController.updateUserConfig);

module.exports = router; 