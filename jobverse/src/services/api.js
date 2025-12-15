// src/services/api.js
// API Service - Kết nối với Backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// ==================== HELPER FUNCTIONS ====================

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    if (response.status === 401) {
      const refreshed = await tryRefreshToken();
      if (!refreshed) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    throw new Error(data.error?.message || 'Request failed');
  }
  
  return data;
};

const tryRefreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return false;
  
  try {
    const response = await fetch(`${API_BASE_URL}/v1/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      return true;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }
  return false;
};

const apiRequest = async (endpoint, options = {}) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
    ...options,
  };
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  return handleResponse(response);
};

// ==================== AUTH API ====================

export const authAPI = {
  login: (email, password) => 
    apiRequest('/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
    
  register: (userData) =>
    apiRequest('/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
    
  logout: () =>
    apiRequest('/v1/auth/logout', { method: 'POST' }),
};

// ==================== JOBS API ====================

export const jobsAPI = {
  getJobs: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/v1/jobs${queryString ? `?${queryString}` : ''}`);
  },
  
  getJobById: (id) => 
    apiRequest(`/v1/jobs/${id}`),
  
  searchJobs: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/v1/jobs/search?${queryString}`);
  },
  
  getTrendingJobs: () =>
    apiRequest('/v1/jobs/trending'),
  
  getJobsByCompany: (companyId) =>
    apiRequest(`/v1/companies/${companyId}/jobs`),
  
  saveJob: (jobId) =>
    apiRequest(`/v1/jobs/${jobId}/save`, { method: 'POST' }),
  
  unsaveJob: (jobId) =>
    apiRequest(`/v1/jobs/${jobId}/unsave`, { method: 'DELETE' }),
  
  getSavedJobs: () =>
    apiRequest('/v1/users/me/saved-jobs'),
  
  applyJob: (jobId, applicationData) =>
    apiRequest(`/v1/jobs/${jobId}/apply`, {
      method: 'POST',
      body: JSON.stringify(applicationData),
    }),
  
  getMyApplications: () =>
    apiRequest('/v1/users/me/applications'),
};

// ==================== COMPANIES API ====================

export const companiesAPI = {
  getCompanies: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/v1/companies${queryString ? `?${queryString}` : ''}`);
  },
  
  getCompanyById: (id) =>
    apiRequest(`/v1/companies/${id}`),
  
  getCompanyBySlug: (slug) =>
    apiRequest(`/v1/companies/slug/${slug}`),
  
  getCompanyReviews: (companyId) =>
    apiRequest(`/v1/companies/${companyId}/reviews`),
};

// ==================== CATEGORIES API ====================

export const categoriesAPI = {
  getCategories: () =>
    apiRequest('/v1/categories'),
};

// ==================== SKILLS API ====================

export const skillsAPI = {
  getSkills: () =>
    apiRequest('/v1/skills'),
    
  getTrendingSkills: () =>
    apiRequest('/v1/skills/trending'),
};

// ==================== USER API ====================

export const userAPI = {
  getProfile: () =>
    apiRequest('/v1/users/me'),
  
  updateProfile: (profileData) =>
    apiRequest('/v1/users/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),
};

export default {
  auth: authAPI,
  jobs: jobsAPI,
  companies: companiesAPI,
  categories: categoriesAPI,
  skills: skillsAPI,
  user: userAPI,
};
