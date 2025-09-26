/**
 * API Configuration
 * Supports separate frontend/backend deployments
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export function getApiUrl(path: string): string {
  if (API_BASE_URL) {
    return `${API_BASE_URL}${path}`;
  }

  return path;
}

export { API_BASE_URL };