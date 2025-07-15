# Integración de Calendly - Creación Programática de Eventos

## Descripción

Esta integración permite crear eventos de Calendly de manera programática a través de un endpoint REST API, utilizando la autenticación de Google OAuth y guardando los eventos en MongoDB.

## Características

- ✅ Autenticación con Google OAuth
- ✅ Creación programática de eventos de Calendly
- ✅ Validación de horarios disponibles
- ✅ Generación de links de agendado single-use
- ✅ Almacenamiento en MongoDB
- ✅ Interfaz web para pruebas
- ✅ Manejo de webhooks de Calendly

## Configuración

### 1. Variables de Entorno

Asegúrate de tener configuradas las siguientes variables en tu archivo `.env`:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/google/callback

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# MongoDB Configuration
MONGO_PASSWORD=your_mongodb_password_here
MONGO_URI=mongodb+srv://keirmauz:${MONGO_PASSWORD}@cluster0.yvdjajg.mongodb.net/Calendly

# Calendly OAuth Configuration
CALENDLY_CLIENT_ID=your_calendly_client_id_here
CALENDLY_CLIENT_SECRET=your_calendly_client_secret_here
CALENDLY_REDIRECT_URL=http://localhost:3000/calendly/callback

# Calendly Access Token (para creación programática)
CALENDLY_ACCESS_TOKEN=your_calendly_access_token_here

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 2. Instalación de Dependencias

```bash
# Backend
npm install class-validator class-transformer

# Frontend (ya está configurado)
cd frontend/frontend
npm install
```

## Uso

### 1. Iniciar el Backend

```bash
npm run start:dev
```

El servidor estará disponible en `http://localhost:3000`

### 2. Iniciar el Frontend

```bash
cd frontend/frontend
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

### 3. Autenticación

1. Ve a `http://localhost:5173`
2. Haz clic en "Iniciar Sesión con Google"
3. Completa el proceso de autenticación
4. Serás redirigido de vuelta al frontend

### 4. Crear Eventos Programáticos

1. Ve a la sección "Calendly" en el frontend
2. Encuentra la sección "🎯 Crear Evento Programático"
3. Completa el formulario con:
   - Fecha y hora de inicio
   - Fecha y hora de fin
   - Nombre de la persona
   - País
   - Email (opcional)
   - Teléfono (opcional)
   - Notas (opcional)
4. **Nueva funcionalidad**: Marca la casilla "🔗 Abrir link de Calendly automáticamente" si quieres que el link se abra automáticamente
5. Haz clic en "Crear Evento"
6. Recibirás un link de Calendly para agendar la cita
7. **Redirección automática**: Si tienes activada la opción, el link se abrirá automáticamente en una nueva pestaña

## Redirección Automática a Calendly

### 🚀 Nueva Funcionalidad

El sistema ahora incluye **redirección automática** al link de Calendly cuando se crea un evento programático.

#### Características:

1. **Checkbox de Control**: 
   - Opción "🔗 Abrir link de Calendly automáticamente"
   - Activado por defecto para mejor experiencia de usuario

2. **Dos Modos de Operación**:
   - **Automático**: El link se abre inmediatamente en una nueva pestaña
   - **Manual**: Se muestra una confirmación antes de abrir el link

3. **Experiencia Mejorada**:
   - Mensaje de confirmación claro
   - Link visible en el mensaje
   - Apertura en nueva pestaña (no interrumpe el flujo de trabajo)

#### Ejemplo de Uso:

```javascript
// El usuario crea un evento
const eventData = {
  start_time: "2024-06-01T10:00:00.000Z",
  end_time: "2024-06-01T10:30:00.000Z",
  name: "Juan Pérez",
  country: "MX",
  email: "juan@example.com"
};

// El sistema responde con:
{
  "success": true,
  "data": {
    "schedulingLink": "https://calendly.com/d/cv22-6jc-rkc/15-minute-meeting",
    "message": "Evento creado exitosamente. Use el link para agendar la cita."
  }
}

// Si autoRedirect está activado:
// → Se abre automáticamente: https://calendly.com/d/cv22-6jc-rkc/15-minute-meeting
// → Mensaje: "✅ Evento creado exitosamente! El link de Calendly se ha abierto en una nueva pestaña."

// Si autoRedirect está desactivado:
// → Confirmación: "¿Deseas abrir el link de agendado en Calendly?"
// → El usuario decide si abrir o no
```

## API Endpoints

### Crear Evento Programático

```http
POST /api/calendly/create-event
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "start_time": "2024-06-01T10:00:00.000Z",
  "end_time": "2024-06-01T10:30:00.000Z",
  "name": "Juan Pérez",
  "country": "MX",
  "email": "juan@example.com",
  "phone": "+52 123 456 7890",
  "notes": "Consulta sobre servicios"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "event": {
      "_id": "...",
      "calendlyEventId": "programmatic_1234567890",
      "eventType": "15 Minute Meeting",
      "startTime": "2024-06-01T10:00:00.000Z",
      "endTime": "2024-06-01T10:30:00.000Z",
      "inviteeName": "Juan Pérez",
      "inviteeEmail": "juan@example.com",
      "country": "MX",
      "schedulingLink": "https://calendly.com/d/abcd-brv8/15-minute-meeting"
    },
    "schedulingLink": "https://calendly.com/d/abcd-brv8/15-minute-meeting",
    "message": "Evento creado exitosamente. Use el link para agendar la cita."
  }
}
```

### Verificar Estado de Autenticación

```http
GET /api/auth/status
```

### Obtener Eventos

```http
GET /api/calendly/events
```

### Obtener Estadísticas

```http
GET /api/calendly/stats
```

### Eliminar Webhook Subscription

```http
DELETE /api/calendly/webhook-subscriptions/{webhook_uuid}?token={access_token}
```

**Ejemplo:**
```bash
curl --request DELETE \
  --url "https://api.calendly.com/webhook_subscriptions/webhook_uuid" \
  --header "Authorization: Bearer {access_token}" \
  --header "Content-Type: application/json"
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": { "success": true },
  "message": "Webhook subscription eliminado exitosamente"
}
```

## Flujo de Creación de Eventos

1. **Validación de Usuario**: El endpoint verifica que el usuario esté autenticado con Google
2. **Obtención de Token**: Se obtiene el token de acceso de Calendly desde las variables de entorno
3. **Consulta de Tipos de Eventos**: Se obtienen los tipos de eventos disponibles en Calendly
4. **Creación Automática**: Si no hay tipos de eventos, se crea uno por defecto automáticamente
5. **Verificación de Disponibilidad**: Se verifica que haya horarios disponibles (opcional, continúa si falla)
6. **Creación de Link**: Se crea un link de agendado single-use
7. **Almacenamiento**: Se guarda la información del evento en MongoDB
8. **Respuesta**: Se devuelve el link de agendado y la confirmación

## Estructura de la Base de Datos

### Event Schema

```javascript
{
  calendlyEventId: String,      // ID único del evento
  eventType: String,            // Tipo de evento de Calendly
  startTime: Date,              // Fecha y hora de inicio
  endTime: Date,                // Fecha y hora de fin
  inviteeEmail: String,         // Email del invitado
  inviteeName: String,          // Nombre del invitado
  inviteePhone: String,         // Teléfono del invitado
  organizerEmail: String,       // Email del organizador (usuario autenticado)
  organizerName: String,        // Nombre del organizador
  location: String,             // Ubicación del evento
  description: String,          // Descripción del evento
  status: String,               // Estado del evento (pending, active, canceled)
  calendlyUri: String,          // URI del evento en Calendly
  eventTypeUri: String,         // URI del tipo de evento
  schedulingLink: String,       // Link de agendado
  country: String,              // País del evento
  calendlyData: Object,         // Datos completos de Calendly
  webhookType: String,          // Tipo de webhook
  webhookProcessed: Boolean,    // Si el webhook fue procesado
  webhookProcessedAt: Date      // Fecha de procesamiento del webhook
}
```

## Seguridad

- ✅ Autenticación JWT requerida para crear eventos
- ✅ Validación de datos de entrada
- ✅ Manejo seguro de tokens de Calendly
- ✅ Cookies HTTP-only para JWT
- ✅ Validación de fechas y rangos de tiempo

## Troubleshooting

### Error: "Token de acceso de Calendly no configurado"
- Verifica que `CALENDLY_ACCESS_TOKEN` esté configurado en tu `.env`

### Error: "No se encontraron tipos de eventos disponibles"
- El sistema creará automáticamente un tipo de evento por defecto
- Si persiste el error, verifica que el token tenga permisos para crear tipos de eventos
- Verifica que el usuario de Calendly tenga permisos de administrador

### Error: "No hay horarios disponibles"
- El sistema continuará creando el link de agendado incluso sin verificar disponibilidad
- Para eventos recién creados, puede tomar tiempo para que Calendly configure la disponibilidad
- Verifica que las fechas estén en el futuro
- El rango de fechas se ajusta automáticamente a máximo 7 días

### Error: "Usuario no autenticado"
- Asegúrate de haber iniciado sesión con Google
- Verifica que las cookies estén habilitadas en el navegador

## Desarrollo

### Estructura de Archivos

```
src/
├── calendly/
│   ├── dto/
│   │   ├── create-event.dto.ts
│   │   └── calendly-response.dto.ts
│   ├── schemas/
│   │   └── event.schema.ts
│   ├── calendly.controller.ts
│   ├── calendly.service.ts
│   └── calendly.module.ts
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── google.strategy.ts
│   └── jwt.strategy.ts
└── main.ts
```

### Agregar Nuevos Tipos de Eventos

Para agregar nuevos tipos de eventos, modifica la lógica en `calendly.service.ts`:

```typescript
// En el método selectBestEventType
const selectedEventType = eventTypes.find(type => 
  type.name === 'Tu Tipo de Evento Específico'
) || this.selectBestEventType(eventTypes);
```

### Lógica de Selección de Eventos

El sistema selecciona automáticamente el mejor tipo de evento disponible:

1. **Prioriza eventos activos** y de tipo estándar
2. **Prefiere eventos one-on-one** (1 host, 1 invitado) sobre grupales
3. **Selecciona eventos con duración** entre 15-60 minutos
4. **Ordena por duración** (prefiere eventos más cortos)
5. **Fallback** a cualquier evento disponible si no hay opciones preferidas

### Tipos de Eventos de Calendly

- **One-on-One (Solo)**: 1 host, 1 invitado - Ideal para consultas individuales
- **Group**: Múltiples hosts/invitados - Para eventos grupales
- **Collective**: Todos los participantes deben estar disponibles
- **Round Robin**: Alterna entre diferentes hosts

### Creación Automática de Tipos de Eventos

Si no hay tipos de eventos configurados, el sistema crea automáticamente uno por defecto:

- **Nombre**: "Consulta One-on-One"
- **Tipo**: One-on-One (1 host, 1 invitado)
- **Duración**: 30 minutos
- **Descripción**: "Consulta individual de 30 minutos"
- **Tipo**: StandardEventType
- **Kind**: Solo (evento individual)
- **Color**: Azul (#3B82F6)
- **Estado**: Activo

## Producción

Para desplegar en producción:

1. Configura HTTPS
2. Cambia `secure: false` a `secure: true` en las cookies
3. Configura dominios correctos en las variables de entorno
4. Usa un JWT_SECRET fuerte
5. Configura variables de entorno de producción para Calendly
6. Configura MongoDB Atlas para producción

## Licencia

Este proyecto está bajo la licencia MIT. 