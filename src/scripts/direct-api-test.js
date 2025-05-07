require('dotenv').config();
const fs = require('fs');

async function testDirectApiCall() {
  console.log('\n--------------------- Direct OpenRouter API Test ---------------------\n');

  // Get the API key directly from the .env file (bypassing potential process.env issues)
  const envContent = fs.readFileSync('.env', 'utf8');
  const apiKeyMatch = envContent.match(/OPENROUTER_API_KEY=([^\s\n]+)/);
  const apiKey = apiKeyMatch ? apiKeyMatch[1] : null;

  console.log(`API key from file: ${apiKey ? apiKey.substring(0, 10) + '...' : 'Not found'}`);
  console.log(`API key from env: ${process.env.OPENROUTER_API_KEY ? process.env.OPENROUTER_API_KEY.substring(0, 10) + '...' : 'Not found'}`);
  
  if (!apiKey) {
    console.error('API key could not be found in .env file');
    process.exit(1);
  }

  // Create minimal request without any extra headers
  const headers = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  };

  console.log('Using headers:', {
    "Authorization": `Bearer ${apiKey.substring(0, 10)}...`,
    "Content-Type": "application/json"
  });

  try {
    // Use native fetch API without any libraries
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        "model": "deepseek/deepseek-chat-v3-0324:free",
        "messages": [
          {
            "role": "user",
            "content": "Hello, this is a direct API test."
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
      console.error(`❌ API call failed with status: ${response.status}`);
      console.error('Error details:', errorData);
      console.error('\nHere are some troubleshooting steps:');
      console.error('1. Check if your API key is valid and properly formatted');
      console.error('2. Verify that your OpenRouter account is active');
      console.error('3. Try generating a new API key at https://openrouter.ai/keys');
      
      if (response.status === 401) {
        console.error('\nSpecific 401 error troubleshooting:');
        console.error('- Ensure there are no spaces or special characters in your API key');
        console.error('- Verify your API key prefix starts with sk-or-v1-');
        console.error('- Try regenerating the API key in your OpenRouter dashboard');
      }
      
      process.exit(1);
    }

    const data = await response.json();
    console.log('\n✅ API call successful!');
    console.log('\nResponse data:');
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.error('Make sure you have an active internet connection');
    process.exit(1);
  }

  console.log('\n----------------------------------------------------------------\n');
}

testDirectApiCall();