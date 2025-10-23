// Типи для користувачів
export interface User {
  id: string;
  username: string;
  role: 'kpp_officer' | 'unit_officer' | 'admin';
  fullName: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

// Типи для автомобілів
export interface Vehicle {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  owner: string;
  accessType: 'temporary_24h' | 'temporary_custom' | 'permanent';
  validUntil?: string;
  isActive: boolean;
  createdBy: {
    username: string;
    fullName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface VehicleCreateRequest {
  licensePlate: string;
  brand: string;
  model: string;
  owner: string;
  accessType: 'temporary_24h' | 'temporary_custom' | 'permanent';
  validUntil?: string;
}

export interface VehicleCheckResponse {
  vehicle: Vehicle;
  allowed: boolean;
  message: string;
  lastEntry?: EntryRecord;
}

// Типи для записів проїздів
export interface EntryRecord {
  id: string;
  vehicle: string;
  licensePlate: string;
  entryTime?: string;
  exitTime?: string;
  status: 'entered' | 'exited';
  processedBy: {
    username: string;
    fullName: string;
  };
  createdAt: string;
}

export interface EntryToggleResponse {
  message: string;
  action: 'entry' | 'exit';
  entry: EntryRecord;
  vehicle: {
    licensePlate: string;
    brand: string;
    model: string;
    owner: string;
  };
  duration?: {
    entryTime: string;
    exitTime: string;
    totalMinutes: number;
  };
}

// Типи для пагінації
export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// Типи для API відповідей
export interface ApiResponse<T = any> {
  message?: string;
  error?: string;
  data?: T;
}

export interface ApiError {
  error: string;
  details?: string[];
}

// Типи для компонентів
export interface SearchFilters {
  search?: string;
  status?: 'all' | 'entered' | 'exited';
  dateFrom?: string;
  dateTo?: string;
  licensePlate?: string;
}

// Типи для управління користувачами
export interface UserCreateRequest {
  username: string;
  password: string;
  fullName: string;
  role: 'kpp_officer' | 'unit_officer' | 'admin';
}

export interface UserUpdateRequest {
  username?: string;
  password?: string;
  fullName?: string;
  role?: 'kpp_officer' | 'unit_officer' | 'admin';
}

export interface UsersResponse {
  users: User[];
  pagination: Pagination;
}