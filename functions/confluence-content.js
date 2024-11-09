const axios = require('axios');
const cheerio = require('cheerio');

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Remove any https:// if it exists in the domain
    const domain = process.env.CONFLUENCE_DOMAIN.replace('https://', '').replace('http://', '');
    
    // Log the configuration (excluding sensitive data)
    console.log('Configuration:', {
      domain: domain,
      hasEmail: !!process.env.CONFLUENCE_EMAIL,
      hasToken: !!process.env.CONFLUENCE_API_TOKEN,
      pageId: process.env.CONFLUENCE_PAGE_ID
    });

    const auth = Buffer.from(
      `${process.env.CONFLUENCE_EMAIL}:${process.env.CONFLUENCE_API_TOKEN}`
    ).toString('base64');

    const confluenceUrl = `https://${domain}/wiki/rest/api/content/${process.env.CONFLUENCE_PAGE_ID}?expand=body.storage`;
    console.log('Requesting URL:', confluenceUrl);

    const response = await axios({
      method: 'get',
      url: confluenceUrl,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      }
    });

    // Transform content
    const $ = cheerio.load(response.data.body.storage.value);
    
    // Add classes to elements
    $('h1').addClass('confluence-h1');
    $('h2').addClass('confluence-h2');
    $('h3').addClass('confluence-h3');
    $('p').addClass('confluence-paragraph');
    $('ul').addClass('confluence-list');
    $('ol').addClass('confluence-ordered-list');
    $('li').addClass('confluence-list-item');
    $('table').addClass('confluence-table');
    $('th').addClass('confluence-table-header');
    $('td').addClass('confluence-table-cell');
    $('a').addClass('confluence-link');
    $('img').addClass('confluence-image');

    const transformedContent = `<div class="confluence-content-wrapper">${$.html()}</div>`;

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: transformedContent,
        title: response.data.title
      })
    };

  } catch (error) {
    console.error('Function error:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });

    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Error fetching content',
        message: error.message,
        details: error.response?.data || error.stack || 'No additional details available'
      })
    };
  }
};
