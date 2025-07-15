import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import CreateEventForm from './CreateEventForm';

const CalendlyManager = () => {
  const { user, isAuthenticated } = useAuth();
  const [webhookSubscriptions, setWebhookSubscriptions] = useState([]);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState('');

  // Estados para formularios
  const [webhookForm, setWebhookForm] = useState({
    url: 'http://localhost:3000/calendly/webhook',
    events: ['invitee.created', 'invitee.canceled'],
    organization: '',
    scope: 'organization'
  });

  // Estado para formulario de creación de eventos
  const [eventForm, setEventForm] = useState({
    eventType: 'Reunión de Consulta', // Valor por defecto
    inviteeName: '',
    inviteeEmail: '',
    startTime: '',
    endTime: '',
    status: 'active' // Siempre activo
  });

  // Estado para controlar redirección automática
  const [autoRedirect, setAutoRedirect] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
      loadEvents();
      loadAccessToken(); // Cargar token automáticamente
    }
  }, [isAuthenticated]);

  // Cargar email del usuario automáticamente
  useEffect(() => {
    if (user && user.email) {
      setEventForm(prev => ({
        ...prev,
        inviteeEmail: user.email
      }));
    }
  }, [user]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/calendly/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Error cargando estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/calendly/events');
      const data = await response.json();
      
      if (data.success) {
        setEvents(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Error cargando eventos');
    } finally {
      setLoading(false);
    }
  };

  const loadWebhookSubscriptions = async () => {
    try {
      if (!accessToken) {
        setError('Access token requerido');
        return;
      }

      setLoading(true);
      const response = await fetch(`/api/calendly/webhook-subscriptions?token=${accessToken}`);
      const data = await response.json();
      
      if (data.success) {
        setWebhookSubscriptions(data.data.collection || []);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Error cargando webhook subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const createWebhookSubscription = async () => {
    try {
      if (!accessToken) {
        setError('Access token requerido');
        return;
      }

      setLoading(true);
      const response = await fetch(`/api/calendly/webhook-subscriptions?token=${accessToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(webhookForm)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setError(null);
        loadWebhookSubscriptions();
        alert('Webhook subscription creado exitosamente');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Error creando webhook subscription');
    } finally {
      setLoading(false);
    }
  };

  const deleteWebhookSubscription = async (subscriptionUri) => {
    try {
      if (!accessToken) {
        setError('Access token requerido');
        return;
      }

      setLoading(true);
      
      // Extraer UUID del URI si es necesario
      const webhookUuid = subscriptionUri.includes('/webhook_subscriptions/') 
        ? subscriptionUri.split('/webhook_subscriptions/')[1]
        : subscriptionUri;

      const response = await fetch(`/api/calendly/webhook-subscriptions/${webhookUuid}?token=${accessToken}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setError(null);
        loadWebhookSubscriptions();
        alert('Webhook subscription eliminado exitosamente');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Error eliminando webhook subscription');
    } finally {
      setLoading(false);
    }
  };

  const testWebhook = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/calendly/test-webhook');
      const data = await response.json();
      
      if (data.success) {
        alert('Test webhook procesado exitosamente');
        loadEvents(); // Recargar eventos para ver el nuevo evento de prueba
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Error probando webhook');
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async () => {
    try {
      if (!eventForm.inviteeName || !eventForm.inviteeEmail || !eventForm.startTime || !eventForm.endTime) {
        setError('Todos los campos son requeridos');
        return;
      }

      setLoading(true);
      
      // Preparar datos para el endpoint programático
      const programmaticEventData = {
        start_time: eventForm.startTime,
        end_time: eventForm.endTime,
        name: eventForm.inviteeName,
        country: 'MX', // País por defecto
        email: eventForm.inviteeEmail,
        notes: `Evento creado desde el gestor: ${eventForm.eventType}`
      };

      const response = await fetch('/api/calendly/create-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(programmaticEventData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setError(null);
        
        // Limpiar formulario (mantener valores automáticos)
        setEventForm({
          eventType: 'Reunión de Consulta',
          inviteeName: '',
          inviteeEmail: user?.email || '',
          startTime: '',
          endTime: '',
          status: 'active'
        });
        
        loadEvents(); // Recargar eventos
        
        // Manejar redirección automática o con confirmación
        if (data.data && data.data.schedulingLink) {
          if (autoRedirect) {
            // Redirección automática
            window.open(data.data.schedulingLink, '_blank');
            alert('✅ Evento creado exitosamente!\n\nEl link de Calendly se ha abierto en una nueva pestaña.');
          } else {
            // Confirmación manual
            const shouldRedirect = window.confirm(
              '✅ Evento creado exitosamente!\n\n' +
              '¿Deseas abrir el link de agendado en Calendly?\n\n' +
              'Link: ' + data.data.schedulingLink
            );
            
            if (shouldRedirect) {
              window.open(data.data.schedulingLink, '_blank');
            }
          }
        } else {
          alert('✅ Evento creado exitosamente');
        }
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Error creando evento');
    } finally {
      setLoading(false);
    }
  };

  const loadAccessToken = async () => {
    try {
      const response = await fetch('/api/calendly/access-token');
      const data = await response.json();
      
      if (data.success && data.data.accessToken) {
        setAccessToken(data.data.accessToken);
        console.log('✅ Access token cargado automáticamente desde el backend');
      } else {
        console.log('ℹ️ No se pudo cargar el access token automáticamente:', data.error);
      }
    } catch (err) {
      console.log('ℹ️ Error cargando access token automáticamente:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                No autenticado
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Debes iniciar sesión para gestionar Calendly.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          📅 Gestor de Calendly
        </h1>
        <p className="text-gray-600">
          Gestiona webhooks y eventos de Calendly en tiempo real
        </p>
      </div>

      {/* Access Token Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">🔑 Access Token</h2>
        <div className="mb-4">
          {accessToken ? (
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600 font-medium">Token cargado automáticamente</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-yellow-600">Token no disponible - ingresa manualmente</span>
            </div>
          )}
        </div>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Calendly access token (se carga automáticamente si está configurado)"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={loadAccessToken}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
          >
            Recargar Token
          </button>
          <button
            onClick={loadWebhookSubscriptions}
            disabled={!accessToken || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            Cargar Webhooks
          </button>
        </div>
        {accessToken && (
          <div className="mt-2 text-xs text-gray-500">
            Token configurado - puedes gestionar webhooks y eventos de Calendly
          </div>
        )}
      </div>

      {/* Stats Section */}
      {stats && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Estadísticas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalEvents}</div>
              <div className="text-sm text-gray-600">Total Eventos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.activeEvents}</div>
              <div className="text-sm text-gray-600">Eventos Activos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.canceledEvents}</div>
              <div className="text-sm text-gray-600">Eventos Cancelados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.webhookProcessed}</div>
              <div className="text-sm text-gray-600">Webhooks Procesados</div>
            </div>
          </div>
        </div>
      )}

      {/* Programmatic Event Creation Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">🎯 Crear Evento Programático</h2>
        </div>
        <CreateEventForm />
      </div>

      {/* Webhook Subscriptions Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">🔗 Webhook Subscriptions</h2>
        
        {/* Create Webhook Form */}
        <div className="mb-6 p-4 border border-gray-200 rounded-md">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Crear Nuevo Webhook</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
              <input
                type="text"
                value={webhookForm.url}
                onChange={(e) => setWebhookForm({...webhookForm, url: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scope</label>
              <select
                value={webhookForm.scope}
                onChange={(e) => setWebhookForm({...webhookForm, scope: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="organization">Organization</option>
                <option value="user">User</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization URI</label>
              <input
                type="text"
                value={webhookForm.organization}
                onChange={(e) => setWebhookForm({...webhookForm, organization: e.target.value})}
                placeholder="https://api.calendly.com/organizations/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Events</label>
              <div className="space-y-2">
                {['invitee.created', 'invitee.canceled', 'routing_form_submission.created'].map(event => (
                  <label key={event} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={webhookForm.events.includes(event)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setWebhookForm({...webhookForm, events: [...webhookForm.events, event]});
                        } else {
                          setWebhookForm({...webhookForm, events: webhookForm.events.filter(e => e !== event)});
                        }
                      }}
                      className="mr-2"
                    />
                    {event}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={createWebhookSubscription}
            disabled={loading || !accessToken}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
          >
            Crear Webhook Subscription
          </button>
        </div>

        {/* Webhook Subscriptions List */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Webhooks Existentes</h3>
          {webhookSubscriptions.length === 0 ? (
            <p className="text-gray-500">No hay webhook subscriptions configurados</p>
          ) : (
            <div className="space-y-4">
              {webhookSubscriptions.map((subscription, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{subscription.url}</p>
                      <p className="text-sm text-gray-600">Events: {subscription.events.join(', ')}</p>
                      <p className="text-sm text-gray-600">Scope: {subscription.scope}</p>
                    </div>
                    <button
                      onClick={() => deleteWebhookSubscription(subscription.uri)}
                      disabled={loading}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:bg-gray-400"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Events Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">📅 Eventos</h2>
          <div className="space-x-2">
            <button
              onClick={loadEvents}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              Recargar
            </button>
            <button
              onClick={testWebhook}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              Probar Webhook
            </button>
          </div>
        </div>

        {/* Create Event Form */}
        <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-4">➕ Crear Nuevo Evento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Invitado</label>
              <input
                type="text"
                value={eventForm.inviteeName}
                onChange={(e) => setEventForm({...eventForm, inviteeName: e.target.value})}
                placeholder="Nombre completo"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email del Invitado</label>
              <div className="flex items-center space-x-2">
                <input
                  type="email"
                  value={eventForm.inviteeEmail}
                  onChange={(e) => setEventForm({...eventForm, inviteeEmail: e.target.value})}
                  placeholder="email@ejemplo.com"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {user && user.email && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600">Auto</span>
                  </div>
                )}
              </div>
              {user && user.email && (
                <p className="text-xs text-gray-500 mt-1">
                  Email cargado automáticamente desde tu cuenta de Google
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y Hora de Inicio</label>
              <input
                type="datetime-local"
                value={eventForm.startTime}
                onChange={(e) => setEventForm({...eventForm, startTime: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y Hora de Fin</label>
              <input
                type="datetime-local"
                value={eventForm.endTime}
                onChange={(e) => setEventForm({...eventForm, endTime: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* Información automática */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-blue-800">Configuración Automática</span>
            </div>
            <div className="text-xs text-blue-700 space-y-1">
              <p>• Tipo de evento: <span className="font-medium">Reunión de Consulta</span></p>
              <p>• Estado: <span className="font-medium">Activo</span></p>
              {user && user.email && (
                <p>• Email: <span className="font-medium">{user.email}</span></p>
              )}
            </div>
          </div>
          
          {/* Opción de redirección automática */}
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="autoRedirect"
                checked={autoRedirect}
                onChange={(e) => setAutoRedirect(e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="autoRedirect" className="text-sm font-medium text-green-800">
                🔗 Abrir link de Calendly automáticamente
              </label>
            </div>
            <p className="text-xs text-green-700 mt-1 ml-7">
              Cuando esté activado, el link de agendado se abrirá automáticamente en una nueva pestaña
            </p>
          </div>
          
          <button
            onClick={createEvent}
            disabled={loading}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400"
          >
            {loading ? 'Creando...' : 'Crear Evento'}
          </button>
        </div>
        
        {events.length === 0 ? (
          <p className="text-gray-500">No hay eventos registrados</p>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event._id} className="border border-gray-200 rounded-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{event.eventType}</h3>
                    <p className="text-sm text-gray-600">{event.inviteeEmail}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(event.startTime).toLocaleString()} - {new Date(event.endTime).toLocaleString()}
                    </p>
                    <span className={`inline-block px-2 py-1 text-xs rounded ${
                      event.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                  <div className="text-right">
                    {event.webhookProcessed && (
                      <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        Webhook
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

export default CalendlyManager; 