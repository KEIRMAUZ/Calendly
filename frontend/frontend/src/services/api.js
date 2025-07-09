import axios from 'axios';

// Configuración base de axios
const api = axios.create({
  baseURL: '/api', // Usa el proxy configurado en vite
  withCredentials: true, // Importante para las cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  // Iniciar autenticación con Google
  loginWithGoogle: () => {
    window.location.href = '/api/auth/google';
  },

  // Verificar estado de autenticación
  checkAuthStatus: async () => {
    try {
      const response = await api.get('/auth/status');
      return response.data;
    } catch (error) {
      console.error('Error checking auth status:', error);
      return { authenticated: false };
    }
  },

  // Obtener perfil del usuario
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Error getting profile:', error);
      throw error;
    }
  },

  // Verificar token
  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify');
      return response.data;
    } catch (error) {
      console.error('Error verifying token:', error);
      throw error;
    }
  },

  // Cerrar sesión
  logout: async () => {
    try {
      await api.post('/auth/logout');
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  },
};

// Servicios de prueba de conexión
export const testService = {
  // Probar conexión al backend
  ping: async () => {
    try {
      const response = await api.get('/');
      return response.data;
    } catch (error) {
      console.error('Error pinging backend:', error);
      throw error;
    }
  },
};

export default api; 