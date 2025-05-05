require('dotenv').config();
const { logger } = require('../utils/logger');

function verifyLinkedInConfig() {
  console.log('\n--------------------- LinkedIn Configuration Verification ---------------------\n');
  
  // Check environment variables
  const config = {
    LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID,
    LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET,
    LINKEDIN_REDIRECT_URI: process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3000/api/auth/linkedin/callback'
  };

  let hasErrors = false;

  // Check each configuration item
  Object.entries(config).forEach(([key, value]) => {
    if (!value) {
      console.error(`❌ ${key} is missing`);
      hasErrors = true;
    } else {
      console.log(`✓ ${key} is set to: ${key.includes('SECRET') ? '[HIDDEN]' : value}`);
    }
  });

  // Specific checks for redirect URI
  if (config.LINKEDIN_REDIRECT_URI) {
    try {
      const uri = new URL(config.LINKEDIN_REDIRECT_URI);
      console.log('\nRedirect URI analysis:');
      console.log(`✓ Protocol: ${uri.protocol}`);
      console.log(`✓ Host: ${uri.host}`);
      console.log(`✓ Path: ${uri.pathname}`);
      
      // Common issues warnings
      if (uri.protocol !== 'http:' && uri.protocol !== 'https:') {
        console.warn('⚠️ Warning: URI protocol should be http:// or https://');
      }
      if (uri.pathname.endsWith('/')) {
        console.warn('⚠️ Warning: URI should not end with a trailing slash');
      }
    } catch (error) {
      console.error('❌ Invalid redirect URI format:', error.message);
      hasErrors = true;
    }
  }

  console.log('\nNext steps:');
  console.log('1. Go to https://www.linkedin.com/developers/apps');
  console.log('2. Select your app');
  console.log('3. Go to Auth -> OAuth 2.0 settings');
  console.log('4. Add exactly this Authorized Redirect URL:');
  console.log(`   ${config.LINKEDIN_REDIRECT_URI}`);
  
  if (hasErrors) {
    console.log('\n❌ Configuration errors found. Please fix them before proceeding.');
    process.exit(1);
  } else {
    console.log('\n✓ Configuration looks good!');
  }
  
  console.log('\n------------------------------------------------------------------------\n');
}

verifyLinkedInConfig(); 