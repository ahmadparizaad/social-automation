const { logger } = require('../utils/logger');
const postService = require('../services/post.service');
const userConfigService = require('../services/userConfig.service');
const linkedinService = require('../services/linkedin.service');

/**
 * Generate a LinkedIn post draft based on user configuration
 */
const generatePost = async (req, res, next) => {
  try {
    const { topic, additionalContext } = req.body;
    const userConfig = await userConfigService.getUserConfig();

    logger.info(`Generating post draft on topic: ${topic}`);
    
    const postDraft = await postService.generatePost(topic, userConfig, additionalContext);
    
    res.status(200).json({
      success: true,
      data: postDraft
    });
  } catch (error) {
    logger.error(`Error generating post: ${error.message}`);
    next(error);
  }
};

/**
 * Refine a post draft based on user feedback
 */
const refinePost = async (req, res, next) => {
  try {
    const { postDraft, feedback } = req.body;
    
    logger.info(`Refining post based on user feedback`);
    
    const refinedPost = await postService.refinePost(postDraft, feedback);
    
    res.status(200).json({
      success: true,
      data: refinedPost
    });
  } catch (error) {
    logger.error(`Error refining post: ${error.message}`);
    next(error);
  }
};

/**
 * Publish a finalized post to LinkedIn
 */
const publishPost = async (req, res, next) => {
  try {
    const { finalizedPost, accessToken } = req.body;
    
    logger.info(`Publishing post to LinkedIn`);
    
    // Use provided access token if available, otherwise use the default from env
    const publishResult = await linkedinService.publishPost(finalizedPost, accessToken);
    
    res.status(200).json({
      success: true,
      data: publishResult
    });
  } catch (error) {
    logger.error(`Error publishing post: ${error.message}`);
    next(error);
  }
};

/**
 * Get post engagement metrics
 */
const getPostEngagement = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { accessToken } = req.query;
    
    logger.info(`Getting engagement metrics for post: ${postId}`);
    
    const metrics = await linkedinService.getPostEngagement(postId, accessToken);
    
    res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error(`Error getting post engagement: ${error.message}`);
    next(error);
  }
};

/**
 * Get user configuration
 */
const getUserConfig = async (req, res, next) => {
  try {
    const userConfig = await userConfigService.getUserConfig();
    
    res.status(200).json({
      success: true,
      data: userConfig
    });
  } catch (error) {
    logger.error(`Error getting user config: ${error.message}`);
    next(error);
  }
};

/**
 * Update user configuration
 */
const updateUserConfig = async (req, res, next) => {
  try {
    const { config } = req.body;
    
    logger.info(`Updating user configuration`);
    
    const updatedConfig = await userConfigService.updateUserConfig(config);
    
    res.status(200).json({
      success: true,
      data: updatedConfig
    });
  } catch (error) {
    logger.error(`Error updating user config: ${error.message}`);
    next(error);
  }
};

/**
 * Get LinkedIn authorization URL
 */
const getLinkedInAuthUrl = async (req, res, next) => {
  try {
    const scopes = req.query.scopes ? req.query.scopes.split(',') : ['w_member_social', 'r_liteprofile'];
    
    // Generate a random state parameter for CSRF protection
    const state = Math.random().toString(36).substring(2, 15);
    
    // Store state in session or cookie
    res.cookie('linkedin_oauth_state', state, { maxAge: 600000, httpOnly: true }); // 10 minutes
    
    // Generate the authorization URL
    const authUrl = linkedinService.generateAuthorizationUrl(scopes, state);
    
    res.status(200).json({
      success: true,
      data: {
        authUrl,
        state
      }
    });
  } catch (error) {
    logger.error(`Error generating LinkedIn auth URL: ${error.message}`);
    next(error);
  }
};

module.exports = {
  generatePost,
  refinePost,
  publishPost,
  getPostEngagement,
  getUserConfig,
  updateUserConfig,
  getLinkedInAuthUrl
}; 