require('dotenv').config();
const { logger } = require('../utils/logger');
const postService = require('../services/post.service');
const userConfigService = require('../services/userConfig.service');

/**
 * Example script to demonstrate post generation
 */
async function generateExamplePost() {
  try {
    logger.info('Starting example post generation');
    
    // Get user configuration
    const userConfig = await userConfigService.getUserConfig();
    logger.info('Loaded user configuration');
    
    // Define a topic for the post
    const topic = 'React Hooks and Performance Optimization';
    const additionalContext = 'Include information about memoization and the useMemo hook';
    
    // Generate the post
    const postDraft = await postService.generatePost(topic, userConfig, additionalContext);
    
    // Log the generated post
    logger.info('Generated post:');
    console.log('\n----------------- GENERATED POST -----------------\n');
    console.log(`Topic: ${postDraft.topic}`);
    console.log('\nContent:');
    console.log(postDraft.content);
    console.log('\n--------------------------------------------------\n');
    
    // Simulate post refinement
    const feedback = 'Add more specific code examples for useMemo and explain when NOT to use it';
    logger.info(`Refining post with feedback: ${feedback}`);
    
    const refinedPost = await postService.refinePost(postDraft, feedback);
    
    // Log the refined post
    logger.info('Refined post:');
    console.log('\n----------------- REFINED POST -----------------\n');
    console.log(`Topic: ${refinedPost.topic}`);
    console.log('\nContent:');
    console.log(refinedPost.content);
    console.log('\n-------------------------------------------------\n');
    
    logger.info('Example completed successfully');
  } catch (error) {
    logger.error(`Error in example: ${error.message}`);
    console.error(error);
  }
}

// Execute the example
generateExamplePost(); 