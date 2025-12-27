import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// User API
export const userAPI = {
  search: (query) => api.get(`/users/search?q=${query}`),
  updateProfile: (formData) => api.put('/users/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  follow: (userId) => api.post(`/users/${userId}/follow`),
  unfollow: (userId) => api.delete(`/users/${userId}/follow`),
};

// Post API
export const postAPI = {
  getFeed: (page = 1) => api.get(`/posts/feed?page=${page}&limit=10`),
  create: (formData) => api.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  like: (postId) => api.post(`/posts/${postId}/like`),
  unlike: (postId) => api.delete(`/posts/${postId}/like`),
  addComment: (postId, text) => api.post(`/posts/${postId}/comments`, { text }),
  delete: (postId) => api.delete(`/posts/${postId}`),
};

// Story API
export const storyAPI = {
  getAll: () => api.get('/stories'),
  create: (formData) => api.post('/stories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  view: (storyId) => api.post(`/stories/${storyId}/view`),
  getViews: (storyId) => api.get(`/stories/${storyId}/views`),
};

// Messages API
export const messageAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (userId) => api.get(`/messages/${userId}`),
  sendMessage: (userId, text) => api.post(`/messages/${userId}`, { text }),
};

// Notifications API
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (notificationId) => api.post(`/notifications/${notificationId}/read`),
};

// Share API
export const shareAPI = {
  sharePost: (postId, userIds) => api.post(`/posts/${postId}/share`, { userIds }),
};

export default api;