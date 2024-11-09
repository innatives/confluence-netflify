```markdown
# Confluence to Webflow Integration

Display Confluence content in Webflow using Netlify Functions.

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment variables in Netlify:
   - CONFLUENCE_DOMAIN
   - CONFLUENCE_EMAIL
   - CONFLUENCE_API_TOKEN
   - CONFLUENCE_PAGE_ID

4. Deploy to Netlify

## Local Development

1. Install Netlify CLI globally:
   ```bash
   npm install -g netlify-cli
   ```

2. Create a `.env` file with your Confluence credentials:
   ```
   CONFLUENCE_DOMAIN=your-domain.atlassian.net
   CONFLUENCE_EMAIL=your-email@domain.com
   CONFLUENCE_API_TOKEN=your-api-token
   CONFLUENCE_PAGE_ID=your-page-id
   ```

3. Start local development server:
   ```bash
   npm start
   ```

## Webflow Integration

Add this code to your Webflow site's embed element:

```html


  const confluenceContentDiv = document.getElementById('confluence-content');
  const NETLIFY_URL = 'your-netlify-site-url';
  
  async function fetchConfluenceContent() {
    try {
      const response = await fetch(`${NETLIFY_URL}/.netlify/functions/confluence-content`);
      const data = await response.json();
      if (data.content) {
        confluenceContentDiv.innerHTML = data.content;
      }
    } catch (error) {
      console.error('Error:', error);
      confluenceContentDiv.innerHTML = 'Error loading content';
    }
  }
  
  document.addEventListener('DOMContentLoaded', fetchConfluenceContent);

```
