const cron = require('node-cron');
const { logger } = require('../utils/logger');
const postService = require('./post.service');
const userConfigService = require('./userConfig.service');
const linkedinService = require('./linkedin.service');
/**
 * Service to handle scheduled post generation and publishing
 */
class SchedulerService {
  constructor() {
    this.scheduledTasks = {};
  }

  /**
   * Initialize the scheduler
   */
  async initialize() {
    try {
      logger.info('Initializing scheduler service');
      
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
    // Clear any existing scheduled tasks
    this.clearAllSchedules();
    
    let cronSchedule;
    
    // Set schedule based on frequency
    switch (frequency.toLowerCase()) {
      case 'daily':
        cronSchedule = '15 08 * * *'; // Every day at 11:15 AM
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
        logger.info('Running scheduled post generation');
        
        // Get the latest user configuration
        const userConfig = await userConfigService.getUserConfig();
        
        // Select a random topic from the user's preferred topics
        const randomTopic = userConfig.topics[Math.floor(Math.random() * userConfig.topics.length)];
        
        // Generate the post
        const postDraft = await postService.generatePost(randomTopic, userConfig);
        
        logger.info(`Scheduled post generated on topic: ${randomTopic}`);
        
        // In a real implementation, you might want to:
        // 1. Save the draft to a database
        // 2. Notify the user for approval
        // 3. Publish once approved
        
        // For this example, we'll auto-publish in test mode
        if (process.env.AUTO_PUBLISH === 'true') {
          await linkedinService.publishPost(postDraft);
          logger.info('Scheduled post published automatically');
        }
      } catch (error) {
        logger.error(`Error in scheduled post generation: ${error.message}`);
      }
    });
    
    logger.info(`Post schedule set to: ${frequency} (${cronSchedule})`);
  }

  /**
   * Clear all scheduled tasks
   */
  clearAllSchedules() {
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