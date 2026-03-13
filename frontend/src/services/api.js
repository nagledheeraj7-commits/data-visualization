import axios from 'axios';
import toast from 'react-hot-toast';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://backend:3001/api';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    handleError(error);
    return Promise.reject(error);
  }
);

// Error handling utility
const handleError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('authToken');
        window.location.href = '/login';
        break;
      case 403:
        toast.error('Access denied. Insufficient permissions.');
        break;
      case 404:
        toast.error('Resource not found.');
        break;
      case 422:
        if (data.errors) {
          data.errors.forEach(err => toast.error(err));
        } else {
          toast.error(data.message || 'Validation error.');
        }
        break;
      case 429:
        toast.error('Too many requests. Please try again later.');
        break;
      case 500:
        toast.error('Server error. Please try again later.');
        break;
      default:
        toast.error('An unexpected error occurred.');
    }
  } else if (error.request) {
    toast.error('Network error. Please check your connection.');
  } else {
    toast.error('An unexpected error occurred.');
  }
};

// API Service
export const apiService = {
  // Authentication
  auth: {
    login: async (credentials) => {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    },
    register: async (userData) => {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    },
    refresh: async () => {
      const response = await apiClient.post('/auth/refresh');
      return response.data;
    },
    logout: async () => {
      await apiClient.delete('/auth/logout');
      localStorage.removeItem('authToken');
    },
  },

  // Sales Data
  sales: {
    getAll: async (params = {}) => {
      const response = await apiClient.get('/sales', { params });
      return response.data;
    },
    getById: async (id) => {
      const response = await apiClient.get(`/sales/${id}`);
      return response.data;
    },
    create: async (data) => {
      const response = await apiClient.post('/sales', data);
      toast.success('Sales record created successfully.');
      return response.data;
    },
    update: async (id, data) => {
      const response = await apiClient.put(`/sales/${id}`, data);
      toast.success('Sales record updated successfully.');
      return response.data;
    },
    delete: async (id) => {
      await apiClient.delete(`/sales/${id}`);
      toast.success('Sales record deleted successfully.');
    },
    export: async (params = {}) => {
      const response = await apiClient.get('/sales/export', { 
        params,
        responseType: 'blob'
      });
      return response.data;
    },
    import: async (formData) => {
      const response = await apiClient.post('/sales/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Data imported successfully.');
      return response.data;
    },
  },

  // Analytics
  analytics: {
    getKPI: async (params = {}) => {
      const response = await apiClient.get('/analytics/kpi', { params });
      return response.data;
    },
    getTrends: async (params = {}) => {
      const response = await apiClient.get('/analytics/trends', { params });
      return response.data;
    },
    getComparison: async (params) => {
      const response = await apiClient.post('/analytics/comparison', params);
      return response.data;
    },
    getReports: async (params = {}) => {
      const response = await apiClient.get('/analytics/reports', { params });
      return response.data;
    },
  },

  // User Management
  users: {
    getProfile: async () => {
      const response = await apiClient.get('/users/profile');
      return response.data;
    },
    updateProfile: async (data) => {
      const response = await apiClient.put('/users/profile', data);
      toast.success('Profile updated successfully.');
      return response.data;
    },
    getSettings: async () => {
      const response = await apiClient.get('/users/settings');
      return response.data;
    },
    updateSettings: async (data) => {
      const response = await apiClient.put('/users/settings', data);
      toast.success('Settings updated successfully.');
      return response.data;
    },
  },

  // File Upload
  upload: {
    uploadFile: async (file, onUploadProgress) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onUploadProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onUploadProgress(percentCompleted);
          }
        },
      });
      
      return response.data;
    },
  },

  // Real-time
  realtime: {
    connect: () => {
      const wsUrl = API_BASE_URL.replace('http', 'ws').replace('/api', '') + '/ws';
      return new WebSocket(wsUrl);
    },
  },
};

export default apiService;
