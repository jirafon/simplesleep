/**
 * Axios Interceptor for debugging
 * Logs all requests and responses to help troubleshoot connectivity issues
 */

import axios from 'axios';

export const setupAxiosInterceptor = () => {
  // Request interceptor
  axios.interceptors.request.use(
    (config) => {
      console.log(`📤 Request: ${config.method.toUpperCase()} ${config.url}`, {
        baseURL: config.baseURL,
        timeout: config.timeout,
        headers: {
          ...config.headers,
          Authorization: config.headers.Authorization ? '***REDACTED***' : 'none'
        }
      });
      return config;
    },
    (error) => {
      console.error('❌ Request error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  axios.interceptors.response.use(
    (response) => {
      const dataInfo = response.data 
        ? {
            dataKeys: Object.keys(response.data),
            hasToken: !!response.data.token,
            hasUser: !!response.data.user,
            dataType: typeof response.data
          }
        : { dataKeys: [], dataIsNull: true, dataValue: response.data };
      
      console.log(`📥 Response: ${response.status} ${response.config.url}`, dataInfo);
      return response;
    },
    (error) => {
      if (error.response) {
        console.error(`❌ Response error: ${error.response.status} ${error.config.url}`, {
          message: error.response.data?.message || error.message,
          data: error.response.data
        });
      } else if (error.request) {
        console.error(`❌ No response received: ${error.config.url}`, {
          message: error.message,
          code: error.code,
          isTimeout: error.code === 'ECONNABORTED'
        });
      } else {
        console.error('❌ Axios error:', error.message);
      }
      return Promise.reject(error);
    }
  );
};

export default setupAxiosInterceptor;
