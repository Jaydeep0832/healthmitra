import { api } from './api';
import { UserCreate, UserResponse, Token } from '../types/models';

export const authService = {
  async register(data: UserCreate): Promise<UserResponse> {
    const response = await api.post<UserResponse>('/api/v1/auth/register', data);
    return response.data;
  },

  async login(email: string, password: string): Promise<Token> {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post<Token>('/api/v1/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },

  async getMe(): Promise<UserResponse> {
    const response = await api.get<UserResponse>('/api/v1/auth/me');
    return response.data;
  },
  
  logout() {
    localStorage.removeItem('token');
  }
};
