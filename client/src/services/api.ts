import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  LoginRequest, 
  LoginResponse, 
  Vehicle, 
  VehicleCreateRequest, 
  VehicleCheckResponse,
  EntryRecord,
  EntryToggleResponse,
  PaginatedResponse,
  SearchFilters
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor для додавання токену
    this.api.interceptors.request.use(
      (config: any) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor для обробки помилок
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: { response: { status: number; }; }) => {
        if (error.response?.status === 401) {
          // Видаляємо токен та перенаправляємо на логін
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Методи аутентифікації
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  }

  async register(userData: any): Promise<any> {
    const response = await this.api.post('/auth/register', userData);
    return response.data;
  }

  // Методи для роботи з автомобілями
  async getVehicles(params?: SearchFilters & { page?: number; limit?: number }): Promise<PaginatedResponse<Vehicle>> {
    const response = await this.api.get('/vehicles', { params });
    return {
      data: response.data.vehicles,
      pagination: response.data.pagination
    };
  }

  async checkVehicle(licensePlate: string): Promise<VehicleCheckResponse> {
    const response = await this.api.get<VehicleCheckResponse>(`/vehicles/check/${encodeURIComponent(licensePlate)}`);
    return response.data;
  }

  async createVehicle(vehicleData: VehicleCreateRequest): Promise<Vehicle> {
    const response = await this.api.post<{ vehicle: Vehicle }>('/vehicles', vehicleData);
    return response.data.vehicle;
  }

  async updateVehicle(id: string, vehicleData: Partial<VehicleCreateRequest>): Promise<Vehicle> {
    const response = await this.api.put<{ vehicle: Vehicle }>(`/vehicles/${id}`, vehicleData);
    return response.data.vehicle;
  }

  async deleteVehicle(id: string): Promise<void> {
    await this.api.delete(`/vehicles/${id}`);
  }

  // Методи для роботи з записами проїздів
  async toggleEntry(licensePlate: string): Promise<EntryToggleResponse> {
    const response = await this.api.post<EntryToggleResponse>(`/entries/toggle/${encodeURIComponent(licensePlate)}`);
    return response.data;
  }

  async getEntryHistory(licensePlate: string, params?: { page?: number; limit?: number }): Promise<PaginatedResponse<EntryRecord>> {
    const response = await this.api.get(`/entries/history/${encodeURIComponent(licensePlate)}`, { params });
    return {
      data: response.data.entries,
      pagination: response.data.pagination
    };
  }

  async getEntries(params?: SearchFilters & { page?: number; limit?: number }): Promise<PaginatedResponse<EntryRecord>> {
    const response = await this.api.get('/entries', { params });
    return {
      data: response.data.entries,
      pagination: response.data.pagination
    };
  }

  async getCurrentVehiclesOnSite(): Promise<{ count: number; vehicles: any[] }> {
    const response = await this.api.get('/entries/stats/current');
    return {
      count: response.data.count,
      vehicles: response.data.vehicles
    };
  }

  // Перевірка здоров'я сервера
  async healthCheck(): Promise<any> {
    const response = await this.api.get('/health');
    return response.data;
  }
}

// Створюємо єдиний екземпляр сервісу
export const apiService = new ApiService();
export default apiService;