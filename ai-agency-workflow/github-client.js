import https from 'https';

function getToken() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) {
    throw new Error('Missing GitHub token. Set GITHUB_TOKEN or GH_TOKEN.');
  }
  return token;
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

const BASE_URL = 'https://api.github.com';

async function githubRequest(path, method = 'GET', body) {
  const token = getToken();
  const url = new URL(`${BASE_URL}${path}`);
  const options = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': 'ai-agency-workflow',
      Accept: 'application/vnd.github+json',
    },
  };
  if (body) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }
  return requestJson(url, options);
}

export async function getAuthenticatedUser() {
  return githubRequest('/user');
}

export async function searchIssues(query, perPage = 10) {
  return githubRequest(`/search/issues?q=${encodeURIComponent(query)}&per_page=${perPage}`);
}

export async function searchDiscussions(query, perPage = 10) {
  return githubRequest(`/search/issues?q=${encodeURIComponent(query)}&per_page=${perPage}`);
}

export async function createIssue(ownerRepo, title, body) {
  return githubRequest(`/repos/${ownerRepo}/issues`, 'POST', { title, body });
}

export default {
  getAuthenticatedUser,
  searchIssues,
  searchDiscussions,
  createIssue,
};
