import { apiRequest } from "./queryClient";
import { User, ApiResponse, LoginResponse } from "@/types/api";
import { config } from "./config";

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || `${config.apiUrl}/api`;
  }

  async get<T>(endpoint: string): Promise<T> {
    const headers: Record<string, string> = {};

    // Add Authorization header if we have a token
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`${response.status}: ${error}`);
    }

    return response.json();
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>('POST', endpoint, data);
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>('PATCH', endpoint, data);
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>('DELETE', endpoint);
  }

  private async request<T>(method: string, endpoint: string, data?: unknown): Promise<T> {
    const response = await apiRequest(method, `${this.baseUrl}${endpoint}`, data);
    return response.json();
  }
}

export const apiClient = new ApiClient();

// Venue API methods
export const venueApi = {
  search: (filters: Record<string, any>) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value.toString());
      }
    });
    return apiClient.get(`/venues/search?${params}`);
  },

  getById: (id: string) => apiClient.get(`/venues/${id}`),

  create: (venueData: any) => apiClient.post('/venues', venueData),

  update: (id: string, venueData: any) => apiClient.patch(`/venues/${id}`, venueData),

  checkAvailability: (id: string, start: string, durationMinutes: number) => {
    const params = new URLSearchParams({ start, durationMinutes: durationMinutes.toString() });
    return apiClient.get(`/venues/${id}/availability?${params}`);
  },

  getHostVenues: () => apiClient.get('/host/venues'),

  // Image Management
  addImage: (id: string, imageURL: string) =>
    apiClient.post(`/venues/${id}/images`, { imageURL }),

  updateImage: (venueId: string, imageId: string, imageData: any) =>
    apiClient.patch(`/venues/${venueId}/images/${imageId}`, imageData),

  deleteImage: (venueId: string, imageId: string) =>
    apiClient.delete(`/venues/${venueId}/images/${imageId}`),

  reorderImages: (venueId: string, imageOrders: Array<{ imageId: string; order: number }>) =>
    apiClient.patch(`/venues/${venueId}/images/reorder`, { imageOrders }),

  // Amenities
  addAmenity: (id: string, name: string) =>
    apiClient.post(`/venues/${id}/amenities`, { name }),

  updateAmenity: (venueId: string, amenityId: string, name: string) =>
    apiClient.patch(`/venues/${venueId}/amenities/${amenityId}`, { name }),

  deleteAmenity: (venueId: string, amenityId: string) =>
    apiClient.delete(`/venues/${venueId}/amenities/${amenityId}`),

  // Packages
  addPackage: (id: string, packageData: any) =>
    apiClient.post(`/venues/${id}/packages`, packageData),

  updatePackage: (venueId: string, packageId: string, packageData: any) =>
    apiClient.patch(`/venues/${venueId}/packages/${packageId}`, packageData),

  deletePackage: (venueId: string, packageId: string) =>
    apiClient.delete(`/venues/${venueId}/packages/${packageId}`),

  getPackages: (venueId: string) => apiClient.get(`/venues/${venueId}/packages`),

  // Availability Rules
  getAvailabilityRules: (venueId: string) =>
    apiClient.get(`/host/venues/${venueId}/availability-rules`),

  createAvailabilityRule: (venueId: string, ruleData: any) =>
    apiClient.post(`/host/venues/${venueId}/availability-rules`, ruleData),

  updateAvailabilityRule: (venueId: string, ruleId: string, ruleData: any) =>
    apiClient.patch(`/host/venues/${venueId}/availability-rules/${ruleId}`, ruleData),

  deleteAvailabilityRule: (venueId: string, ruleId: string) =>
    apiClient.delete(`/host/venues/${venueId}/availability-rules/${ruleId}`),

  // Blackouts
  getBlackouts: (venueId: string) =>
    apiClient.get(`/host/venues/${venueId}/blackouts`),

  createBlackout: (venueId: string, blackoutData: any) =>
    apiClient.post(`/host/venues/${venueId}/blackouts`, blackoutData),

  updateBlackout: (venueId: string, blackoutId: string, blackoutData: any) =>
    apiClient.patch(`/host/venues/${venueId}/blackouts/${blackoutId}`, blackoutData),

  deleteBlackout: (venueId: string, blackoutId: string) =>
    apiClient.delete(`/host/venues/${venueId}/blackouts/${blackoutId}`),

  // Time Slots
  createTimeSlot: (venueId: string, date: string, timeSlotData: any) =>
    apiClient.post(`/host/venues/${venueId}/time-slots`, { date, ...timeSlotData }),

  updateTimeSlot: (venueId: string, timeSlotId: string, timeSlotData: any) =>
    apiClient.patch(`/host/venues/${venueId}/time-slots/${timeSlotId}`, timeSlotData),

  deleteTimeSlot: (venueId: string, timeSlotId: string) =>
    apiClient.delete(`/host/venues/${venueId}/time-slots/${timeSlotId}`),
};

// Booking API methods
export const bookingApi = {
  create: (bookingData: any) => apiClient.post('/bookings', bookingData),

  getById: (id: string) => apiClient.get(`/bookings/${id}`),

  getMyBookings: (filters?: any) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.set(key, value.toString());
        }
      });
    }
    const queryString = params.toString();
    return apiClient.get(`/bookings/me${queryString ? `?${queryString}` : ''}`);
  },

  getHostBookings: (filters?: any) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.set(key, value.toString());
        }
      });
    }
    const queryString = params.toString();
    return apiClient.get(`/host/bookings${queryString ? `?${queryString}` : ''}`);
  },

  update: (id: string, updateData: any) => apiClient.patch(`/bookings/${id}`, updateData),

  cancelBooking: (id: string, cancellationData: {
    reason: string;
    customReason?: string;
  }) => apiClient.patch(`/bookings/${id}/cancel`, cancellationData),

  confirmBooking: (id: string) => apiClient.patch(`/bookings/${id}/confirm`),

  rejectBooking: (id: string, reason?: string) =>
    apiClient.patch(`/bookings/${id}/reject`, { reason }),
};

// Admin API methods
export const adminApi = {
  getVenues: (status?: string) => {
    const params = status ? `?status=${status}` : '';
    return apiClient.get(`/admin/venues${params}`);
  },

  approveVenue: (id: string) => apiClient.patch(`/admin/venues/${id}/approve`),

  rejectVenue: (id: string) => apiClient.patch(`/admin/venues/${id}/reject`),

  getStats: () => apiClient.get('/admin/stats'),

  getBookings: () => apiClient.get('/admin/bookings'),

  // User Management
  getUsers: (role?: string, search?: string) => {
    const params = new URLSearchParams();
    if (role && role !== 'all') params.append('role', role);
    if (search) params.append('search', search);
    const queryString = params.toString();
    return apiClient.get(`/admin/users${queryString ? `?${queryString}` : ''}`);
  },

  updateUserRole: (id: string, role: 'guest' | 'host' | 'admin') =>
    apiClient.patch(`/admin/users/${id}/role`, { role }),

  updateUserStatus: (id: string, status: 'active' | 'suspended' | 'banned') =>
    apiClient.patch(`/admin/users/${id}/status`, { status }),

  deleteUser: (id: string) => apiClient.delete(`/admin/users/${id}`),

  // Settings Management
  getSettings: () => apiClient.get('/admin/settings'),

  updateSettings: (settings: any) => apiClient.patch('/admin/settings', settings),

  // Analytics
  getAnalytics: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString();
    return apiClient.get(`/admin/analytics${queryString ? `?${queryString}` : ''}`);
  },
};

// Host API methods
export const hostApi = {
  // Analytics
  getAnalytics: (venueId?: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (venueId) params.append('venueId', venueId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString();
    return apiClient.get(`/host/analytics${queryString ? `?${queryString}` : ''}`);
  },

  getRevenueReport: (filters: any) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value.toString());
      }
    });
    return apiClient.get(`/host/reports/revenue?${params}`);
  },

  getVenuePerformance: (filters: any) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value.toString());
      }
    });
    return apiClient.get(`/host/reports/venues?${params}`);
  },

  exportReport: (config: any) =>
    apiClient.post('/host/reports/export', config),

  // Calendar and Bookings
  getCalendarBookings: (startDate?: string, endDate?: string, venueId?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (venueId) params.append('venueId', venueId);
    const queryString = params.toString();
    return apiClient.get(`/host/bookings/calendar${queryString ? `?${queryString}` : ''}`);
  },

  // Dashboard Stats
  getDashboardStats: () => apiClient.get('/host/dashboard/stats'),
};

// Upload API methods
export const uploadApi = {
  getUploadUrl: (venueId: string) => apiClient.post(`/venues/${venueId}/images/upload`),

  uploadImages: (venueId: string, formData: FormData) =>
    apiClient.post(`/venues/${venueId}/images/batch-upload`, formData),

  getImages: (venueId: string) => apiClient.get(`/venues/${venueId}/images`),

  setMainImage: (venueId: string, imageId: string) =>
    apiClient.patch(`/venues/${venueId}/images/${imageId}/main`),
};

// Authentication API methods
export const authApi = {
  getCurrentUser: () => apiClient.get<ApiResponse<User>>('/auth/user'),

  login: (email: string, password: string) =>
    apiClient.post<ApiResponse<LoginResponse>>('/auth/login', { email, password }),

  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: 'guest' | 'host';
  }) => apiClient.post<ApiResponse<User>>('/auth/register', userData),

  updateProfile: (userData: Partial<{
    firstName: string;
    lastName: string;
    profileImageUrl: string;
  }>) => apiClient.patch<ApiResponse<User>>('/auth/user', userData),

  changePassword: (passwordData: {
    currentPassword: string;
    newPassword: string;
  }) => apiClient.patch<ApiResponse<null>>('/auth/password', passwordData),

  logout: () => apiClient.post('/auth/logout'),

  upgradeToHost: () => apiClient.patch<ApiResponse<User>>('/auth/upgrade-to-host'),
};
