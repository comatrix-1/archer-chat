import axios, { type AxiosRequestConfig } from 'axios';

// Utility to fetch with JWT Authorization header using axios
export type FetchWithAuthOptions = AxiosRequestConfig & { token?: string, body?: any };

/**
 * Fetch with JWT Authorization header using axios.
 * 
 * @param url The URL to fetch.
 * @param options Options for the fetch request.
 * @returns The axios response. Use `res.data` to access the response data.
 */
export async function fetchWithAuth(url: string, options: FetchWithAuthOptions = {}) {
  console.log('fetchWithAuth() :: START');
  const token = options.token || localStorage.getItem('token');
  console.log('fetchWithAuth() :: token:', token);
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'Content-Type': 'application/json',
  };
  // If 'body' is provided (like fetch), move it to 'data' for axios
  const { body, ...rest } = options;
  return axios({ ...rest, url, headers, data: body });
}
