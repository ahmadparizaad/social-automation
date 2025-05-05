const { logger } = require('../utils/logger');
const aiService = require('./ai.service');

/**
 * Service to handle LinkedIn post generation and refinement
 */
class PostService {
  /**
   * Construct a detailed prompt for LinkedIn post generation
   * 
   * @param {string} topic - Main topic for the post
   * @param {Object} userConfig - User configuration settings
   * @param {string} additionalContext - Any additional context provided by the user
   * @returns {string} - Detailed prompt for AI service
   */
  constructPrompt(topic, userConfig, additionalContext = '') {
    return `
Create a professional LinkedIn post about ${topic} that follows this structure:

1. Start with an engaging hook that grabs attention.
2. Main content providing value about ${topic} related to:
   - React.js concepts and best practices
   - Next.js features and framework advantages
   - Backend development principles
   - AI and development tools integration

3. Include an engagement question to invite reader feedback.
4. End with a strong call-to-action.

Additional details:
- Professional background: ${userConfig.professionalBackground || 'Web Developer'}
- Target audience: ${userConfig.targetAudience || 'Web developers and tech professionals'}
- Preferred tone: ${userConfig.tone || 'Professional but conversational'}
- Post length: ${userConfig.postLength || 'Medium (1500-2000 characters)'}
- Additional context: ${additionalContext}

The post MUST include:
- A memorable hook at the beginning
- Educational content that demonstrates expertise
- An open-ended question to encourage comments
- A clear call-to-action at the end
    `;
  }

  /**
   * Sanitize post content to remove unwanted characters
   * 
   * @param {string} content - Post content to sanitize
   * @returns {string} - Sanitized content
   */
  sanitizeContent(content) {
    if (!content) return content;
    
    // Replace em dashes with regular hyphens
    let sanitized = content.replace(/—/g, '-');
    
    // Remove asterisks (often used for bold/italic in markdown)
    sanitized = sanitized.replace(/\*/g, '');
    
    logger.info('Post content sanitized to remove unwanted characters');
    
    return sanitized;
  }

  /**
   * Generate a LinkedIn post
   * 
   * @param {string} topic - Main topic for the post
   * @param {Object} userConfig - User configuration settings
   * @param {string} additionalContext - Any additional context provided by the user
   * @returns {Promise<Object>} - Generated post data
   */
  async generatePost(topic, userConfig, additionalContext = '') {
    try {
      logger.info(`Generating post about: ${topic}`);
      
      const prompt = this.constructPrompt(topic, userConfig, additionalContext);
      const rawPostContent = await aiService.generateLinkedInPost(prompt);
      
      // Sanitize content to remove unwanted characters
      const postContent = this.sanitizeContent(rawPostContent);
      
      // Create a structured post object
      const postDraft = {
        topic,
        content: postContent,
        timestamp: new Date().toISOString(),
        metadata: {
          generatedWith: process.env.OPENROUTER_MODEL,
          userConfig: { ...userConfig }
        }
      };
      
      return postDraft;
    } catch (error) {
      logger.error(`Error in post generation: ${error.message}`);
      throw error;
    }
  }

  /**
   * Refine a post draft based on user feedback
   * 
   * @param {Object} postDraft - Original post draft
   * @param {string} feedback - User feedback for refinement
   * @returns {Promise<Object>} - Refined post data
   */
  async refinePost(postDraft, feedback) {
    try {
      logger.info(`Refining post with feedback: ${feedback}`);
      
      const rawRefinedContent = await aiService.refineLinkedInPost(postDraft.content, feedback);
      
      // Sanitize content to remove unwanted characters
      const refinedContent = this.sanitizeContent(rawRefinedContent);
      
      // Create a new version of the post with the refinements
      const refinedPost = {
        ...postDraft,
        content: refinedContent,
        timestamp: new Date().toISOString(),
        metadata: {
          ...postDraft.metadata,
          refinementHistory: [
            ...(postDraft.metadata.refinementHistory || []),
            {
              previousContent: postDraft.content,
              feedback,
              timestamp: new Date().toISOString()
            }
          ]
        }
      };
      
      return refinedPost;
    } catch (error) {
      logger.error(`Error in post refinement: ${error.message}`);
      throw error;
    }
  }

  /**
   * Analyze a post to provide improvement suggestions
   * 
   * @param {Object} postDraft - Post draft to analyze
   * @returns {Promise<Object>} - Analysis results with suggestions
   */
  async analyzePost(postDraft) {
    // This could use AI to analyze the post and provide suggestions
    // Placeholder for future implementation
    return {
      hasHook: true,
      hasEngagementQuestion: true,
      hasCTA: true,
      suggestions: [
        'Consider adding more specific examples about React.js',
        'The call-to-action could be more compelling'
      ],
      overallScore: 8.5
    };
  }
}

module.exports = new PostService();