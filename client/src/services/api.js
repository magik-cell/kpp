import axios from 'axios';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      (error) => Promise.reject(error)
    );
  }

  async login(credentials) {
    const response = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async register(userData) {
    const response = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async getVehicles(params) {
    const response = await this.api.get('/vehicles', { params });
    return {
      data: response.data.vehicles,
      pagination: response.data.pagination
    };
  }

  async checkVehicle(licensePlate) {
    const response = await this.api.get(`/vehicles/check/${encodeURIComponent(licensePlate)}`);
    return response.data;
  }

  async createVehicle(vehicleData) {
    const response = await this.api.post('/vehicles', vehicleData);
    return response.data.vehicle;
  }

  async updateVehicle(id, vehicleData) {
    const response = await this.api.put(`/vehicles/${id}`, vehicleData);
    return response.data.vehicle;
  }

  async deleteVehicle(id) {
    await this.api.delete(`/vehicles/${id}`);
  }

  async toggleEntry(licensePlate) {
    const response = await this.api.post(`/entries/toggle/${encodeURIComponent(licensePlate)}`);
    return response.data;
  }

  async getEntryHistory(licensePlate, params) {
    try {
      const url = `/entries/history/${encodeURIComponent(licensePlate)}`;
      const response = await this.api.get(url, { params });
      return {
        data: response.data || [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: response.data ? response.data.length : 0,
          hasNext: false,
          hasPrev: false
        }
      };
    } catch (error) {
      console.error('Error fetching entry history:', error);
      throw error;
    }
  }

  async getEntries(params) {
    const response = await this.api.get('/entries', { params });
    return {
      data: response.data.entries,
      pagination: response.data.pagination
    };
  }

  async getCurrentVehiclesOnSite() {
    const response = await this.api.get('/entries/stats/current');
    return {
      count: response.data.count,
      vehicles: response.data.vehicles
    };
  }

  async getUsers(params) {
    const response = await this.api.get('/users', { params });
    return {
      data: response.data.users,
      pagination: response.data.pagination
    };
  }

  async createUser(userData) {
    const response = await this.api.post('/users', userData);
    return response.data;
  }

  async updateUser(userId, userData) {
    const response = await this.api.put(`/users/${userId}`, userData);
    return response.data;
  }

  async deleteUser(userId) {
    const response = await this.api.delete(`/users/${userId}`);
    return response.data;
  }

  async healthCheck() {
    const response = await this.api.get('/health');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
