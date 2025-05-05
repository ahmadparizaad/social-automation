const fs = require('fs');

const envContent = `# Server Configuration
PORT=3000

# OpenRouter API Configuration
OPENROUTER_API_KEY=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
OPENROUTER_MODEL=deepseek/deepseek-chat-v3-0324:free

# LinkedIn API Configuration (placeholder - replace with actual values)
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/auth/linkedin/callback
LINKEDIN_ACCESS_TOKEN=your_linkedin_access_token
LINKEDIN_PERSON_ID=your_linkedin_person_id

# Application Settings
LOG_LEVEL=info
NODE_ENV=development
AUTO_PUBLISH=false`;

fs.writeFileSync('.env', envContent);
console.log('.env file created successfully!'); 