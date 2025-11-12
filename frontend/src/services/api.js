import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses and errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

// Inventory services
export const inventoryService = {
  getAll: (params) => api.get('/inventory', { params }),
  getById: (id) => api.get(`/inventory/${id}`),
  create: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  delete: (id) => api.delete(`/inventory/${id}`),
  compare: (itemIds) => api.post('/inventory/compare', { item_ids: itemIds }),
  import: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/inventory/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getCategories: () => api.get('/inventory/meta/categories')
};

// Jobs services
export const jobsService = {
  getAll: (params) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  addItems: (jobId, items) => api.post(`/jobs/${jobId}/items`, { items }),
  removeItem: (jobId, itemId) => api.delete(`/jobs/${jobId}/items/${itemId}`)
};

// Users services
export const usersService = {
  getAll: () => api.get('/users'),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  changePassword: (id, password) => api.put(`/users/${id}/password`, { password }),
  deactivate: (id) => api.delete(`/users/${id}`)
};

// Customers services
export const customersService = {
  getAll: (params) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`)
};

// Activity Logs services
export const activityLogsService = {
  getAll: (params) => api.get('/activity-logs', { params }),
  getRecent: () => api.get('/activity-logs/recent'),
  getStats: () => api.get('/activity-logs/stats')
};

// Reports services
export const reportsService = {
  getInventorySummary: () => api.get('/reports/inventory/summary'),
  getJobsSummary: () => api.get('/reports/jobs/summary'),
  getCustomersSummary: () => api.get('/reports/customers/summary'),
  getActivitySummary: (params) => api.get('/reports/activity/summary', { params }),
  getDashboard: () => api.get('/reports/dashboard')
};

export default api;
