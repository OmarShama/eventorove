import { useState, useEffect } from 'react';
import { User } from '@/types/api';
import { jwtDecode } from 'jwt-decode';
import { authApi } from '@/lib/api';

interface DecodedToken {
  email: string;
  sub: string;
  role: User['role'];
  exp: number;
}

let globalAuthState: {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
} = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

// Force refresh function that can be called after login
export const refreshAuth = () => {
  if (typeof window !== 'undefined') {
    // Trigger a storage event to refresh all auth hooks
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'token',
      newValue: localStorage.getItem('token'),
    }));
  }
};

export function useAuth() {
  const [authState, setAuthState] = useState(globalAuthState);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set client-side flag to prevent hydration mismatches
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || typeof window === 'undefined') return;

    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          const decoded: DecodedToken = jwtDecode(token);

          // Check if token is expired
          if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem('token');
            globalAuthState = {
              user: null,
              isAuthenticated: false,
              isLoading: false,
            };
          } else {
            // Fetch full user data from API
            try {
              const response = await authApi.getCurrentUser();
              if (response.success && response.data) {
                globalAuthState = {
                  user: response.data,
                  isAuthenticated: true,
                  isLoading: false,
                };
              } else {
                // Token exists but API call failed, remove token
                localStorage.removeItem('token');
                globalAuthState = {
                  user: null,
                  isAuthenticated: false,
                  isLoading: false,
                };
              }
            } catch (error) {
              console.error('API call failed, using token data as fallback:', error);
              // API call failed, but token exists - use token data as fallback
              const userData: User = {
                id: decoded.sub,
                email: decoded.email,
                role: decoded.role,
                firstName: '',
                lastName: '',
                profileImageUrl: '',
                emailVerifiedAt: '',
                createdAt: '',
                updatedAt: '',
              };
              globalAuthState = {
                user: userData,
                isAuthenticated: true,
                isLoading: false,
              };
            }
          }
        } catch (error) {
          console.error('Invalid token:', error);
          localStorage.removeItem('token');
          globalAuthState = {
            user: null,
            isAuthenticated: false,
            isLoading: false,
          };
        }
      } else {
        globalAuthState = {
          user: null,
          isAuthenticated: false,
          isLoading: false,
        };
      }

      setAuthState({ ...globalAuthState });
    };

    checkAuth();

    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isClient]);

  // Return loading state during SSR or before client hydration
  if (!isClient) {
    return {
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      isGuest: true,
    };
  }

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: null,
    isGuest: !authState.isAuthenticated,
  };
}
