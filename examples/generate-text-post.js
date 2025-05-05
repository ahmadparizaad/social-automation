require('dotenv').config();
const socialContentService = require('../src/services/social-content.service');
const { logger } = require('../src/utils/logger');

// Array of topics with their details
const topics = [
  {
    name: 'React.js',
    aspects: ['Hooks', 'Component Lifecycle', 'State Management', 'Performance Optimization'],
    keywords: ['React.js', 'Hooks', 'Components', 'JavaScript', 'Frontend'],
    codeExample: true
  },
  {
    name: 'Next.js',
    aspects: ['Server-Side Rendering', 'Static Site Generation', 'API Routes', 'Image Optimization'],
    keywords: ['Next.js', 'SSR', 'SSG', 'React Framework', 'Performance'],
    codeExample: true
  },
  {
    name: 'RESTful API',
    aspects: ['API Design', 'Authentication', 'Rate Limiting', 'Error Handling'],
    keywords: ['API', 'REST', 'Backend', 'Web Services', 'Architecture'],
    codeExample: true
  },
  {
    name: 'API Optimization',
    aspects: ['Caching', 'Database Queries', 'Response Compression', 'Load Balancing'],
    keywords: ['Performance', 'Optimization', 'Scaling', 'Backend', 'Architecture'],
    codeExample: true
  },
  {
    name: 'AI Tools',
    aspects: ['GitHub Copilot', 'Code Review Tools', 'Testing Automation', 'Documentation Generation'],
    keywords: ['AI', 'Developer Tools', 'Automation', 'Productivity', 'Innovation'],
    codeExample: false
  },
  {
    name: 'AI Updates',
    aspects: ['Latest LLM Developments', 'AI in Code Generation', 'AI Testing Tools', 'Future Trends'],
    keywords: ['AI', 'Machine Learning', 'Future Tech', 'Innovation', 'Technology'],
    codeExample: false
  }
];

async function generateTechnicalPost() {
  try {
    // Randomly select a topic
    const selectedTopic = topics[Math.floor(Math.random() * topics.length)];
    logger.info(`Selected topic: ${selectedTopic.name}`);

    // Content generation options
    const options = {
      prompt: `[User Profile: Developer sharing personal experience with ${selectedTopic.name}]
[Desired Tone: Conversational, authentic, and relatable]
[Topic: ${selectedTopic.name} - Personal Journey and Insights]

Compose a LinkedIn post that:
- Starts with a personal story or challenge related to ${selectedTopic.name}
- Focuses on these key aspects: ${selectedTopic.aspects.join(', ')}
${selectedTopic.codeExample ? '- Includes a brief, practical code example or configuration snippet' : ''}
- Shares specific lessons learned and practical tips
- Mentions real-world applications and benefits
- Asks others about their experience with ${selectedTopic.name}
- Ends with an invitation for discussion

Make it feel like a coffee chat with fellow developers - casual yet insightful.`,
      tone: "conversational",
      keywords: selectedTopic.keywords
    };

    // Generate content and prepare post
    const result = await socialContentService.generateAndPublishContent({
      ...options,
      mediaFiles: [] // No media files for this post
    });

    logger.info('Generated post content:', {
      topic: selectedTopic.name,
      content: result.content,
      postId: result.postId,
      timestamp: result.timestamp
    });

    // Get engagement metrics after a delay
    setTimeout(async () => {
      try {
        const metrics = await linkedinService.getPostEngagement(result.postId);
        logger.info('Post engagement metrics:', metrics);
      } catch (error) {
        logger.warn('Could not fetch engagement metrics:', error.message);
      }
    }, 5000);

  } catch (error) {
    logger.error('Error generating technical post:', error);
    process.exit(1);
  }
}

// Run the example
generateTechnicalPost(); 