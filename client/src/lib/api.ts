import { apiRequest } from "./queryClient";
import { User, ApiResponse, LoginResponse } from "@/types/api";

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
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

  addImage: (id: string, imageURL: string) =>
    apiClient.post(`/venues/${id}/images`, { imageURL }),

  addAmenity: (id: string, name: string) =>
    apiClient.post(`/venues/${id}/amenities`, { name }),

  addPackage: (id: string, packageData: any) =>
    apiClient.post(`/venues/${id}/packages`, packageData),
};

// Booking API methods
export const bookingApi = {
  create: (bookingData: any) => apiClient.post('/bookings', bookingData),

  getById: (id: string) => apiClient.get(`/bookings/${id}`),

  getMyBookings: () => apiClient.get('/bookings/me'),

  getHostBookings: () => apiClient.get('/host/bookings'),
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
};

// Upload API methods
export const uploadApi = {
  getUploadUrl: (venueId: string) => apiClient.post(`/venues/${venueId}/images/upload`),
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
  }) => apiClient.post<ApiResponse<User>>('/auth/register', userData),

  logout: () => apiClient.post('/auth/logout'),
};
