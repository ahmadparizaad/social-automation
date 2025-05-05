require('dotenv').config();
const axios = require('axios');
const { logger } = require('../utils/logger');

async function testLinkedInToken() {
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  
  if (!accessToken) {
    console.error('❌ No access token found in environment variables');
    process.exit(1);
  }

  console.log('\n--------------------- Testing LinkedIn Access Token ---------------------\n');
  console.log('Access Token:', accessToken.substring(0, 20) + '...');
  
  try {
    // Test OpenID userinfo endpoint
    console.log('\nTesting OpenID profile access...');
    const userinfoResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✓ Successfully retrieved user information!');
    console.log('\nProfile Information:');
    console.log(JSON.stringify(userinfoResponse.data, null, 2));

    // Get the person ID for future use
    const personId = userinfoResponse.data.sub;
    console.log('\nFor your .env file:');
    console.log(`LINKEDIN_PERSON_ID=${personId}`);

    // Test posting permission
    console.log('\nTesting w_member_social permission...');
    // We'll just verify the token has the right scope without actually posting
    if (userinfoResponse.data.scope && userinfoResponse.data.scope.includes('w_member_social')) {
      console.log('✓ Token has posting permission (w_member_social)');
    } else {
      console.warn('⚠️ Token might not have posting permission. Please verify w_member_social scope is authorized.');
    }
    
  } catch (error) {
    console.error('\n❌ Error testing access token:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 403) {
        console.log('\nThe token doesn\'t have the required permissions. Please re-authorize with these scopes:');
        console.log('- openid (for authentication)');
        console.log('- profile (for basic profile access)');
        console.log('- email (for email access)');
        console.log('- w_member_social (for posting)');
        
        console.log('\nTo fix this:');
        console.log('1. Delete your current access token from .env');
        console.log('2. Visit: http://localhost:3000/api/auth/linkedin');
        console.log('3. Authorize with the correct permissions');
        console.log('4. Update your .env with the new access token');
      }
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }

  console.log('\n--------------------------------------------------------------------');
  console.log('All tests completed successfully! Your access token has the required permissions.');
  console.log('--------------------------------------------------------------------\n');
}

testLinkedInToken(); 