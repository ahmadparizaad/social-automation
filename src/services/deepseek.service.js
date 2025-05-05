const axios = require('axios');
const { logger } = require('../utils/logger');
require('dotenv').config(); // Ensure dotenv is loaded

class DeepseekService {
  constructor() {
    // Don't load API key in constructor, we'll get it on demand
    this.apiUrl = process.env.API_URL || 'https://openrouter.ai/api/v1';
    this.model = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat-v3-0324:free';
    
    logger.info('DeepSeek AI Service initialized');
  }

  /**
   * Get API key from environment
   * @returns {string|null} API key or null if in test mode
   */
  getApiKey() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      logger.warn('OpenRouter API key not found in environment variables');
    }
    return apiKey;
  }

  /**
   * Generate content using DeepSeek AI
   * 
   * @param {String} prompt - The prompt for content generation
   * @returns {Promise<String>} Generated content
   */
  async generateContent(prompt) {
    try {
      logger.info('Generating content with DeepSeek AI');
      
      const apiKey = this.getApiKey();

      // For testing without API key, return mock content
      if (!apiKey || process.env.NODE_ENV === 'test') {
        logger.info('Using mock content generation (no API key or test mode)');
        return this.generateMockContent(prompt);
      }

      const response = await axios.post(
        `${this.apiUrl}/chat/completions`,
        {
          model: `${this.model}`,
          messages: [
            {
              role: 'system',
              content: `You are a developer sharing personal experiences and insights.
Your posts should:
1. Be authentic and conversational
2. Share real challenges and solutions
3. Include specific examples when relevant
4. Encourage community discussion
5. Stay within LinkedIn's optimal length (1,300-1,700 characters)
6. Perfectly use storytelling techniques to engage readers
7. Avoid technical jargon and complex terms`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 800
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://social-automation-app.com',
            'X-Title': 'Social Automation Tool',
            'Content-Type': 'application/json'
          }
        }
      );

      const generatedContent = response.data.choices[0].message.content;
      logger.info('Successfully generated content with DeepSeek AI');
      
      return generatedContent;

    } catch (error) {
      logger.error('Error generating content with DeepSeek AI:', error);
      
      // Fallback to mock content in case of API errors
      logger.info('Falling back to mock content generation');
      return this.generateMockContent(prompt);
    }
  }

  /**
   * Generate mock content for testing or when API is unavailable
   * 
   * @param {String} prompt - The original prompt
   * @returns {String} Mock generated content
   */
  generateMockContent(prompt) {
    // Extract topic from prompt
    const topicMatch = prompt.match(/\[Topic: (.*?) -/);
    const topic = topicMatch ? topicMatch[1] : 'Development';

    // Generate appropriate mock content based on topic
    const mockContents = {
      'React.js': `🔄 Confession time: I used to be terrified of React's component lifecycle! 

Last month, I was working on a complex dashboard that needed real-time updates. My class components were getting messy with lifecycle methods everywhere. Then I discovered the magic of hooks.

Here's a game-changer pattern I now use:

const DashboardWidget = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const subscription = subscribeToUpdates(data => {
      setData(data);
      setIsLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);
}

This simple pattern replaced what used to be 50+ lines of class component code! 

Pro tip: Start with the cleanup function first - it helps prevent those sneaky memory leaks. 

🤔 What's your favorite React pattern that simplified your code? Share your "aha" moments below!

#ReactJS #WebDev #JavaScript #CleanCode #DeveloperLife`,

      'Next.js': `🚀 Just had a mind-blowing experience with Next.js 13's app router!

For years, I struggled with client-side routing and SEO. Last week, I converted a complex e-commerce site from Create React App to Next.js, and wow...

The biggest win? Converting this:
- Multiple API calls
- Loading states everywhere
- SEO headaches
- Complex data fetching logic

Into this simple, powerful pattern:

async function ProductPage({ params }) {
  const product = await getProduct(params.id);
  return <ProductDisplay product={product} />;
}

Page load time went from 3.2s to 0.8s! 

Key learnings:
• Server components are game-changers
• Route handlers > separate API server
• Image optimization is pure magic

💡 What's your experience with Next.js 13? Any cool patterns you've discovered?

#NextJS #WebPerformance #JavaScript #WebDev`,

      'RESTful API': `🔧 Ever had an API that started simple but became a monster? That was me last quarter!

Working on a microservices project, I learned the hard way about API design. Here's what transformed our chaotic endpoints into a clean, maintainable API:

1. Versioning from day one:
   /api/v1/resources

2. Consistent error responses:
{
  "error": "ValidationError",
  "message": "Invalid input",
  "details": [...]
}

3. Rate limiting with Redis:
- 100 requests/minute for free tier
- Custom headers for rate info

The game-changer? Treating our API as a product, not just an interface.

🎯 Top tip: Document your API BEFORE implementing. It forces you to think through the design.

What's your #1 API design principle? Share below! 

#API #WebDevelopment #Backend #BestPractices`,

      'API Optimization': `⚡ Performance anxiety? Yeah, our API had that too! 

Our endpoint was taking 2.5s to return user analytics. Unacceptable! Here's how we got it down to 150ms:

1. Implemented Redis caching:
- Cached aggregated data
- 5-minute TTL for fresh stats
- Background refresh

2. Query optimization:
- Replaced nested queries
- Added compound indexes
- Used projection

3. Response compression:
- gzip for JSON responses
- Reduced payload by 70%

The secret sauce? Monitoring! Can't optimize what you can't measure.

💡 What's your best API performance hack? Share your wins!

#Performance #Backend #APIs #Optimization #WebDev`,

      'AI Tools': `🤖 Remember when we had to write ALL our tests manually? Those days are gone!

This week, I've been experimenting with AI-powered development tools, and I'm honestly amazed:

• GitHub Copilot: Wrote 60% of my unit tests
• Amazon CodeWhisperer: Caught security vulnerabilities I missed
• ChatGPT: Helped debug a tricky regex issue in minutes

The game-changer? Using AI for the repetitive stuff while focusing my energy on architecture and business logic.

Best practice: Always review AI-generated code. It's smart, but not infallible!

🤔 What's your favorite AI coding tool? Has it changed your workflow?

#AI #DevTools #Productivity #CodingLife #Innovation`,

      'AI Updates': `🔮 The future of coding is here, and it's mind-blowing!

Just explored the latest AI developments in our field:

1. Code Generation:
- New models understanding full codebases
- Context-aware suggestions
- Multi-file refactoring

2. Testing Revolution:
- AI generating edge cases
- Self-healing tests
- Automated performance testing

3. Future Trends:
- AI pair programmers
- Natural language to code
- Automated code reviews

Most exciting? The tools are getting better at understanding context and business logic!

🤔 What AI advancement are you most excited about? How do you see it changing our industry?

#AI #FutureTech #Programming #Innovation #TechTrends`
    };

    return mockContents[topic] || mockContents['React.js'];
  }
}

module.exports = new DeepseekService();