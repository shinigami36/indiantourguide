const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const getApiBaseUrl = () => API_URL;

export const warmBackend = async () => {
  if (!API_URL) return;

  try {
    await fetch(`${API_URL}/api/health`, {
      method: 'GET',
      cache: 'no-store',
    });
  } catch {
    // Ignore warm-up failures; form submit handles retry.
  }
};

export const postJsonWithRetry = async (
  path,
  payload,
  {
    timeoutMs = 25000,
    retryCount = 1,
    retryDelayMs = 1800,
  } = {}
) => {
  const endpoint = `${API_URL}${path}`;
  let lastError;

  for (let attempt = 0; attempt <= retryCount; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timer);

      let data = {};
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      }

      const canRetryStatus = [408, 425, 429, 500, 502, 503, 504].includes(res.status);
      const shouldRetry = !res.ok && canRetryStatus && attempt < retryCount;

      if (shouldRetry) {
        await delay(retryDelayMs);
        continue;
      }

      return { res, data };
    } catch (error) {
      clearTimeout(timer);
      lastError = error;

      if (attempt < retryCount) {
        await delay(retryDelayMs);
        continue;
      }
    }
  }

  throw lastError || new Error('Request failed');
};