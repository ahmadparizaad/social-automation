const cron = require('node-cron');
const { logger } = require('../utils/logger');
const postService = require('./post.service');
const userConfigService = require('./userConfig.service');
const linkedinService = require('./linkedin.service');
const { isVercelEnvironment } = require('../utils/vercel-environment');

/**
 * Service to handle scheduled post generation and publishing
 */
class SchedulerService {
  constructor() {
    this.scheduledTasks = {};
    this.isServerless = isVercelEnvironment();

    // Log whether we're in serverless mode
    if (this.isServerless) {
      logger.info('Scheduler service in serverless mode - using Vercel cron');
    } else {
      logger.info('Scheduler service in standard mode - using node-cron');
    }
  }

  /**
   * Initialize the scheduler
   */
  async initialize() {
    try {
      logger.info('Initializing scheduler service');
      
      // Skip scheduling in serverless environment - will use Vercel cron
      if (this.isServerless) {
        logger.info('Skipping cron scheduling in serverless environment');
        return;
      }
      
      // Get user configuration
      const userConfig = await userConfigService.getUserConfig();
      
      // Set up scheduled posts based on user configuration
      if (userConfig.postFrequency) {
        await this.setSchedule(userConfig.postFrequency);
      }
      
      logger.info('Scheduler service initialized successfully');
    } catch (error) {
      logger.error(`Error initializing scheduler: ${error.message}`);
    }
  }

  /**
   * Set the post generation and publishing schedule
   * 
   * @param {string} frequency - Frequency of posts (Daily, Weekly, BiWeekly, Monthly)
   */
  async setSchedule(frequency) {
    // Skip in serverless environment
    if (this.isServerless) {
      logger.info('Cannot set local schedule in serverless environment - use Vercel cron');
      return;
    }
    
    // Clear any existing scheduled tasks
    this.clearAllSchedules();
    
    let cronSchedule;
    
    // Set schedule based on frequency
    switch (frequency.toLowerCase()) {
      case 'daily':
        cronSchedule = '15 11 * * *'; // Every day at 11:15 AM
        break;
      case 'weekly':
        cronSchedule = '0 9 * * 1'; // Every Monday at 9 AM
        break;
      case 'biweekly':
        cronSchedule = '0 9 */14 * *'; // Every 14 days at 9 AM
        break;
      case 'monthly':
        cronSchedule = '0 9 1 * *'; // 1st day of each month at 9 AM
        break;
      default:
        cronSchedule = '0 9 * * 1'; // Default to weekly
    }
    
    // Schedule the automated post generation and publishing
    this.scheduledTasks.postGeneration = cron.schedule(cronSchedule, async () => {
      try {
        await this.generateAndPublishPost();
      } catch (error) {
        logger.error(`Error in scheduled post generation: ${error.message}`);
      }
    });
    
    logger.info(`Post schedule set to: ${frequency} (${cronSchedule})`);
  }

  /**
   * Generate and publish a post based on user configuration
   * This method can be called by both node-cron and Vercel cron
   */
  async generateAndPublishPost() {
    try {
      logger.info('Running post generation');
      
      // Get the latest user configuration
      const userConfig = await userConfigService.getUserConfig();
      
      // Select a random topic from the user's preferred topics
      const randomTopic = userConfig.topics[Math.floor(Math.random() * userConfig.topics.length)];
      
      // Generate the post
      const postDraft = await postService.generatePost(randomTopic, userConfig);
      
      logger.info(`Post generated on topic: ${randomTopic}`);
      
      // Publish if auto-publish is enabled
      if (process.env.AUTO_PUBLISH === 'true') {
        const result = await linkedinService.publishPost(postDraft);
        logger.info('Post published automatically', { postId: result.id });
        return result;
      } else {
        logger.info('Post generated but not published (AUTO_PUBLISH disabled)');
        return { published: false, draft: postDraft };
      }
    } catch (error) {
      logger.error(`Error in post generation: ${error.message}`);
      throw error;
    }
  }

  /**
   * Clear all scheduled tasks
   */
  clearAllSchedules() {
    // Skip in serverless environment
    if (this.isServerless) {
      return;
    }
    
    Object.values(this.scheduledTasks).forEach(task => {
      if (task && typeof task.stop === 'function') {
        task.stop();
      }
    });
    
    this.scheduledTasks = {};
    logger.info('All scheduled tasks cleared');
  }

  /**
   * Stop the scheduler
   */
  stop() {
    this.clearAllSchedules();
    logger.info('Scheduler service stopped');
  }
}

module.exports = new SchedulerService();