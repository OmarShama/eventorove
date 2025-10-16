// Utility functions for authenticated API calls
import { config } from './config';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Ensure URL is absolute by prepending config.apiUrl if it's relative
  const fullUrl = url.startsWith('http') ? url : `${config.apiUrl}${url}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(fullUrl, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `${response.status}: ${errorText}`;

    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorJson.error || errorMessage;
    } catch {
      // Keep original error message if JSON parsing fails
    }

    throw new Error(errorMessage);
  }

  const result = await response.json();
  return result.data || result;
}

export async function getWithAuth(url: string) {
  return fetchWithAuth(url);
}

export async function postWithAuth(url: string, data: any) {
  return fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function patchWithAuth(url: string, data: any) {
  return fetchWithAuth(url, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteWithAuth(url: string) {
  return fetchWithAuth(url, {
    method: 'DELETE',
  });
}

export function isUnauthorizedError(error: Error): boolean {
  return error.message.includes('401') || error.message.includes('Unauthorized');
}