const https = require('https');

function getApiKey() {
  const key = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;
  if (!key) {
    throw new Error('Missing OpenAI API key. Set OPENAI_API_KEY or OPENAI_KEY.');
  }
  return key;
}

function requestJson(url, options) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const payload = Buffer.concat(chunks).toString('utf8');
        try {
          const result = JSON.parse(payload);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(result);
          } else {
            reject(new Error(`${res.statusCode} ${res.statusMessage}: ${JSON.stringify(result)}`));
          }
        } catch (err) {
          reject(err);
        }
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function createChatCompletion(messages) {
  const apiKey = getApiKey();
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const body = JSON.stringify({
    model,
    messages,
    temperature: 0.8,
    max_tokens: 600,
  });

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Content-Length': Buffer.byteLength(body),
    },
  };

  const url = new URL('https://api.openai.com/v1/chat/completions');
  const response = await requestJson(url, { ...options, path: url.pathname + url.search, hostname: url.hostname });

  return response.choices && response.choices[0] && response.choices[0].message && response.choices[0].message.content
    ? response.choices[0].message.content.trim()
    : null;
}

module.exports = {
  createChatCompletion,
};
