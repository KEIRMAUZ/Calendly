# Calendly Webhook Integration

Esta aplicación incluye una integración completa con Calendly que permite recibir datos en tiempo real de eventos programados y cancelados a través de webhooks.

## 🚀 Características

- **Webhook Subscriptions**: Crear y gestionar suscripciones a webhooks de Calendly
- **Eventos en Tiempo Real**: Recibir datos de eventos creados y cancelados
- **Almacenamiento en MongoDB**: Guardar todos los eventos en la base de datos
- **Interfaz Web**: Gestión completa desde el frontend
- **Estadísticas**: Dashboard con métricas de eventos

## 📋 Configuración

### Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```bash
# Calendly OAuth Configuration
CALENDLY_CLIENT_ID=your_calendly_client_id_here
CALENDLY_CLIENT_SECRET=your_calendly_client_secret_here
CALENDLY_REDIRECT_URL=http://localhost:3000/calendly/callback

# Calendly Webhook Configuration
CALENDLY_WEBHOOK_URL=http://localhost:3000/calendly/webhook
CALENDLY_WEBHOOK_SECRET=your_webhook_secret_here
```

### Configuración en Calendly

1. **Crear una aplicación en Calendly**:
   - Ve a [Calendly Developer Portal](https://developer.calendly.com/)
   - Crea una nueva aplicación
   - Configura las URLs de redirección

2. **Obtener Access Token**:
   - Genera un Personal Access Token con permisos de organización
   - Guarda el token para usar en la aplicación

## 🔗 Endpoints Disponibles

### Webhook Endpoints

- `POST /calendly/webhook` - Recibe webhooks de Calendly
- `POST /calendly/webhook-subscriptions` - Crear webhook subscription
- `GET /calendly/webhook-subscriptions` - Listar webhook subscriptions
- `POST /calendly/webhook-subscriptions/:uri/delete` - Eliminar webhook subscription

### Event Management

- `GET /calendly/events` - Obtener todos los eventos
- `GET /calendly/events/:id` - Obtener evento específico
- `GET /calendly/stats` - Obtener estadísticas

### Test Endpoints

- `GET /calendly/ping` - Verificar que el servicio funciona
- `GET /calendly/test-webhook` - Probar webhook con datos simulados

## 📊 Tipos de Webhooks Soportados

### 1. invitee.created
Se dispara cuando un invitado programa un evento.

**Payload de ejemplo**:
```json
{
  "event": "invitee.created",
  "payload": {
    "uri": "https://api.calendly.com/scheduled_events/EVENT_UUID",
    "event_type": {
      "name": "Consultation",
      "uri": "https://api.calendly.com/event_types/EVENT_TYPE_UUID"
    },
    "start_time": "2024-01-15T10:00:00Z",
    "end_time": "2024-01-15T11:00:00Z",
    "invitee": {
      "email": "user@example.com",
      "name": "John Doe",
      "uri": "https://api.calendly.com/scheduled_events/EVENT_UUID/invitees/INVITEE_UUID"
    },
    "organizer": {
      "email": "organizer@example.com",
      "name": "Jane Smith"
    },
    "location": "Zoom Meeting",
    "description": "Initial consultation"
  }
}
```

### 2. invitee.canceled
Se dispara cuando un evento es cancelado.

**Payload de ejemplo**:
```json
{
  "event": "invitee.canceled",
  "payload": {
    "uri": "https://api.calendly.com/scheduled_events/EVENT_UUID",
    "cancel_reason": "Rescheduled by invitee"
  }
}
```

### 3. routing_form_submission.created
Se dispara cuando alguien envía un formulario de enrutamiento.

## 🛠️ Uso desde el Frontend

### 1. Acceder al Gestor de Calendly

1. Inicia sesión con Google
2. Ve a la página "📅 Calendly" desde el menú
3. Ingresa tu Calendly Access Token

### 2. Crear Webhook Subscription

1. Completa el formulario:
   - **URL**: `http://localhost:3000/calendly/webhook`
   - **Scope**: `organization` o `user`
   - **Organization URI**: URI de tu organización
   - **Events**: Selecciona los eventos que quieres recibir

2. Haz clic en "Crear Webhook Subscription"

### 3. Ver Eventos

- Los eventos se cargan automáticamente
- Puedes recargar la lista con el botón "Recargar"
- Cada evento muestra:
  - Tipo de evento
  - Email del invitado
  - Fecha y hora
  - Estado (activo/cancelado)
  - Indicador de webhook procesado

### 4. Probar Webhooks

- Usa el botón "Probar Webhook" para simular un evento
- Esto crea un evento de prueba en la base de datos

## 📈 Estadísticas Disponibles

- **Total Eventos**: Número total de eventos registrados
- **Eventos Activos**: Eventos no cancelados
- **Eventos Cancelados**: Eventos cancelados
- **Webhooks Procesados**: Eventos recibidos por webhook
- **Eventos este Mes**: Eventos del mes actual
- **Eventos esta Semana**: Eventos de la última semana

## 🔧 Configuración Avanzada

### Crear Webhook Subscription via API

```bash
curl -X POST "http://localhost:3000/calendly/webhook-subscriptions?token=YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "http://localhost:3000/calendly/webhook",
    "events": ["invitee.created", "invitee.canceled"],
    "organization": "https://api.calendly.com/organizations/YOUR_ORG_URI",
    "scope": "organization"
  }'
```

### Verificar Webhook Subscription

```bash
curl -X GET "http://localhost:3000/calendly/webhook-subscriptions?token=YOUR_ACCESS_TOKEN"
```

### Obtener Estadísticas

```bash
curl -X GET "http://localhost:3000/calendly/stats"
```

## 🗄️ Estructura de la Base de Datos

### Colección: events

```javascript
{
  _id: ObjectId,
  calendlyEventId: String,        // ID único del evento
  eventType: String,              // Tipo de evento
  startTime: Date,                // Hora de inicio
  endTime: Date,                  // Hora de fin
  inviteeEmail: String,           // Email del invitado
  inviteeName: String,            // Nombre del invitado
  inviteePhone: String,           // Teléfono del invitado
  organizerEmail: String,         // Email del organizador
  organizerName: String,          // Nombre del organizador
  location: String,               // Ubicación
  description: String,            // Descripción
  status: String,                 // 'active' o 'canceled'
  cancelReason: String,           // Razón de cancelación
  calendlyUri: String,            // URI del evento en Calendly
  inviteeUri: String,             // URI del invitado
  eventTypeUri: String,           // URI del tipo de evento
  calendlyData: Object,           // Datos completos de Calendly
  inviteeData: Object,            // Datos del invitado
  webhookProcessed: Boolean,      // Si fue procesado por webhook
  webhookProcessedAt: Date,       // Fecha de procesamiento
  webhookType: String,            // Tipo de webhook
  webhookPayload: Object,         // Payload del webhook
  createdAt: Date,                // Fecha de creación
  updatedAt: Date                 // Fecha de actualización
}
```

## 🔍 Troubleshooting

### Problemas Comunes

1. **Webhook no llega**:
   - Verifica que la URL sea accesible públicamente
   - Asegúrate de que el puerto 3000 esté abierto
   - Revisa los logs del servidor

2. **Error de autenticación**:
   - Verifica que el Access Token sea válido
   - Asegúrate de que tenga permisos de organización

3. **Eventos no se guardan**:
   - Verifica la conexión a MongoDB
   - Revisa los logs del servidor
   - Comprueba que el esquema esté correcto

### Logs Útiles

```bash
# Ver logs del servidor
npm run start:dev

# Verificar conexión a MongoDB
# Los logs mostrarán: "MongoDB connected successfully"

# Verificar webhook
# Los logs mostrarán: "📥 Webhook recibido: {event: 'invitee.created'}"
```

## 🚀 Próximos Pasos

1. **Configurar webhooks en producción**
2. **Implementar notificaciones por email**
3. **Agregar más tipos de eventos**
4. **Crear dashboard avanzado**
5. **Implementar sincronización bidireccional**

## 📚 Recursos Adicionales

- [Calendly API Documentation](https://developer.calendly.com/api-docs/)
- [Webhook Subscriptions Guide](https://developer.calendly.com/api-docs/b3A6NTY5MzU5-create-webhook-subscription)
- [NestJS Documentation](https://docs.nestjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/) 