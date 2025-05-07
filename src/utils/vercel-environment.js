/**
 * Helper utility to check and manage Vercel deployment environment
 */

// Determine if the app is running on Vercel
const isVercelEnvironment = () => {
  return process.env.VERCEL === '1';
};

// Get current environment (development, preview, production)
const getVercelEnvironment = () => {
  if (!isVercelEnvironment()) return 'local';
  return process.env.VERCEL_ENV || 'development';
};

// Check if persistent filesystem access is available
const hasPersistentFileSystem = () => {
  return !isVercelEnvironment();
};

module.exports = {
  isVercelEnvironment,
  getVercelEnvironment,
  hasPersistentFileSystem
};