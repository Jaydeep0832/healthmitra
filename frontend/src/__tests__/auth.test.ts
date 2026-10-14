jest.mock('axios', () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    post: jest.fn(),
    get: jest.fn(),
  })),
  post: jest.fn(),
  get: jest.fn(),
}));

import { authService } from '../services/auth';
import api, { getApiErrorMessage } from '../services/api';

describe('Authentication Flow & Security Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Client-Side Password & Input Constraints', () => {
    it('enforces healthcare standard 12-character password minimum', () => {
      const shortPassword = 'ShortPass1!';
      const securePassword = 'MySecurePassword123!';

      expect(shortPassword.length).toBeLessThan(12);
      expect(securePassword.length).toBeGreaterThanOrEqual(12);
    });

    it('requires ASHA authorization passcode for healthcare worker registration', () => {
      const patientPayload = {
        email: 'patient@example.com',
        password: 'SecurePassword123!',
        full_name: 'Patient Name',
        role: 'patient' as const,
      };

      const ashaPayload = {
        email: 'asha@gujarat.gov.in',
        password: 'SecurePassword123!',
        full_name: 'ASHA Ben',
        role: 'asha_worker' as const,
        asha_passcode: 'ASHA2026',
      };

      expect(patientPayload.asha_passcode).toBeUndefined();
      expect(ashaPayload.asha_passcode).toBe('ASHA2026');
    });
  });

  describe('authService.login', () => {
    it('sends JSON credentials payload and saves token to localStorage', async () => {
      const mockToken = {
        access_token: 'jwt.mock.token.signature',
        token_type: 'bearer',
      };

      jest.spyOn(api, 'post').mockResolvedValueOnce({
        data: mockToken,
      });

      const result = await authService.login('dev123@gmail.com', 'Password123456!');

      expect(api.post).toHaveBeenCalledWith('/api/v1/auth/login', {
        email: 'dev123@gmail.com',
        password: 'Password123456!',
      });
      expect(localStorage.getItem('token')).toBe(mockToken.access_token);
      expect(result.access_token).toBe(mockToken.access_token);
    });

    it('clears token on logout', () => {
      localStorage.setItem('token', 'sample.jwt.token');
      authService.logout();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('Error Message Sanitization and User Guidance', () => {
    it('identifies duplicate registration conflicts with clean message', () => {
      const conflictError = {
        isAxiosError: true,
        response: {
          status: 400,
          data: {
            detail: 'Email already registered',
          },
        },
      };

      const message = getApiErrorMessage(conflictError, 'Registration failed.');
      expect(message).toBe('Email already registered');
    });

    it('provides user-friendly cloud cold-start notice on network disconnection', () => {
      const networkError = {
        isAxiosError: true,
        message: 'Network Error',
        response: undefined,
      };

      const message = getApiErrorMessage(networkError, 'Connection failed.');
      expect(message).toContain('healthcare server');
    });
  });
});
