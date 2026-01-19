const API_BASE = import.meta.env.VITE_API_URL || '/api';

export class APIError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = 'APIError';
  }
}

export async function generateStream(systemPrompt, userPrompt, model, onChunk, onError) {
  try {
    const response = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_prompt: systemPrompt,
        user_prompt: userPrompt,
        model: model,
      }),
    });

    if (!response.ok) {
      throw new APIError(`HTTP ${response.status}`, response.status);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            
            if (data.error) {
              onError(data.error);
              return;
            }
            
            if (data.text) {
              onChunk(data.text);
            }
            
            if (data.done) {
              return;
            }
          } catch (e) {
            console.error('Failed to parse SSE data:', e);
          }
        }
      }
    }
  } catch (error) {
    onError(error.message || 'Failed to generate response');
  }
}

export async function savePrompt(systemPrompt, userPrompt, model, response = '') {
  const res = await fetch(`${API_BASE}/prompts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      system_prompt: systemPrompt,
      user_prompt: userPrompt,
      model: model,
      response: response,
    }),
  });

  if (!res.ok) {
    throw new APIError(`Failed to save prompt: ${res.status}`, res.status);
  }

  return res.json();
}

export async function getPrompt(promptId) {
  const res = await fetch(`${API_BASE}/prompts/${promptId}`);

  if (!res.ok) {
    throw new APIError(`Prompt not found: ${res.status}`, res.status);
  }

  return res.json();
}

export async function forkPrompt(parentId, systemPrompt, userPrompt, model) {
  const res = await fetch(`${API_BASE}/prompts/${parentId}/fork`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      parent_id: parentId,
      system_prompt: systemPrompt,
      user_prompt: userPrompt,
      model: model,
    }),
  });

  if (!res.ok) {
    throw new APIError(`Failed to fork prompt: ${res.status}`, res.status);
  }

  return res.json();
}

export async function getModels() {
  try {
    const res = await fetch(`${API_BASE}/models`);
    if (!res.ok) {
      return { models: ['qwen2.5:3b'] }; // Fallback
    }
    return res.json();
  } catch (error) {
    return { models: ['qwen2.5:3b'] }; // Fallback
  }
}

export async function healthCheck() {
  try {
    const res = await fetch(`${API_BASE}/../health`);
    return res.json();
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}