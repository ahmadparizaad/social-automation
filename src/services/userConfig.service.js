const fs = require('fs').promises;
const path = require('path');
const { logger } = require('../utils/logger');
const { hasPersistentFileSystem } = require('../utils/vercel-environment');

/**
 * Service to manage user configuration for post generation
 */
class UserConfigService {
  constructor() {
    this.configPath = path.join(process.cwd(), 'data', 'userConfig.json');
    this.inMemoryConfig = null;
    this.defaultConfig = {
      professionalBackground: "Fullstack Developer | AI Specialist",
      targetAudience: "Web developers, engineers, tech enthusiasts and tech professionals",
      tone: "Professional but conversational",
      postLength: "Medium (800-2000 characters)",
      topics: [
        "React.js",
        "Next.js",
        "Backend Development",
        "AI Tools for Development",
        "Web Development Best Practices"
      ],
      postFrequency: "Daily",
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Ensure the data directory exists
   */
  async ensureDataDirectory() {
    // Skip filesystem operations in serverless environment
    if (!hasPersistentFileSystem()) return;

    const dataDir = path.join(process.cwd(), 'data');
    try {
      await fs.mkdir(dataDir, { recursive: true });
    } catch (error) {
      logger.error(`Error creating data directory: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get user configuration
   * 
   * @returns {Promise<Object>} - User configuration
   */
  async getUserConfig() {
    try {
      // In serverless environment, use in-memory or environment defaults
      if (!hasPersistentFileSystem()) {
        if (this.inMemoryConfig) {
          return this.inMemoryConfig;
        }
        
        // Try to get from environment variable if available
        if (process.env.USER_CONFIG) {
          try {
            this.inMemoryConfig = JSON.parse(process.env.USER_CONFIG);
            return this.inMemoryConfig;
          } catch (e) {
            logger.warn('Failed to parse USER_CONFIG environment variable, using default config');
          }
        }
        
        // Use default config
        this.inMemoryConfig = this.defaultConfig;
        return this.defaultConfig;
      }

      // For local environment, use file system
      await this.ensureDataDirectory();
      
      try {
        const configData = await fs.readFile(this.configPath, 'utf8');
        return JSON.parse(configData);
      } catch (error) {
        // If file doesn't exist or can't be parsed, create default config
        if (error.code === 'ENOENT' || error instanceof SyntaxError) {
          logger.info('User config not found, creating default configuration');
          await this.updateUserConfig(this.defaultConfig);
          return this.defaultConfig;
        }
        throw error;
      }
    } catch (error) {
      logger.error(`Error getting user config: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update user configuration
   * 
   * @param {Object} newConfig - New configuration to save
   * @returns {Promise<Object>} - Updated configuration
   */
  async updateUserConfig(newConfig) {
    try {
      // In serverless environment, use in-memory only
      if (!hasPersistentFileSystem()) {
        this.inMemoryConfig = {
          ...this.defaultConfig,
          ...newConfig,
          lastUpdated: new Date().toISOString()
        };
        
        logger.info('User configuration updated in memory (serverless environment)');
        return this.inMemoryConfig;
      }

      // For local environment, update the file
      await this.ensureDataDirectory();
      
      // Merge with existing config if available
      let currentConfig = this.defaultConfig;
      try {
        const configData = await fs.readFile(this.configPath, 'utf8');
        currentConfig = JSON.parse(configData);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          logger.error(`Error reading existing config: ${error.message}`);
        }
      }

      // Merge and update timestamp
      const updatedConfig = {
        ...currentConfig,
        ...newConfig,
        lastUpdated: new Date().toISOString()
      };

      // Save updated config
      await fs.writeFile(
        this.configPath,
        JSON.stringify(updatedConfig, null, 2),
        'utf8'
      );

      logger.info('User configuration updated successfully');
      return updatedConfig;
    } catch (error) {
      logger.error(`Error updating user config: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new UserConfigService();