const axios = require('axios');
const cheerio = require('cheerio');

exports.handler = async function(event, context) {
  // Set CORS headers to allow all origins for testing
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // First, test if the function is being called
    console.log('Function called');
    console.log('Environment variables:', {
      domain: process.env.CONFLUENCE_DOMAIN ? 'Set' : 'Not set',
      email: process.env.CONFLUENCE_EMAIL ? 'Set' : 'Not set',
      token: process.env.CONFLUENCE_API_TOKEN ? 'Set' : 'Not set',
      pageId: process.env.CONFLUENCE_PAGE_ID ? 'Set' : 'Not set'
    });

    // Basic authentication
    const auth = Buffer.from(
      `${process.env.CONFLUENCE_EMAIL}:${process.env.CONFLUENCE_API_TOKEN}`
    ).toString('base64');

    // Log the URL being called (remove sensitive info)
    console.log('Calling Confluence API at domain:', process.env.CONFLUENCE_DOMAIN);

    const response = await axios({
      method: 'get',
      url: `https://${process.env.CONFLUENCE_DOMAIN}/wiki/rest/api/content/${process.env.CONFLUENCE_PAGE_ID}?expand=body.storage`,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      }
    });

    // Log successful response
    console.log('Confluence API response received');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        content: response.data.body.storage.value
      })
    };

  } catch (error) {
    // Detailed error logging
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Error fetching content',
        message: error.message,
        details: error.response?.data || 'No additional details available'
      })
    };
  }
};
