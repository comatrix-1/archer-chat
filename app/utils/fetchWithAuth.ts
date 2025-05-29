import axios, { type AxiosRequestConfig } from 'axios';

export type FetchWithAuthOptions = AxiosRequestConfig & { token?: string, body?: any };

export async function fetchWithAuth(url: string, options: FetchWithAuthOptions = {}) {
  console.log('fetchWithAuth() :: START');
  const token = options.token ?? localStorage.getItem('authToken');
  console.log('fetchWithAuth() :: token:', token);
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'Content-Type': 'application/json',
  };

  const { body, ...rest } = options;
  return axios({ ...rest, url, headers, data: body });
}