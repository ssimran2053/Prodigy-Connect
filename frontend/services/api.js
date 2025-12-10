// API Service for Prodigy Connect
// Handles all HTTP requests to the backend

const API_URL = (import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:5001/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to create headers
const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Helper function to handle responses
const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    // If unauthorized, clear token and redirect to login
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    throw new Error(data.message || 'An error occurred');
  }

  return data;
};

// ==================== AUTH API ====================

export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(userData),
    });
    const data = await handleResponse(response);
    
    // Store token and user data
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  },

  // Login user
  login: async (credentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(credentials),
    });
    const data = await handleResponse(response);
    
    // Store token and user data
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  },

  // Get current user
  getMe: async () => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Update user details
  updateDetails: async (userData) => {
    const response = await fetch(`${API_URL}/auth/updatedetails`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    const data = await handleResponse(response);
    
    // Update stored user data
    if (data.data) {
      localStorage.setItem('user', JSON.stringify(data.data));
    }
    
    return data;
  },

  // Update password
  updatePassword: async (passwords) => {
    const response = await fetch(`${API_URL}/auth/updatepassword`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(passwords),
    });
    return handleResponse(response);
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  },

  // Search for users
  searchUsers: async (query) => {
    const response = await fetch(`${API_URL}/auth/search?q=${encodeURIComponent(query)}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

// ==================== SERVICES API ====================

export const servicesAPI = {
  // Get all services with filters
  getServices: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_URL}/services?${queryParams}`, {
      headers: getHeaders(false),
    });
    return handleResponse(response);
  },

  // Get single service
  getService: async (id) => {
    const response = await fetch(`${API_URL}/services/${id}`, {
      headers: getHeaders(false),
    });
    return handleResponse(response);
  },

  // Create new service
  createService: async (serviceData) => {
    const response = await fetch(`${API_URL}/services`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(serviceData),
    });
    return handleResponse(response);
  },

  // Update service
  updateService: async (id, serviceData) => {
    const response = await fetch(`${API_URL}/services/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(serviceData),
    });
    return handleResponse(response);
  },

  // Delete service
  deleteService: async (id) => {
    const response = await fetch(`${API_URL}/services/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Get provider's services
  getProviderServices: async (providerId) => {
    const response = await fetch(`${API_URL}/services/provider/${providerId}`, {
      headers: getHeaders(false),
    });
    return handleResponse(response);
  },
};

// ==================== BOOKINGS API ====================

export const bookingsAPI = {
  // Get all bookings for current user
  getBookings: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_URL}/bookings?${queryParams}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Get single booking
  getBooking: async (id) => {
    const response = await fetch(`${API_URL}/bookings/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Create new booking
  createBooking: async (bookingData) => {
    const response = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(bookingData),
    });
    return handleResponse(response);
  },

  // Update booking
  updateBooking: async (id, bookingData) => {
    const response = await fetch(`${API_URL}/bookings/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(bookingData),
    });
    return handleResponse(response);
  },

  // Cancel booking
  cancelBooking: async (id, reason) => {
    const response = await fetch(`${API_URL}/bookings/${id}/cancel`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ reason }),
    });
    return handleResponse(response);
  },

  // Confirm booking (provider)
  confirmBooking: async (id) => {
    const response = await fetch(`${API_URL}/bookings/${id}/confirm`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Complete booking (provider)
  completeBooking: async (id) => {
    const response = await fetch(`${API_URL}/bookings/${id}/complete`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

// ==================== REVIEWS API ====================

export const reviewsAPI = {
  // Get service reviews
  getServiceReviews: async (serviceId) => {
    const response = await fetch(`${API_URL}/reviews/service/${serviceId}`, {
      headers: getHeaders(false),
    });
    return handleResponse(response);
  },

  // Get provider reviews
  getProviderReviews: async (providerId) => {
    const response = await fetch(`${API_URL}/reviews/provider/${providerId}`, {
      headers: getHeaders(false),
    });
    return handleResponse(response);
  },

  // Create review
  createReview: async (reviewData) => {
    const response = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(reviewData),
    });
    return handleResponse(response);
  },

  // Update review
  updateReview: async (id, reviewData) => {
    const response = await fetch(`${API_URL}/reviews/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(reviewData),
    });
    return handleResponse(response);
  },

  // Delete review
  deleteReview: async (id) => {
    const response = await fetch(`${API_URL}/reviews/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Add provider response
  addResponse: async (id, response) => {
    const res = await fetch(`${API_URL}/reviews/${id}/response`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ response }),
    });
    return handleResponse(res);
  },
};

// ==================== MESSAGES API ====================

export const messagesAPI = {
  // Get conversations
  getConversations: async () => {
    const response = await fetch(`${API_URL}/messages/conversations`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Get messages in conversation
  getMessages: async (conversationId, page = 1) => {
    const response = await fetch(`${API_URL}/messages/${conversationId}?page=${page}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Send message
  sendMessage: async (messageData) => {
    const response = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(messageData),
    });
    return handleResponse(response);
  },

  // Mark as read
  markAsRead: async (messageId) => {
    const response = await fetch(`${API_URL}/messages/${messageId}/read`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Delete message
  deleteMessage: async (messageId) => {
    const response = await fetch(`${API_URL}/messages/${messageId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

// ==================== ADMIN API ====================

export const adminAPI = {
  // Get all users
  getUsers: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_URL}/admin/users?${queryParams}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Get single user
  getUser: async (userId) => {
    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Update user
  updateUser: async (userId, userData) => {
    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Get platform statistics
  getStats: async () => {
    const response = await fetch(`${API_URL}/admin/stats`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Get recent activity
  getRecentActivity: async () => {
    const response = await fetch(`${API_URL}/admin/activity`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Flag content
  flagContent: async (type, id, reason) => {
    const response = await fetch(`${API_URL}/admin/flag/${type}/${id}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reason }),
    });
    return handleResponse(response);
  },

  // Unflag content
  unflagContent: async (type, id) => {
    const response = await fetch(`${API_URL}/admin/flag/${type}/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

// ==================== HEALTH CHECK ====================

export const healthAPI = {
  // Check API health
  check: async () => {
    const response = await fetch(`${API_URL}/health`, {
      headers: getHeaders(false),
    });
    return handleResponse(response);
  },
};

// ==================== MAPS API ====================

export const mapsAPI = {
  // Geocode address to coordinates
  geocodeAddress: async (address) => {
    const response = await fetch(`${API_URL}/maps/geocode`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ address }),
    });
    return handleResponse(response);
  },

  // Reverse geocode coordinates to address
  reverseGeocode: async (lat, lng) => {
    const response = await fetch(`${API_URL}/maps/reverse-geocode`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ lat, lng }),
    });
    return handleResponse(response);
  },

  // Get nearby services
  getNearbyServices: async (lat, lng, options = {}) => {
    const response = await fetch(`${API_URL}/maps/nearby-services`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ lat, lng, ...options }),
    });
    return handleResponse(response);
  },

  // Calculate distance between points
  calculateDistance: async (origins, destinations, mode = 'driving') => {
    const response = await fetch(`${API_URL}/maps/distance`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ origins, destinations, mode }),
    });
    return handleResponse(response);
  },

  // Get directions
  getDirections: async (origin, destination, options = {}) => {
    const response = await fetch(`${API_URL}/maps/directions`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ origin, destination, ...options }),
    });
    return handleResponse(response);
  },

  // Search places
  searchPlaces: async (query, options = {}) => {
    const response = await fetch(`${API_URL}/maps/search-places`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ query, ...options }),
    });
    return handleResponse(response);
  },

  // Validate address
  validateAddress: async (address) => {
    const response = await fetch(`${API_URL}/maps/validate-address`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ address }),
    });
    return handleResponse(response);
  },

  // Get place details
  getPlaceDetails: async (placeId) => {
    const response = await fetch(`${API_URL}/maps/place-details/${placeId}`, {
      headers: getHeaders(false),
    });
    return handleResponse(response);
  },
};

// Export default API object
export default {
  auth: authAPI,
  services: servicesAPI,
  bookings: bookingsAPI,
  reviews: reviewsAPI,
  messages: messagesAPI,
  admin: adminAPI,
  health: healthAPI,
  maps: mapsAPI,
};