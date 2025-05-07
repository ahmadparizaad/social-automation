const winston = require('winston');
const fs = require('fs');
const path = require('path');
const { hasPersistentFileSystem } = require('./vercel-environment');

// Create logger configuration
const createLogger = () => {
  // Base configuration
  const loggerConfig = {
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      // Always write to console
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      })
    ]
  };

  // Only add file transports when in environments with persistent file systems
  if (hasPersistentFileSystem()) {
    // Create logs directory if it doesn't exist
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Add file transports
    loggerConfig.transports.push(
      // Write to error log file
      new winston.transports.File({ 
        filename: path.join(logsDir, 'error.log'), 
        level: 'error' 
      }),
      // Write to combined log file
      new winston.transports.File({ 
        filename: path.join(logsDir, 'combined.log')
      })
    );
  }

  return winston.createLogger(loggerConfig);
};

// Export the configured logger
const logger = createLogger();

module.exports = { logger };