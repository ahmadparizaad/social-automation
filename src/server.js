const app = require('./app');
const { logger } = require('./utils/logger');
const schedulerService = require('./services/scheduler.service');

// Get port from environment variable or use default
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, async () => {
  logger.info(`Server is running on port ${PORT}`);
  
  // Initialize the scheduler for automated post generation and publishing
  await schedulerService.initialize();
});

// Handle application shutdown
process.on('SIGINT', async () => {
  logger.info('Application shutting down');
  
  // Stop the scheduler
  schedulerService.stop();
  
  process.exit(0);
}); 