import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import apiService from '../services/api';

const CreateOneOnOneEventForm = () => {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    inviteeName: '',
    country: '',
    inviteeEmail: '',
    phone: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    if (user && user.email) {
      setFormData(prev => ({
        ...prev,
        inviteeEmail: user.email
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Debes estar autenticado para crear eventos');
      return;
    }
    if (!formData.startTime || !formData.endTime || !formData.inviteeName || !formData.country) {
      setError('Los campos fecha de inicio, fecha de fin, nombre y país son obligatorios');
      return;
    }
    if (new Date(formData.endTime) <= new Date(formData.startTime)) {
      setError('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      const data = await apiService.createOneOnOneEvent(formData);
      if (data.success) {
        setResult(data.data);
        setFormData({
          startTime: '',
          endTime: '',
          inviteeName: '',
          country: '',
          inviteeEmail: user?.email || '',
          phone: '',
          notes: ''
        });
      } else {
        setError(data.error || 'Error creando el evento');
      }
    } catch (err) {
      setError('Error de conexión. Verifica que el servidor esté funcionando.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Vuelo programado (One-on-One)</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-800">
            Debes iniciar sesión con Google para crear eventos one-on-one.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Vuelo programado (One-on-One)</h2>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      {result && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
          <h3 className="text-green-800 font-semibold mb-2">✅ Evento creado exitosamente</h3>
          {result.schedulingLink && (
            <div className="mt-3">
              <p className="text-sm text-green-600 mb-2">Link de agendado:</p>
              <a
                href={result.schedulingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline break-all"
              >
                {result.schedulingLink}
              </a>
            </div>
          )}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha y Hora de Inicio *
            </label>
            <input
              type="datetime-local"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha y Hora de Fin *
            </label>
            <input
              type="datetime-local"
              name="endTime"
              value={formData.endTime}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Invitado *
            </label>
            <input
              type="text"
              name="inviteeName"
              value={formData.inviteeName}
              onChange={handleInputChange}
              required
              placeholder="Juan Pérez"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              País *
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              required
              placeholder="MX"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email del Invitado
            </label>
            <input
              type="email"
              name="inviteeEmail"
              value={formData.inviteeEmail}
              onChange={handleInputChange}
              placeholder="juan@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+52 123 456 7890"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas Adicionales
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows="3"
            placeholder="Información adicional sobre la cita..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando Evento...' : 'Crear Evento One-on-One'}
          </button>
        </div>
      </form>
      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Información del Usuario</h3>
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Email:</span> {user?.email}
        </p>
      </div>
    </div>
  );
};

export default CreateOneOnOneEventForm; 