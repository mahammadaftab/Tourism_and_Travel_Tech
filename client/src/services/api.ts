import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://tourism-and-travel-tech.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: {
    name?: string;
    lastName?: string;
    age?: number;
    gender?: string;
    phoneNumber?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
    };
    profileImage?: string;
  }) => api.put('/auth/profile', data),
};

// Itinerary API
export const itineraryAPI = {
  generate: (data: {
    destination: string;
    interests: string[];
    budget: string;
    duration: number;
    startDate: string;
    lat: number;
    lng: number;
  }) => api.post('/itineraries/generate', data),
  getAll: () => api.get('/itineraries'),
  getById: (id: string) => api.get(`/itineraries/${id}`),
  delete: (id: string) => api.delete(`/itineraries/${id}`),
};

// Data API
export const dataAPI = {
  getWeather: (lat: number, lng: number) =>
    api.get(`/data/weather/${lat}/${lng}`),
  searchPlaces: (query: string) =>
    api.get(`/data/places/search?q=${encodeURIComponent(query)}`),
  getNearbyAttractions: (lat: number, lng: number, radius?: number) =>
    api.get(`/data/places/nearby?lat=${lat}&lng=${lng}&radius=${radius || 5000}`),
  getEvents: (lat: number, lng: number, destination?: string, interests?: string[]) => {
    let url = `/data/events/${lat}/${lng}`;
    const params: string[] = [];
    if (destination) params.push(`destination=${encodeURIComponent(destination)}`);
    if (interests && interests.length > 0) params.push(`interests=${encodeURIComponent(interests.join(','))}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return api.get(url);
  },
};

// Assistant API
export const assistantAPI = {
  chat: (data: { message: string; language: string; context?: any }) =>
    api.post('/assistant/chat', data),
  getSuggestions: (language: string, destination: string) =>
    api.get(`/assistant/suggestions?language=${language}&destination=${encodeURIComponent(destination)}`),
};

// Images API
export const imagesAPI = {
  getDestinationImages: (destination: string, count?: number) =>
    api.get(`/images/destination/${encodeURIComponent(destination)}?count=${count || 8}`),
  searchImages: (query: string, count?: number) =>
    api.get(`/images/search?query=${encodeURIComponent(query)}&count=${count || 8}`),
};

// Notifications API
export const notificationsAPI = {
  getPreferences: () => api.get('/notifications/preferences'),
  updatePreferences: (data: {
    enabled: boolean;
    reminders: { dayBefore: boolean; morningOf: boolean; hourBefore: boolean };
    notificationMethods: { sms: boolean; email: boolean };
  }) => api.put('/notifications/preferences', data),
  getHistory: (limit?: number) => api.get(`/notifications/history?limit=${limit || 50}`),
  testNotification: () => api.post('/notifications/test'),
};

// Profile API
export const profileAPI = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('profileImage', file);
    
    return axios.post(`${API_URL}/profile/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
  },
  
  removeImage: () => {
    return api.delete('/profile/remove-image');
  },
  
  getProfile: () => {
    return api.get('/profile/me');
  }
};

// Employee API
export const employeeAPI = {
  getAll: () => api.get('/employees'),
  getById: (id: string) => api.get(`/employees/${id}`),
  getByDepartment: (department: string) => api.get(`/employees/department/${department}`),
  search: (query: string) => api.get(`/employees/search?query=${encodeURIComponent(query)}`),
  getStats: () => api.get('/employees/stats/overview'),
  initiateCall: (employeeId: string) => api.post('/employees/call', { employeeId }),
};

// Admin API
export const adminAPI = {
  // Employee management
  getAllEmployees: () => api.get('/admin/employees'),
  getEmployeeById: (id: string) => api.get(`/admin/employees/${id}`),
  createEmployee: (data: any) => api.post('/admin/employees', data),
  updateEmployee: (id: string, data: any) => api.put(`/admin/employees/${id}`, data),
  deleteEmployee: (id: string) => api.delete(`/admin/employees/${id}`),
  toggleEmployeeActive: (id: string) => api.patch(`/admin/employees/${id}/toggle-active`),
  
  // Bulk operations
  bulkUpdateStatus: (employeeIds: string[], status: string) => 
    api.patch('/admin/employees/bulk-status', { employeeIds, status }),
  
  // Statistics
  getStats: () => api.get('/admin/stats'),
};

// Hotel API
export const hotelAPI = {
  search: (params: {
    destination?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    lat?: number;
    lng?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params.destination) queryParams.append('destination', params.destination);
    if (params.checkIn) queryParams.append('checkIn', params.checkIn);
    if (params.checkOut) queryParams.append('checkOut', params.checkOut);
    if (params.guests) queryParams.append('guests', params.guests.toString());
    if (params.lat) queryParams.append('lat', params.lat.toString());
    if (params.lng) queryParams.append('lng', params.lng.toString());
    
    return api.get(`/hotels?${queryParams.toString()}`);
  },
  
  getDetails: (id: string) => api.get(`/hotels/${id}`),
  
  book: (data: {
    hotelId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    rooms: number;
  }) => api.post('/hotels/book', data),
  
  getBookings: () => api.get('/hotels/bookings'),
};

export default api;
