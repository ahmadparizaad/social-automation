const axios = require('axios');
const { logger } = require('../utils/logger');

/**
 * Enhanced service to interact with LinkedIn API for post publishing
 * Based on LinkedIn API JS Client principles
 */
class LinkedInService {
  constructor() {
    // Use environment variables with fallback to hardcoded values
    this.clientId = process.env.LINKEDIN_CLIENT_ID || '77jp9mc355j1dz';
    this.clientSecret = process.env.LINKEDIN_CLIENT_SECRET || 'WPL_AP1.xAWE09KHhrQOMGOF.kKHmug==';
    this.redirectUri = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3000/api/auth/linkedin/callback';
    this.accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
    this.apiUrl = 'https://api.linkedin.com/v2';
    this.oauthUrl = 'https://www.linkedin.com/oauth/v2';

    // Log configuration (but hide secret)
    logger.info('LinkedIn Service initialized with:', {
      clientId: this.clientId,
      redirectUri: this.redirectUri,
      hasSecret: !!this.clientSecret
    });
  }

  /**
   * Generate authorization URL for LinkedIn OAuth flow
   * 
   * @param {Array} scopes - Array of scopes to request
   * @param {String} state - State parameter for CSRF protection
   * @returns {String} - Authorization URL
   */
  generateAuthorizationUrl(scopes = ['openid', 'profile', 'email', 'w_member_social'], state = '') {
    if (!this.redirectUri) {
      throw new Error('Redirect URI is not configured');
    }

    const scopeParam = scopes.join(' ');
    const authUrl = new URL(`${this.oauthUrl}/authorization`);
    
    logger.info('Generating authorization URL with params:', {
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scopes: scopeParam,
      state
    });

    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', this.clientId);
    authUrl.searchParams.append('redirect_uri', this.redirectUri);
    authUrl.searchParams.append('scope', scopeParam);
    
    if (state) {
      authUrl.searchParams.append('state', state);
    }
    
    return authUrl.toString();
  }

  /**
   * Exchange authorization code for access token
   * 
   * @param {String} code - Authorization code
   * @returns {Promise<Object>} - Token details
   */
  async exchangeAuthCodeForAccessToken(code) {
    try {
      logger.info('Attempting to exchange authorization code for access token');
      logger.info(`Using redirect URI: ${this.redirectUri}`);
      
      if (!this.clientId || !this.clientSecret) {
        throw new Error('LinkedIn client credentials are not configured');
      }

      const params = {
        grant_type: 'authorization_code',
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri
      };

      logger.info('Making token exchange request with params:', { ...params, client_secret: '[REDACTED]' });

      const response = await axios.post(
        `${this.oauthUrl}/accessToken`,
        null,
        {
          params,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      logger.info('Successfully exchanged code for access token');
      return response.data;
    } catch (error) {
      logger.error(`Error exchanging code for token: ${error.message}`);
      if (error.response) {
        logger.error(`Response status: ${error.response.status}`);
        logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
        logger.error('Response headers:', error.response.headers);
      } else if (error.request) {
        logger.error('No response received from LinkedIn');
        logger.error('Request details:', error.request);
      }
      throw new Error(`Failed to exchange code for token: ${error.message}`);
    }
  }

  /**
   * Refresh access token using refresh token
   * 
   * @param {String} refreshToken - Refresh token
   * @returns {Promise<Object>} - New token details
   */
  async refreshAccessToken(refreshToken) {
    try {
      const response = await axios.post(
        `${this.oauthUrl}/accessToken`,
        null,
        {
          params: {
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: this.clientId,
            client_secret: this.clientSecret
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      logger.info('Successfully refreshed access token');
      return response.data;
    } catch (error) {
      logger.error(`Error refreshing token: ${error.message}`);
      if (error.response) {
        logger.error(`Response status: ${error.response.status}`);
        logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
      }
      throw new Error(`Failed to refresh token: ${error.message}`);
    }
  }

  /**
   * Format a post for LinkedIn API
   * 
   * @param {Object} post - Post object to format
   * @returns {Object} - Formatted post for LinkedIn API
   */
  formatPostForLinkedIn(post) {
    // This formatting follows LinkedIn's Share API requirements
    return {
      author: `urn:li:person:${process.env.LINKEDIN_PERSON_ID || 'me'}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: post.content
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };
  }

  /**
   * Format a post with media for LinkedIn API
   * 
   * @param {Object} post - Post object to format
   * @param {Array} mediaUrns - Array of media URNs
   * @returns {Object} - Formatted post for LinkedIn API
   */
  formatPostWithMedia(post, mediaUrns) {
    const formattedPost = this.formatPostForLinkedIn(post);
    
    // Add media array to the post
    formattedPost.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'IMAGE';
    formattedPost.specificContent['com.linkedin.ugc.ShareContent'].media = mediaUrns.map(urn => ({
      status: 'READY',
      media: urn
    }));
    
    return formattedPost;
  }

  /**
   * Publish a post to LinkedIn
   * 
   * @param {Object} post - Post object to publish
   * @param {String} token - Access token (optional - will use default if not provided)
   * @returns {Promise<Object>} - Publication result
   */
  async publishPost(post, token) {
    try {
      logger.info('Attempting to publish post to LinkedIn');
      
      const accessToken = token || this.accessToken;
      
      // Check if we're in test mode
      if (process.env.NODE_ENV === 'test' || !accessToken) {
        logger.info('Running in test mode, simulating LinkedIn API call');
        return {
          success: true,
          id: `urn:li:share:${Date.now()}`,
          message: 'Post simulated in test mode',
          timestamp: new Date().toISOString(),
          post: post
        };
      }

      // Format post for LinkedIn API
      const formattedPost = this.formatPostForLinkedIn(post);
      
      // Call LinkedIn API to publish the post
      const response = await axios.post(
        `${this.apiUrl}/ugcPosts`,
        formattedPost,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0'
          }
        }
      );

      logger.info(`Post published successfully to LinkedIn: ${response.data.id}`);
      
      return {
        success: true,
        id: response.data.id,
        timestamp: new Date().toISOString(),
        post: post
      };
    } catch (error) {
      logger.error(`Error publishing to LinkedIn: ${error.message}`);
      if (error.response) {
        logger.error(`Response status: ${error.response.status}`);
        logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
      }
      
      throw new Error(`Failed to publish post to LinkedIn: ${error.message}`);
    }
  }

  /**
   * Get engagement metrics for a post
   * 
   * @param {string} postId - ID of the post to get metrics for
   * @param {String} token - Access token (optional - will use default if not provided)
   * @returns {Promise<Object>} - Engagement metrics
   */
  async getPostEngagement(postId, token) {
    try {
      const accessToken = token || this.accessToken;
      
      // Check if we're in test mode
      if (process.env.NODE_ENV === 'test' || !accessToken) {
        logger.info('Running in test mode, simulating LinkedIn API call for metrics');
        return {
          postId,
          likes: Math.floor(Math.random() * 50),
          comments: Math.floor(Math.random() * 20),
          shares: Math.floor(Math.random() * 10),
          views: Math.floor(Math.random() * 500),
          timestamp: new Date().toISOString()
        };
      }

      // Extract URN from the post ID if it's a full URN
      const urn = postId.includes(':') ? postId : `urn:li:share:${postId}`;
      const encodedUrn = encodeURIComponent(urn);

      logger.info(`Fetching engagement metrics for post: ${urn}`);

      // First try the organization metrics endpoint
      try {
        const response = await axios.get(
          `${this.apiUrl}/organizationalEntityShareStatistics?q=organizationalEntity&shares[0]=${encodedUrn}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'X-Restli-Protocol-Version': '2.0.0',
              'LinkedIn-Version': '202304'
            }
          }
        );

        const stats = response.data.elements[0];
        return {
          postId: urn,
          likes: stats.totalShareStatistics.likeCount || 0,
          comments: stats.totalShareStatistics.commentCount || 0,
          shares: stats.totalShareStatistics.shareCount || 0,
          views: stats.totalShareStatistics.impressionCount || 0,
          timestamp: new Date().toISOString()
        };
      } catch (orgError) {
        logger.info('Organization metrics not available, trying social metrics endpoint');
        
        // Try the social metrics endpoint
        const response = await axios.get(
          `${this.apiUrl}/socialMetrics/${encodedUrn}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'X-Restli-Protocol-Version': '2.0.0',
              'LinkedIn-Version': '202304'
            }
          }
        );

        return {
          postId: urn,
          likes: response.data.numLikes || 0,
          comments: response.data.numComments || 0,
          shares: response.data.numShares || 0,
          views: response.data.numImpressions || 0,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      logger.error(`Error getting post engagement: ${error.message}`);
      if (error.response) {
        logger.error(`Response status: ${error.response.status}`);
        logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
      }
      
      // Return default metrics with error info
      return {
        postId,
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0,
        timestamp: new Date().toISOString(),
        error: error.message,
        note: 'Metrics might not be available immediately after posting'
      };
    }
  }

  /**
   * Initialize media upload
   * 
   * @param {String} mediaType - Type of media (e.g., 'image')
   * @param {Buffer} fileBuffer - File buffer to upload
   * @param {String} token - Access token (optional)
   * @returns {Promise<Object>} Upload details including upload URL
   */
  async initializeMediaUpload(mediaType, fileBuffer, token) {
    try {
      const accessToken = token || this.accessToken;
      
      logger.info('Initializing media upload');
      
      const response = await axios.post(
        `${this.apiUrl}/assets?action=registerUpload`,
        {
          registerUploadRequest: {
            recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
            owner: `urn:li:person:${process.env.LINKEDIN_PERSON_ID || 'me'}`,
            serviceRelationships: [{
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent'
            }]
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0',
            'LinkedIn-Version': '202304'
          }
        }
      );

      logger.info('Media upload initialized');
      return response.data.value;
    } catch (error) {
      logger.error(`Error initializing media upload: ${error.message}`);
      throw error;
    }
  }

  /**
   * Upload media to LinkedIn
   * 
   * @param {String} uploadUrl - URL to upload the media to
   * @param {Buffer} fileBuffer - File buffer to upload
   * @returns {Promise<void>}
   */
  async uploadMedia(uploadUrl, fileBuffer) {
    try {
      logger.info('Uploading media to LinkedIn');
      
      await axios.put(
        uploadUrl,
        fileBuffer,
        {
          headers: {
            'Content-Type': 'application/octet-stream'
          }
        }
      );

      logger.info('Media upload completed');
    } catch (error) {
      logger.error(`Error uploading media: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a post with media on LinkedIn
   * 
   * @param {Object} post - Post content
   * @param {Array<Buffer>} mediaFiles - Array of media file buffers
   * @param {String} token - Access token (optional)
   * @returns {Promise<Object>} Post result
   */
  async publishPostWithMedia(post, mediaFiles, token) {
    try {
      logger.info('Publishing post with media');
      
      // Initialize upload for each media file
      const mediaAssets = await Promise.all(
        mediaFiles.map(file => this.initializeMediaUpload('image', file, token))
      );

      // Upload each media file
      await Promise.all(
        mediaAssets.map((asset, index) => 
          this.uploadMedia(asset.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl, mediaFiles[index])
        )
      );

      // Create post with media
      const mediaUrns = mediaAssets.map(asset => asset.asset);
      return await this.publishPost(post, token, mediaUrns);
    } catch (error) {
      logger.error(`Error publishing post with media: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new LinkedInService(); 