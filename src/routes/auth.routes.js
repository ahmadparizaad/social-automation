const express = require('express');
const { logger } = require('../utils/logger');
const linkedinService = require('../services/linkedin.service');

const router = express.Router();

// Route to redirect to LinkedIn for authentication
router.get('/linkedin', (req, res) => {
  try {
    // Generate a random state parameter for CSRF protection
    const state = Math.random().toString(36).substring(2, 15);
    
    // Store state in session or cookie (for this example, we're using a simple approach)
    res.cookie('linkedin_oauth_state', state, { maxAge: 600000, httpOnly: true }); // 10 minutes
    
    // Generate the authorization URL with authorized scopes
    const authUrl = linkedinService.generateAuthorizationUrl(
      ['openid', 'profile', 'email', 'w_member_social'],
      state
    );
    
    // Redirect the user to LinkedIn
    res.redirect(authUrl);
  } catch (error) {
    logger.error(`Error initiating LinkedIn auth: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate LinkedIn authentication'
    });
  }
});

// Callback route that LinkedIn will redirect to after authentication
router.get('/linkedin/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;
    
    // Check if there was an error
    if (error) {
      logger.error(`LinkedIn auth error: ${error}`);
      return res.status(400).json({
        success: false,
        error: `LinkedIn authentication error: ${error}`
      });
    }
    
    // Verify state parameter (to prevent CSRF)
    const storedState = req.cookies.linkedin_oauth_state;
    if (!storedState || storedState !== state) {
      logger.error('State parameter mismatch');
      return res.status(403).json({
        success: false,
        error: 'State parameter mismatch. Possible CSRF attack.'
      });
    }
    
    // Exchange authorization code for access token
    const tokenDetails = await linkedinService.exchangeAuthCodeForAccessToken(code);
    
    // Clear state cookie
    res.clearCookie('linkedin_oauth_state');
    
    // In a real application, you would store the token securely
    // For this example, we're just sending it back to the client
    res.json({
      success: true,
      message: 'Authentication successful',
      tokenDetails: {
        accessToken: tokenDetails.access_token,
        expiresIn: tokenDetails.expires_in,
        refreshToken: tokenDetails.refresh_token,
        refreshTokenExpiresIn: tokenDetails.refresh_token_expires_in
      }
    });
  } catch (error) {
    logger.error(`Error in LinkedIn callback: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to complete LinkedIn authentication'
    });
  }
});

// Route to refresh an access token
router.post('/linkedin/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      });
    }
    
    // Refresh the token
    const tokenDetails = await linkedinService.refreshAccessToken(refreshToken);
    
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      tokenDetails: {
        accessToken: tokenDetails.access_token,
        expiresIn: tokenDetails.expires_in,
        refreshToken: tokenDetails.refresh_token,
        refreshTokenExpiresIn: tokenDetails.refresh_token_expires_in
      }
    });
  } catch (error) {
    logger.error(`Error refreshing token: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh token'
    });
  }
});

module.exports = router; 