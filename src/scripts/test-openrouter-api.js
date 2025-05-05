require('dotenv').config();
const { logger } = require('../utils/logger');

// Simple test function to validate OpenRouter API connectivity
async function testOpenRouterAPI() {
  console.log('\n--------------------- Testing OpenRouter API ---------------------\n');

  // Verify the environment variables are loaded
  console.log('Environment variables:');
  console.log(`API_URL: ${process.env.API_URL || 'https://openrouter.ai/api/v1'}`);
  console.log(`OPENROUTER_MODEL: ${process.env.OPENROUTER_MODEL || 'Not Set'}`);
  console.log(`API Key: ${process.env.OPENROUTER_API_KEY ? process.env.OPENROUTER_API_KEY.substring(0, 12) + '...' : 'Not Set'}`);

  try {
    // Use the native fetch API to call OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://social-automation-app.com", 
        "X-Title": "Social Automation Tool",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat-v3-0324:free",
        "messages": [
          {
            "role": "user",
            "content": "Say hello to test the API connection"
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`❌ API call failed with status: ${response.status}`);
      console.error('Error details:', JSON.stringify(errorData, null, 2));
      console.error('Headers sent:', {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY?.substring(0, 12)}...`,
        "HTTP-Referer": "https://social-automation-app.com",
        "X-Title": "Social Automation Tool"
      });
      process.exit(1);
    }

    const data = await response.json();
    console.log('\n✓ Successfully connected to OpenRouter API!');
    console.log('\nResponse:');
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error(`❌ Error testing OpenRouter API: ${error.message}`);
    process.exit(1);
  }

  console.log('\n----------------------------------------------------------------\n');
}

// Run the test
testOpenRouterAPI();