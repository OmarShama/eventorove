import { useState, useEffect } from 'react';
import { User } from '@/types/api';
import { jwtDecode } from 'jwt-decode';

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

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkAuth = () => {
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
            const userData: User = {
              id: decoded.sub,
              email: decoded.email,
              role: decoded.role,
              firstName: '',
              lastName: '',
              profileImageUrl: '',
              createdAt: '',
              updatedAt: '',
            };
            globalAuthState = {
              user: userData,
              isAuthenticated: true,
              isLoading: false,
            };
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
  }, []);

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: null,
    isGuest: !authState.isAuthenticated,
  };
}
