require('dotenv').config();
const { logger } = require('../utils/logger');
const postService = require('../services/post.service');
const userConfigService = require('../services/userConfig.service');
const linkedinService = require('../services/linkedin.service');

/**
 * API handler for scheduled posts - Vercel serverless function
 * This will be called by Vercel's cron job scheduler
 */
module.exports = async (req, res) => {
  try {
    logger.info('Running scheduled post via Vercel cron');
    
    // Get the latest user configuration
    const userConfig = await userConfigService.getUserConfig();
    
    // Select a random topic from the user's preferred topics
    const randomTopic = userConfig.topics[Math.floor(Math.random() * userConfig.topics.length)];
    
    // Generate the post
    const postDraft = await postService.generatePost(randomTopic, userConfig);
    
    logger.info(`Scheduled post generated on topic: ${randomTopic}`);
    
    // Publish the post if auto-publishing is enabled
    if (process.env.AUTO_PUBLISH === 'true') {
      const result = await linkedinService.publishPost(postDraft);
      logger.info('Scheduled post published automatically', { postId: result.id });
      
      return res.status(200).json({
        success: true,
        message: 'Post generated and published successfully',
        topic: randomTopic,
        postId: result.id
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Post generated successfully (not published - AUTO_PUBLISH is disabled)',
      topic: randomTopic
    });
    
  } catch (error) {
    logger.error(`Error in scheduled post endpoint: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};