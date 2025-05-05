# Social Automation Tool

This tool combines AI-powered content generation with LinkedIn posting capabilities, allowing you to automatically create and publish engaging content with media attachments.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in a `.env` file:
```env
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/auth/linkedin/callback
LINKEDIN_ACCESS_TOKEN=your_access_token
LINKEDIN_PERSON_ID=your_linkedin_person_id
DEEPSEEK_API_KEY=your_deepseek_api_key
```

3. Create an `examples/assets` directory and add your test images:
```bash
mkdir -p examples/assets
# Add your test images as example1.jpg and example2.jpg
```

## Running the Integration

To run the example that generates AI content and posts it to LinkedIn with media:

```bash
node examples/generate-and-post.js
```

This will:
1. Generate content using DeepSeek AI based on the provided prompt
2. Upload the media files to LinkedIn
3. Create a post combining the generated content and media
4. Fetch engagement metrics after posting

## Features

- AI-powered content generation with customizable prompts
- Support for multiple media files in a single post
- Customizable content tone and keywords
- Automatic hashtag generation
- Engagement metrics tracking
- Comprehensive error handling and logging

## Error Handling

The tool includes comprehensive error handling for:
- LinkedIn API rate limits and errors
- Media upload failures
- Content generation issues
- Authentication problems

Check the logs for detailed error information if something goes wrong.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 