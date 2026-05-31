function getApiKey() {
  const key = process.env.FREETHEAI_API_KEY || process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;
  if (!key) {
    throw new Error('Missing AI API key. Set FREETHEAI_API_KEY or OPENAI_API_KEY.');
  }
  return key;
}

export async function createChatCompletion(messages) {
  const apiKey = getApiKey();
  const model = process.env.OPENAI_MODEL || 'kai/poolside/laguna-xs.2:free';
  const baseUrl = process.env.OPENAI_BASE_URL || process.env.OPENAI_API_BASE_URL || process.env.FREETHEAI_BASE_URL || 'https://api.freetheai.xyz/v1';
  const url = `${baseUrl.replace(/\/$/, '')}/chat/completions`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, temperature: 0.8, max_tokens: 600 }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${JSON.stringify(result)}`);
  }

  return result.choices?.[0]?.message?.content?.trim() || null;
}
