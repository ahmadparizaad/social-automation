require('dotenv').config();
const { logger } = require('../utils/logger');
const linkedinService = require('../services/linkedin.service');

/**
 * Validate required environment variables
 */
function validateEnvironment() {
  const required = [
    'LINKEDIN_CLIENT_ID',
    'LINKEDIN_CLIENT_SECRET',
    'LINKEDIN_REDIRECT_URI'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  logger.info('Environment variables validated successfully');
}

/**
 * Example script to demonstrate LinkedIn OAuth flow
 */
async function demonstrateLinkedInOAuth() {
  try {
    logger.info('Starting LinkedIn OAuth flow demonstration');
    
    // Validate environment first
    validateEnvironment();
    
    console.log('\n--------------------- IMPORTANT NOTE ---------------------');
    console.log('This is a demonstration script. In a real application:');
    console.log('1. Use the server-side route: GET /api/auth/linkedin');
    console.log('2. The server will handle state verification automatically');
    console.log('3. Cookies will persist the state between requests');
    console.log('--------------------------------------------------------\n');
    
    // Step 1: Generate an authorization URL with correct scopes
    const scopes = ['openid', 'profile', 'email', 'w_member_social'];
    
    // Generate state - in production use crypto.randomBytes
    const state = 'demo123'; // Using fixed state for demo purposes
    logger.info('Using demo state parameter:', state);
    
    logger.info('Generating authorization URL with scopes:', scopes);
    const authUrl = linkedinService.generateAuthorizationUrl(scopes, state);
    
    logger.info('Step 1: Authorization URL generated');
    console.log('\n--------------------- AUTHORIZATION URL ---------------------\n');
    console.log(authUrl);
    console.log('\n------------------------------------------------------------\n');
    
    // Explain both flows
    console.log('Two ways to use the OAuth flow:');
    console.log('\n1. SERVER-SIDE FLOW (Recommended):');
    console.log('   a. Visit: http://localhost:3000/api/auth/linkedin');
    console.log('   b. Server handles state verification automatically');
    console.log('   c. Callback processed at:', process.env.LINKEDIN_REDIRECT_URI);
    
    console.log('\n2. MANUAL FLOW (For Testing):');
    console.log('   a. Open the authorization URL above');
    console.log('   b. After authorization, you\'ll get a callback like:');
    console.log(`   ${process.env.LINKEDIN_REDIRECT_URI}?code=AQTIsnp...&state=${state}`);
    console.log('   c. Verify the state matches:', state);
    console.log('   d. Use the code to get an access token\n');
    
    // Show code exchange example
    console.log('To exchange the code for a token:');
    console.log(`
// First verify the state parameter matches '${state}'
if (receivedState !== '${state}') {
  throw new Error('State mismatch - possible CSRF attack');
}

// Then exchange the code
const tokenDetails = await linkedinService.exchangeAuthCodeForAccessToken(code);

// Token response will include:
{
  access_token: 'your_access_token',
  expires_in: 5183999,
  refresh_token: 'your_refresh_token',    // if configured for refresh tokens
  refresh_token_expires_in: 31557599      // if configured for refresh tokens
}
    `);
    
    // Example post creation
    console.log('\nOnce you have the access token, you can publish content:');
    console.log(`
// Example post
const post = {
  content: 'Exploring the latest developments in web development! #webdev #coding'
};

// Publish the post
const result = await linkedinService.publishPost(post, tokenDetails.access_token);
    `);
    
    // Configuration instructions
    console.log('\n--------------------- REQUIRED SETUP ---------------------');
    console.log('\nIn your LinkedIn Developer Portal (https://www.linkedin.com/developers/):');
    console.log('1. Create an application if you haven\'t already');
    console.log('2. Add the following Authorized Redirect URL:');
    console.log(`   ${process.env.LINKEDIN_REDIRECT_URI}`);
    console.log('\n3. Request the following OAuth 2.0 scopes:');
    console.log('   - openid');
    console.log('   - profile');
    console.log('   - email');
    console.log('   - w_member_social');
    console.log('\n4. Configure your .env file:');
    console.log(`LINKEDIN_CLIENT_ID=${process.env.LINKEDIN_CLIENT_ID || 'your_client_id'}`);
    console.log('LINKEDIN_CLIENT_SECRET=your_client_secret');
    console.log(`LINKEDIN_REDIRECT_URI=${process.env.LINKEDIN_REDIRECT_URI}`);
    console.log('\n--------------------------------------------------------\n');
    
    logger.info('LinkedIn OAuth flow demonstration completed');
    
  } catch (error) {
    logger.error('Error in LinkedIn OAuth demonstration:', error);
    console.error('\nError:', error.message);
    process.exit(1);
  }
}

// Execute the example
demonstrateLinkedInOAuth(); 