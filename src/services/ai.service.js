const { logger } = require('../utils/logger');
require('dotenv').config(); // Ensure dotenv is loaded

/**
 * Service to interact with OpenRouter API using Deepseek model
 */
class AIService {
  constructor() {
    // Don't load API key in constructor, we'll get it on demand
    this.model = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat-v3-0324:free';
    this.apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
    
    logger.info('AI Service initialized');
  }

  /**
   * Get API key from environment
   * @returns {string} API key
   */
  getApiKey() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      logger.error('OpenRouter API key not found in environment variables');
      throw new Error('API key is missing. Please check your .env file');
    }
    return apiKey;
  }

  /**
   * Generate mock content when API is unavailable
   * @param {string} prompt - The prompt to generate content for
   * @returns {string} Generated mock content
   */
  generateMockContent(prompt) {
    logger.info('Generating mock content as fallback');
    
    // Extract topic or key phrases from the prompt
    const topics = ['React', 'Next.js', 'Web Development', 'API', 'Performance', 'AI'];
    const matchingTopic = topics.find(topic => prompt.includes(topic)) || 'Web Development';
    
    // Generate different content based on topic
    const mockPosts = {
      'React': `🔄 React's Component Evolution: From Classes to Hooks

Over the past 2 years of building complex React applications, I've witnessed a complete transformation in how we structure our code.

Remember the days of class components and lifecycle methods? What started as:

componentDidMount() {
  fetchData();
  window.addEventListener('resize', this.handleResize);
}

componentWillUnmount() {
  window.removeEventListener('resize', this.handleResize);
}

Has evolved into the elegance of:

useEffect(() => {
  fetchData();
  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);

This shift isn't just syntactical—it's fundamentally changed how I think about component composition and state management.

Have you embraced hooks fully in your projects? What patterns have you discovered that improved your code quality?

#ReactJS #WebDevelopment #JavaScript #ProgrammingTips`,

      'Next.js': `⚡ Next.js App Router: A game-changer for modern web apps

Just migrated our company's main dashboard from Pages Router to App Router, and the results are impressive:

• Server Components reduced bundle size by 43%
• Initial load time improved by 2.3 seconds
• SEO scores jumped from 76 to 94
• Parallel routes simplified our UX flows

The biggest win? Our data loading patterns went from this:

export async function getServerSideProps() {
  const data = await fetchData()
  return { props: { data } }
}

To this elegant solution:

async function Dashboard() {
  const data = await fetchData()
  return <DashboardContent data={data} />
}

What's been your experience with App Router? Any challenges during migration?

#NextJS #WebPerformance #ReactJS #FrontendDevelopment`,

      'Web Development': `💻 The evolution of my development workflow has saved me hours each day!

After 5 years of refining my process, here's what works for me:

1. Morning: Design & architecture decisions when my mind is fresh
2. Afternoon: Core implementation and complex problem-solving
3. Evening: Code review and documentation

Tools that transformed my productivity:
• Switched from VSCode to Neovim for 30% faster coding
• Implemented GitHub Actions for automated testing
• Leveraged AI pair programming for boilerplate code

Most importantly, I've learned to allocate 2 hours weekly for learning new technologies - this compound interest on knowledge is invaluable.

What's one tool or practice that dramatically improved your dev workflow?

#WebDevelopment #DeveloperProductivity #CodingLife #TechCareers`,

      'API': `🔌 REST vs GraphQL: My journey building APIs for scale

After leading API development for 3 products, here's what I've learned about choosing the right approach:

REST shines when:
• Resources have clear hierarchies
• Caching is critical for performance
• You need broad ecosystem support

GraphQL excels when:
• Clients need flexible data shapes
• Network efficiency is paramount
• Rapid frontend iteration is required

The hybrid approach that's working best for us:
- GraphQL for main application data
- REST endpoints for media uploads and webhooks
- Shared authentication layer

What factors guide your choice between REST and GraphQL?

#APIDesign #WebDevelopment #GraphQL #RESTful #BackendDevelopment`,

      'Performance': `⚡ How we cut our web app's load time from 8.2s to 1.7s

Performance isn't a feature, it's a requirement. Here's our optimization journey:

1. Image optimization reduced asset size by 64%
   - Implemented responsive images
   - Converted to WebP format
   - Added proper caching headers

2. JavaScript improvements:
   - Bundle analysis revealed 2.3MB of unused code
   - Code splitting reduced initial load by 78%
   - Implemented selective hydration

3. Backend optimizations:
   - Added Redis caching layer (200ms → 30ms queries)
   - Optimized database indices
   - Pre-computed expensive calculations

What performance techniques have made the biggest impact for your applications?

#WebPerformance #FrontendDevelopment #OptimizationTips #UserExperience`,

      'AI': `🤖 Practical AI tools that changed my development workflow this year

AI isn't just hype - it's transforming how I build software daily:

1. Code assistance:
   - Copilot for boilerplate reduction (~40% faster)
   - AI code reviews catching issues I missed
   - Automated test generation for edge cases

2. Content generation:
   - Error messages with better user guidance
   - Documentation drafts that actually make sense
   - API descriptions for Swagger/OpenAPI

3. Debugging assistance:
   - Error log analysis to identify patterns
   - Performance bottleneck identification
   - Refactoring suggestions with clear explanations

Which AI developer tools have you found genuinely useful vs overhyped?

#AI #DeveloperTools #Productivity #SoftwareDevelopment #AITools`
    };

    return mockPosts[matchingTopic] || mockPosts['Web Development'];
  }

  /**
   * Generate content using the OpenRouter API or fallback to mock content
   * 
   * @param {Array} messages - Array of message objects with role and content
   * @param {Object} options - Additional options for the API call
   * @returns {Promise<string>} - The generated content
   */
  async generateContent(messages, options = {}) {
    try {
      const defaultOptions = {
        temperature: 0.7,
        max_tokens: 1000
      };

      const requestOptions = { ...defaultOptions, ...options };
      
      try {
        const apiKey = this.getApiKey(); // Get API key on demand

        // Log a portion of the API key for debugging (securely)
        const keyPreview = apiKey ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}` : 'undefined';
        logger.info(`Using API key: ${keyPreview}`);
        logger.info(`Calling OpenRouter API with model: ${this.model}`);
        
        // Ensure headers are properly formatted
        const headers = {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "X-Title": "Social Automation Tool"
        };
        
        // Log request details (excluding full API key)
        logger.info(`Request URL: ${this.apiUrl}`);
        logger.info(`Request headers: ${JSON.stringify({
          ...headers,
          "Authorization": `Bearer ${keyPreview}`
        })}`);
        
        const response = await fetch(this.apiUrl, {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            model: this.model,
            messages: messages,
            ...requestOptions
          })
        });

        // Enhanced error handling
        if (!response.ok) {
          let errorData = {};
          try {
            errorData = await response.json();
          } catch (e) {
            const errorText = await response.text();
            errorData = { text: errorText };
          }
          
          logger.error(`Request failed with status code ${response.status}`);
          logger.error(`Response data: ${JSON.stringify(errorData)}`);
          throw new Error(`Request failed with status code ${response.status}`);
        }

        const data = await response.json();
        
        if (data.choices && data.choices.length > 0) {
          return data.choices[0].message.content;
        } else {
          throw new Error('No content was generated by the AI model');
        }
      } catch (error) {
        logger.error(`Error calling OpenRouter API: ${error.message}`);
        logger.info('Falling back to mock content generation');
        
        // Extract the user's message to use for mock content generation
        const userMessage = messages.find(m => m.role === 'user')?.content || '';
        return this.generateMockContent(userMessage);
      }
    } catch (error) {
      logger.error(`Error in generateContent: ${error.message}`);
      throw new Error(`Failed to generate content: ${error.message}`);
    }
  }

  /**
   * Generate a LinkedIn post based on a prompt
   * 
   * @param {string} prompt - Detailed prompt for post generation
   * @returns {Promise<string>} - The generated LinkedIn post
   */
  async generateLinkedInPost(prompt) {
    const messages = [
      {
        role: 'system',
        content: 'You are an expert LinkedIn content creator. Your task is to create engaging, professional LinkedIn posts that provide value to readers in the tech industry, particularly focusing on web development, React.js, Next.js, backend development, and AI.'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    return this.generateContent(messages, {
      temperature: 0.8,
      max_tokens: 1500
    });
  }

  /**
   * Refine a LinkedIn post based on user feedback
   * 
   * @param {string} originalPost - The original post content to refine
   * @param {string} feedback - User feedback for refinement
   * @returns {Promise<string>} - The refined LinkedIn post
   */
  async refineLinkedInPost(originalPost, feedback) {
    const messages = [
      {
        role: 'system',
        content: 'You are an expert LinkedIn content creator. Your task is to refine an existing LinkedIn post based on user feedback. Maintain the professional tone and ensure the post includes a hook, valuable content, an engagement question, and a call-to-action.'
      },
      {
        role: 'user',
        content: `Original post:\n${originalPost}\n\nFeedback:\n${feedback}\n\nPlease refine this LinkedIn post based on the feedback provided.`
      }
    ];

    return this.generateContent(messages, {
      temperature: 0.7,
      max_tokens: 1500
    });
  }
}

module.exports = new AIService();