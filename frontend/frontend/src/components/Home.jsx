import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { testService } from '../services/api';

const Home = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [backendStatus, setBackendStatus] = useState(null);
  const [testingBackend, setTestingBackend] = useState(false);

  const testBackendConnection = async () => {
    try {
      setTestingBackend(true);
      const response = await testService.ping();
      setBackendStatus({
        success: true,
        message: 'Conexión exitosa con el backend',
        data: response
      });
    } catch (error) {
      setBackendStatus({
        success: false,
        message: 'Error conectando con el backend',
        error: error.message
      });
    } finally {
      setTestingBackend(false);
    }
  };

  useEffect(() => {
    testBackendConnection();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🔐 Aplicación de Autenticación
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Sistema de autenticación con Google OAuth, JWT y MongoDB
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Auth Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {loading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              ) : isAuthenticated ? (
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              ) : (
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Estado de Autenticación</h3>
              <p className="text-sm text-gray-500">
                {loading ? 'Verificando...' : isAuthenticated ? 'Autenticado' : 'No autenticado'}
              </p>
            </div>
          </div>
          {isAuthenticated && user && (
            <div className="mt-4 text-sm text-gray-600">
              <p><strong>Usuario:</strong> {user.name || user.email}</p>
            </div>
          )}
        </div>

        {/* Backend Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {testingBackend ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              ) : backendStatus?.success ? (
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              ) : backendStatus ? (
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              ) : (
                <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Conexión Backend</h3>
              <p className="text-sm text-gray-500">
                {testingBackend ? 'Probando...' : backendStatus?.success ? 'Conectado' : backendStatus ? 'Error' : 'Pendiente'}
              </p>
            </div>
          </div>
          {backendStatus && (
            <div className="mt-4">
              <button
                onClick={testBackendConnection}
                disabled={testingBackend}
                className="text-sm text-blue-600 hover:text-blue-800 disabled:text-blue-400"
              >
                {testingBackend ? 'Probando...' : 'Probar Conexión'}
              </button>
            </div>
          )}
        </div>

        {/* MongoDB Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">MongoDB Atlas</h3>
              <p className="text-sm text-gray-500">Base de datos configurada</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Características</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">🔐 Autenticación con Google</h3>
            <p className="text-gray-600">
              Integración completa con Google OAuth 2.0 para autenticación segura.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">🎫 Tokens JWT</h3>
            <p className="text-gray-600">
              Generación y validación de tokens JWT para sesiones seguras.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">🗄️ MongoDB Atlas</h3>
            <p className="text-gray-600">
              Conexión a base de datos MongoDB Atlas para almacenamiento de datos.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">🍪 Cookies Seguras</h3>
            <p className="text-gray-600">
              Manejo de sesiones con cookies HTTP-only para mayor seguridad.
            </p>
          </div>
        </div>
      </div>

      {/* Backend Status Details */}
      {backendStatus && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Estado del Backend</h2>
          <div className={`p-4 rounded-md ${backendStatus.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {backendStatus.success ? (
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${backendStatus.success ? 'text-green-800' : 'text-red-800'}`}>
                  {backendStatus.message}
                </h3>
                {backendStatus.error && (
                  <div className="mt-2 text-sm text-red-700">
                    <p><strong>Error:</strong> {backendStatus.error}</p>
                  </div>
                )}
                {backendStatus.data && (
                  <div className="mt-2 text-sm text-green-700">
                    <p><strong>Respuesta:</strong> {JSON.stringify(backendStatus.data)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home; 