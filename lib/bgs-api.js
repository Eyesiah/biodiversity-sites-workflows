import { API_URL } from '@/config';

async function queryBGSAPI(endpoint, verb = 'POST', body = {}) {

  // Make the actual request
  const url = `${API_URL}/${endpoint}`
  const params = {
    method: verb,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'BristolTrees BGS Register/1.0 (https://bgs.bristoltrees.space/)',
    },
    next: { revalidate: 21600 }
  }
  if (verb == 'POST' && body) {
    params.body = JSON.stringify(body);
  }

  let response = await fetch(url, params);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url} after ${maxAttempts} attempts, last status: ${response.status}`);
  }

  const data = await response.json();

  return data;
}

export default queryBGSAPI;