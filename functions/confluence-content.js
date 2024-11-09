const axios = require('axios');
const cheerio = require('cheerio');

exports.handler = async function(event, context) {
  // Add specific Webflow domain to CORS headers
  const headers = {
    'Access-Control-Allow-Origin': 'https://project-starter-v12-e3354b551a67f9f409a.webflow.io',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const auth = Buffer.from(
      `${process.env.CONFLUENCE_EMAIL}:${process.env.CONFLUENCE_API_TOKEN}`
    ).toString('base64');

    const response = await axios({
      method: 'get',
      url: `https://${process.env.CONFLUENCE_DOMAIN}/wiki/rest/api/content/${process.env.CONFLUENCE_PAGE_ID}?expand=body.storage`,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      }
    });

    const content = transformContentForWebflow(response.data.body.storage.value);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        content: content
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: error.response?.status || 500,
      headers,
      body: JSON.stringify({
        error: 'Error fetching content',
        message: error.message
      })
    };
  }
};

function transformContentForWebflow(html) {
  const $ = cheerio.load(html);
  
  // Add classes to headings
  $('h1').addClass('confluence-h1');
  $('h2').addClass('confluence-h2');
  $('h3').addClass('confluence-h3');
  $('h4').addClass('confluence-h4');
  
  // Add classes to text elements
  $('p').addClass('confluence-paragraph');
  $('ul').addClass('confluence-list');
  $('ol').addClass('confluence-ordered-list');
  $('li').addClass('confluence-list-item');
  
  // Add classes to tables
  $('table').addClass('confluence-table');
  $('th').addClass('confluence-table-header');
  $('td').addClass('confluence-table-cell');
  
  // Add classes to links and images
  $('a').addClass('confluence-link');
  $('img').addClass('confluence-image');
  
  return `<div class="confluence-content-wrapper">${$.html()}</div>`;
