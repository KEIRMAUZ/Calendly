import { useState, useEffect } from 'react';
import { authService } from '../services/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar estado de autenticación al cargar
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const authStatus = await authService.checkAuthStatus();
      
      if (authStatus.authenticated) {
        setUser(authStatus.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Error checking auth status:', err);
      setError('Error verificando autenticación');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    authService.loginWithGoogle();
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (err) {
      console.error('Error logging out:', err);
      setError('Error al cerrar sesión');
    }
  };

  const refreshAuth = () => {
    checkAuthStatus();
  };

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    refreshAuth,
  };
}; 