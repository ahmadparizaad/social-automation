require('dotenv').config();
const { logger } = require('../utils/logger');
const linkedinService = require('../services/linkedin.service');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getMetricsWithRetry(postId, maxRetries = 3, delayMs = 5000) {
  for (let i = 0; i < maxRetries; i++) {
    if (i > 0) {
      console.log(`\nRetrying metrics fetch (attempt ${i + 1}/${maxRetries})...`);
      await sleep(delayMs);
    }

    const metrics = await linkedinService.getPostEngagement(postId);
    
    // If we got any non-zero metrics, return them
    if (metrics.likes > 0 || metrics.comments > 0 || metrics.shares > 0 || metrics.views > 0) {
      return metrics;
    }
    
    // If this is not the last attempt, log the delay
    if (i < maxRetries - 1) {
      console.log(`No metrics available yet. Waiting ${delayMs/1000} seconds before retry...`);
    }
  }
  
  // If we get here, we've exhausted our retries
  return await linkedinService.getPostEngagement(postId);
}

async function testLinkedInPost() {
  console.log('\n--------------------- Testing LinkedIn Post ---------------------\n');

  try {
    // Create a test post
    const post = {
      content: `Testing LinkedIn API Integration! 🚀\n\n` +
              `This is an automated test post from our social automation tool.\n\n` +
              `#testing #automation #linkedin\n\n` +
              `Timestamp: ${new Date().toISOString()}`
    };

    console.log('Attempting to publish post:');
    console.log('----------------------------------------');
    console.log(post.content);
    console.log('----------------------------------------\n');

    // Publish the post
    const result = await linkedinService.publishPost(post);

    console.log('✓ Post published successfully!');
    console.log('\nPost Details:');
    console.log(JSON.stringify(result, null, 2));

    // If we have a post ID, try to get engagement metrics with retry
    if (result.id) {
      console.log('\nFetching post engagement metrics (this might take a few moments)...');
      const metrics = await getMetricsWithRetry(result.id);
      
      console.log('\nEngagement Metrics:');
      console.log(JSON.stringify(metrics, null, 2));
      
      if (metrics.note) {
        console.log('\nNote:', metrics.note);
      }
      
      console.log('\nView your post at:');
      console.log(`https://www.linkedin.com/feed/update/${result.id}`);
    }

  } catch (error) {
    console.error('\n❌ Error publishing post:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
      
      // Common error handling
      if (error.response.status === 401) {
        console.log('\nYour access token might have expired. Please re-authenticate:');
        console.log('1. Visit: http://localhost:3000/api/auth/linkedin');
        console.log('2. Get a new access token');
        console.log('3. Update LINKEDIN_ACCESS_TOKEN in your .env file');
      }
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }

  console.log('\n--------------------------------------------------------------------\n');
}

// Execute the test
testLinkedInPost(); 