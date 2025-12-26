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
      // Token expired, try to refresh
      const refreshed = await refreshToken();
      if (!refreshed) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    throw new Error(data.message || data.error?.message || 'Request failed');
  }
  
  return data;
};

const refreshToken = async () => {
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
      return true;
    }
  } catch (error) {
    console.error('Refresh token error:', error);
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

  loginWithGoogle: (credential) =>
    apiRequest('/v1/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    }),
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
    return apiRequest(`/v1/jobs/search${queryString ? `?${queryString}` : ''}`);
  },

  getTrendingJobs: () =>
    apiRequest('/v1/jobs/trending'),

  getJobsByCompany: (companyId) =>
    apiRequest(`/v1/companies/${companyId}/jobs`),

  // Saved Jobs - Cần auth
  saveJob: (jobId) => {
    console.log('Saving job with token:', localStorage.getItem('accessToken')); // Debug
    return apiRequest(`/v1/saved-jobs/${jobId}`, { method: 'POST' });
  },

  unsaveJob: (jobId) => {
    console.log('Unsaving job with token:', localStorage.getItem('accessToken')); // Debug
    return apiRequest(`/v1/saved-jobs/${jobId}`, { method: 'DELETE' });
  },

  getSavedJobs: () =>
    apiRequest('/v1/saved-jobs'),

  getSavedJobsCount: () =>
    apiRequest('/v1/saved-jobs/count'),

  checkSavedJob: (jobId) =>
    apiRequest(`/v1/saved-jobs/check/${jobId}`),

  // Employer Job Management
  createJob: (jobData) =>
    apiRequest('/v1/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    }),

  getMyJobs: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/v1/jobs/my${queryString ? `?${queryString}` : ''}`);
  },

  updateJob: (jobId, jobData) =>
    apiRequest(`/v1/jobs/${jobId}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    }),

  deleteJob: (jobId) =>
    apiRequest(`/v1/jobs/${jobId}`, { method: 'DELETE' }),

  changeJobStatus: (jobId, status) =>
    apiRequest(`/v1/jobs/${jobId}/status?status=${status}`, { method: 'PATCH' }),

  // Applications
  applyJob: (applicationData) =>
    apiRequest('/v1/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    }),

  // Thêm function quickApply
  quickApply: (jobId) =>
    apiRequest('/v1/applications/quick-apply', {
      method: 'POST',
      body: JSON.stringify({ jobId }),
    }),

  checkApplied: (jobId) =>
    apiRequest(`/v1/applications/check/${jobId}`),

  getMyApplications: () =>
    apiRequest('/v1/applications/my'),

  withdrawApplication: (applicationId) =>
    apiRequest(`/v1/applications/${applicationId}/withdraw`, { method: 'POST' }),

  getJobApplications: (jobId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/v1/applications/job/${jobId}${queryString ? '?' + queryString : ''}`);
  },

  updateApplicationStatus: (applicationId, status) =>
    apiRequest(`/v1/applications/${applicationId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};

// ==================== COMPANIES API ====================

export const companiesAPI = {
  getCompanies: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/v1/companies${queryString ? `?${queryString}` : ''}`);
  },

  getCompanyById: (id) =>
    apiRequest(`/v1/companies/${id}`),

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

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/v1/users/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    return handleResponse(response);
  },

  changePassword: (passwordData) =>
    apiRequest('/v1/users/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    }),
};

// ==================== AI API ====================

export const aiAPI = {
  // Chat
  sendMessage: (message, context) =>
    apiRequest('/v1/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    }),

  sendMessageGuest: (message) =>
    apiRequest('/v1/ai/chat/guest', {
      method: 'POST',
      body: JSON.stringify({ message }),
      headers: {}, // No auth required
    }),

  // Resume Analysis
  analyzeResume: (resumeData) =>
    apiRequest('/v1/resume/analyze', {
      method: 'POST',
      body: JSON.stringify(resumeData),
    }),

  matchResumeToJob: (data) =>
    apiRequest('/v1/resume/match', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getResumeTips: () =>
    apiRequest('/v1/resume/tips'),

  analyzeResumeGuest: (resumeData) =>
    apiRequest('/v1/resume/analyze/guest', {
      method: 'POST',
      body: JSON.stringify(resumeData),
      headers: {}, // No auth required
    }),

  // Interview Preparation
  generateInterviewQuestions: (data) =>
    apiRequest('/v1/interview/questions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  evaluateAnswer: (data) =>
    apiRequest('/v1/interview/evaluate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getInterviewTips: (type = 'TECHNICAL') =>
    apiRequest(`/v1/interview/tips?type=${type}`),

  getTipCategories: () =>
    apiRequest('/v1/interview/tips/categories'),

  generateInterviewQuestionsGuest: (data) =>
    apiRequest('/v1/interview/questions/guest', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {}, // No auth required
    }),
};

// ==================== DEFAULT EXPORT ====================

export default {
  auth: authAPI,
  jobs: jobsAPI,
  companies: companiesAPI,
  categories: categoriesAPI,
  skills: skillsAPI,
  user: userAPI,
  ai: aiAPI,
};
