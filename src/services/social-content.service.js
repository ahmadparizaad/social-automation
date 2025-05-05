const { logger } = require('../utils/logger');
const linkedinService = require('./linkedin.service');
const deepseekService = require('./deepseek.service');

class SocialContentService {
  constructor() {
    this.linkedinService = linkedinService;
    this.deepseekService = deepseekService;
    logger.info('Social Content Service initialized');
  }

  /**
   * Generate AI content and publish to LinkedIn with media
   * 
   * @param {Object} options - Content generation options
   * @param {String} options.prompt - Prompt for AI content generation
   * @param {String} options.tone - Desired tone (professional, casual, etc.)
   * @param {Array<String>} options.keywords - Keywords to include
   * @param {Array<Buffer>} options.mediaFiles - Array of media file buffers to upload
   * @param {String} options.accessToken - LinkedIn access token (optional)
   * @returns {Promise<Object>} Publication result
   */
  async generateAndPublishContent(options) {
    try {
      logger.info('Starting AI content generation and LinkedIn publishing process');

      // Generate content using DeepSeek AI
      const aiPrompt = this.buildPrompt(options);
      const generatedContent = await this.deepseekService.generateContent(aiPrompt);

      // Prepare post object
      const post = {
        content: generatedContent,
        // Add any additional metadata if needed
        timestamp: new Date().toISOString()
      };

      // Publish post with media
      const result = await this.linkedinService.publishPostWithMedia(
        post,
        options.mediaFiles,
        options.accessToken
      );

      logger.info('Successfully published AI-generated content with media', {
        postId: result.id
      });

      return {
        success: true,
        postId: result.id,
        content: generatedContent,
        timestamp: result.timestamp
      };
    } catch (error) {
      logger.error('Error in generateAndPublishContent:', error);
      throw new Error(`Failed to generate and publish content: ${error.message}`);
    }
  }

  /**
   * Build AI prompt from options
   * 
   * @param {Object} options - Content generation options
   * @returns {String} Formatted prompt
   */
  buildPrompt(options) {
    const { prompt, tone = 'professional', keywords = [], userConfig } = options;
    
    return `
      Create a LinkedIn post with the following characteristics:
      - Main topic/context: ${prompt}
      - Tone: ${tone}
      - Include these keywords: ${keywords.join(', ')}
      - userConfig: ${JSON.stringify(userConfig)}
      - Use storytelling techniques to engage readers
      - Keep it concise and engaging
      - Include relevant hashtags
      - Format it appropriately for LinkedIn
    `.trim();
  }
}

module.exports = new SocialContentService(); 