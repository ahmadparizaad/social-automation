require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const socialContentService = require('../src/services/social-content.service');
const linkedinService = require('../src/services/linkedin.service');
const { logger } = require('../src/utils/logger');
const userConfig = require('../data/userConfig.json');
async function generateAndPostContent() {
  try {
    // Create assets directory if it doesn't exist
    const assetsDir = path.join(__dirname, 'assets');
    try {
      await fs.mkdir(assetsDir, { recursive: true });
    } catch (err) {
      if (err.code !== 'EEXIST') throw err;
    }

    // Check if example images exist, if not create placeholder images
    const imagePath1 = path.join(assetsDir, 'example1.jpg');
    const imagePath2 = path.join(assetsDir, 'example2.jpg');

    try {
      await fs.access(imagePath1);
      await fs.access(imagePath2);
    } catch (err) {
      logger.info('Example images not found, creating placeholder images...');
      // Create simple placeholder images (1x1 pixel JPEGs)
      const placeholderImage = Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00,
        0x01, 0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xff, 0xdb,
        0x00, 0x43, 0x00, 0xff, 0xff, 0xff, 0xff, 0xff
      ]);
      
      await fs.writeFile(imagePath1, placeholderImage);
      await fs.writeFile(imagePath2, placeholderImage);
      logger.info('Created placeholder images in assets directory');
    }

    // Read image files
    const imageBuffer1 = await fs.readFile(imagePath1);
    const imageBuffer2 = await fs.readFile(imagePath2);

    // Content generation options
    const options = {
      prompt: "Write about the latest trends in artificial intelligence and machine learning",
      tone: "professional",
      keywords: ["AI", "machine learning", "innovation", "technology"],
      mediaFiles: [imageBuffer1, imageBuffer2],
      accessToken: process.env.LINKEDIN_ACCESS_TOKEN,
      userConfig: userConfig
    };

    // Generate content and publish
    const result = await socialContentService.generateAndPublishContent(options);

    logger.info('Successfully published post:', {
      postId: result.postId,
      content: result.content,
      timestamp: result.timestamp
    });

    // Get engagement metrics after a delay (optional)
    setTimeout(async () => {
      try {
        const metrics = await linkedinService.getPostEngagement(result.postId);
        logger.info('Post engagement metrics:', metrics);
      } catch (error) {
        logger.warn('Could not fetch engagement metrics:', error.message);
      }
    }, 5000); // Wait 5 seconds before checking metrics

  } catch (error) {
    logger.error('Error in generate and post script:', error);
    process.exit(1);
  }
}

// Run the example
generateAndPostContent(); 