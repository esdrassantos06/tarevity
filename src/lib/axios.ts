import axios from 'axios';
import { getSession } from 'next-auth/react';

export interface APIError {
  message: string;
  status?: number;
  code?: string;
}

export function isAPIError(error: unknown): error is APIError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error
  );
}


const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});

// Request interceptor
axiosClient.interceptors.request.use(
  async (config) => {

    if (typeof window !== 'undefined') {
      try {
        const session = await getSession();
        
        if (session && session.user) {
          // Optional: add a Bearer token to the request headers
          // config.headers.Authorization = `Bearer ${session.accessToken}`;
        }
      } catch (error) {
        console.error('Error getting session:', error);
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Axios error:', error);
    }

    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      switch (status) {
        case 401:
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
          break;
        
        case 429:
          console.warn('Request limit exceeded');
          break;
        
        case 500:
          console.error('Internal server error');
          break;
      }

      // Reject the promise with a custom error
      return Promise.reject({
        message: errorData?.message || 'Unknown error',
        status,
        code: errorData?.code
      });
    }

    // Network error or no response from the server
    return Promise.reject({
      message: 'Connection error. Check your internet.',
      status: null
    });
  }
);

export default axiosClient;
