```javascript
const axios = require('axios');
const cheerio = require('cheerio');

// Function to transform HTML content
function transformContentForWebflow(html) {
  const $ = cheerio.load(html);
  
  // Add classes to headings
  $('h1').addClass('confluence-h1');
  $('h2').addClass('confluence-h2');
  $('h3').addClass('confluence-h3');
  $('h4').addClass('confluence-h4');
  $('h5').addClass('confluence-h5');
  $('h6').addClass('confluence-h6');
  
  // Add classes to text elements
  $('p').addClass('confluence-paragraph');
  $('ul').addClass('confluence-list');
  $('ol').addClass('confluence-ordered-list');
  $('li').addClass('confluence-list-item');
  
  // Add classes to tables
  $('table').addClass('confluence-table');
  $('th').addClass('confluence-table-header');
  $('td').addClass('confluence-table-cell');
  $('tr').addClass('confluence-table-row');
  
  // Add classes to links and images
  $('a').addClass('confluence-link');
  $('img').addClass('confluence-image');
  
  // Add classes to special elements
  $('code').addClass('confluence-code');
  $('pre').addClass('confluence-pre');
  $('blockquote').addClass('confluence-quote');
  
  // Add classes to other common elements
  $('strong, b').addClass('confluence-bold');
  $('em, i').addClass('confluence-italic');
  $('span').addClass('confluence-span');
  
  // Wrap content in a container
  return `${$.html()}`;
}

exports.handler = async function(event, context) {
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Create authentication token
    const auth = Buffer.from(
      `${process.env.CONFLUENCE_EMAIL}:${process.env.CONFLUENCE_API_TOKEN}`
    ).toString('base64');

    // Fetch content from Confluence
    const response = await axios({
      method: 'get',
      url: `https://${process.env.CONFLUENCE_DOMAIN}/wiki/rest/api/content/${process.env.CONFLUENCE_PAGE_ID}?expand=body.storage`,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      }
    });

    // Transform the content
    const transformedContent = transformContentForWebflow(response.data.body.storage.value);

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: transformedContent,
        title: response.data.title,
        id: response.data.id,
        type: response.data.type
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: error.response?.status || 500,
      headers,
      body: JSON.stringify({
        error: 'Error fetching content',
        message: error.message,
        details: error.response?.data || 'No additional details available'
      })
    };
  }
};
```
