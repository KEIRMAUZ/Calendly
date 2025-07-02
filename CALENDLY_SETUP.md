# Configuración de Calendly

Este documento explica cómo configurar la integración con Calendly para obtener datos reales de eventos.

## 1. Configuración en Calendly

### 1.1 Crear una aplicación en Calendly

1. Ve a [Calendly Developer Portal](https://developer.calendly.com/)
2. Inicia sesión con tu cuenta de Calendly
3. Crea una nueva aplicación
4. Configura las URLs de redirección:
   - `http://localhost:3000/calendly/callback` (para desarrollo)
   - `https://tu-dominio.com/calendly/callback` (para producción)

### 1.2 Obtener credenciales

Anota las siguientes credenciales:
- **Client ID**
- **Client Secret**

## 2. Configuración del Backend

### 2.1 Variables de entorno

Crea un archivo `.env` en la carpeta `Calendly/` con las siguientes variables:

```env
# Calendly OAuth Configuration
CALENDLY_CLIENT_ID=tu_client_id_aqui
CALENDLY_CLIENT_SECRET=tu_client_secret_aqui
CALENDLY_REDIRECT_URL=http://localhost:3000/calendly/callback

# Calendly Access Token (se obtiene después del flujo OAuth)
CALENDLY_ACCESS_TOKEN=tu_access_token_aqui

# Otras configuraciones...
GOOGLE_CLIENT_ID=tu_google_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_google_client_secret_aqui
GOOGLE_CALLBACK_URL=http://localhost:3000/google/callback
JWT_SECRET=tu_jwt_secret_aqui
FRONTEND_URL=http://localhost:5173
PORT=3000
NODE_ENV=development
```

### 2.2 Obtener el Access Token

Para obtener el token de acceso de Calendly:

1. **Método 1: Usando el endpoint de conexión**
   ```bash
   # Visita esta URL en tu navegador:
   http://localhost:3000/calendly/connect
   ```

2. **Método 2: Manualmente**
   - Ve a [Calendly OAuth](https://auth.calendly.com/oauth/authorize)
   - Usa tu Client ID
   - Configura la URL de redirección
   - Completa el flujo OAuth

3. **Copiar el token**
   - Después del flujo OAuth, copia el `accessToken` de la respuesta
   - Configúralo como `CALENDLY_ACCESS_TOKEN` en tu archivo `.env`

## 3. Endpoints Disponibles

### 3.1 Eventos
- `GET /calendly/events` - Obtener eventos programados
- `POST /calendly/events` - Crear evento (simulado)

### 3.2 Estadísticas
- `GET /calendly/stats` - Obtener estadísticas de eventos

### 3.3 Tipos de Evento
- `GET /calendly/event-types` - Obtener tipos de eventos configurados

### 3.4 Autenticación
- `GET /calendly/connect` - Iniciar flujo OAuth
- `GET /calendly/callback` - Callback del flujo OAuth

## 4. Uso en el Frontend

### 4.1 Autenticación requerida

Todos los endpoints de Calendly requieren autenticación JWT. Asegúrate de:

1. Iniciar sesión con Google OAuth primero
2. Tener el token JWT válido en las cookies

### 4.2 Ejemplo de uso

```javascript
// Obtener eventos
const response = await fetch('http://localhost:3000/calendly/events', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  credentials: 'include', // Importante para enviar cookies
});

const data = await response.json();
console.log(data);
```

## 5. Estructura de Datos

### 5.1 Eventos
```json
{
  "message": "Eventos de Calendly obtenidos exitosamente",
  "status": "success",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "data": {
    "collection": [
      {
        "uri": "https://api.calendly.com/scheduled_events/...",
        "name": "Reunión de Consulta",
        "status": "active",
        "start_time": "2024-01-15 10:00:00",
        "end_time": "2024-01-15 11:00:00",
        "created_at": "2024-01-10 09:00:00",
        "event_type": {
          "name": "Consulta de 60 minutos",
          "uri": "https://api.calendly.com/event_types/..."
        },
        "invitee": {
          "name": "Juan Pérez",
          "email": "juan@example.com"
        }
      }
    ],
    "summary": {
      "total_events": 1,
      "upcoming_events": 1,
      "past_events": 0
    }
  }
}
```

### 5.2 Estadísticas
```json
{
  "message": "Estadísticas de Calendly obtenidas exitosamente",
  "status": "success",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "data": {
    "total_events": 156,
    "events_this_month": 23,
    "events_this_week": 5,
    "upcoming_events": 8,
    "past_events": 148,
    "average_duration": "45 minutos",
    "most_popular_time": "10:00 AM",
    "cancellation_rate": "8%"
  }
}
```

## 6. Solución de Problemas

### 6.1 Error: "No se encontró token de acceso de Calendly"

**Causa:** La variable `CALENDLY_ACCESS_TOKEN` no está configurada.

**Solución:**
1. Verifica que el archivo `.env` existe
2. Asegúrate de que `CALENDLY_ACCESS_TOKEN` esté configurado
3. Reinicia el servidor después de cambiar las variables de entorno

### 6.2 Error: "Invalid authorization header"

**Causa:** No estás autenticado con Google OAuth.

**Solución:**
1. Inicia sesión primero con Google OAuth
2. Verifica que las cookies de JWT estén presentes
3. Asegúrate de usar `credentials: 'include'` en las peticiones

### 6.3 Error: "Failed to get access token from Calendly"

**Causa:** Credenciales de Calendly incorrectas o expiradas.

**Solución:**
1. Verifica `CALENDLY_CLIENT_ID` y `CALENDLY_CLIENT_SECRET`
2. Asegúrate de que la URL de redirección coincida
3. Obtén un nuevo token de acceso

## 7. Próximos Pasos

1. **Base de datos:** Almacenar tokens de acceso por usuario
2. **Webhooks:** Configurar webhooks para eventos en tiempo real
3. **Creación de eventos:** Implementar creación real de eventos
4. **Analytics avanzados:** Métricas más detalladas
5. **Integración con calendarios:** Sincronización con Google Calendar

## 8. Recursos Adicionales

- [Calendly API Documentation](https://developer.calendly.com/api-docs/)
- [Calendly OAuth Guide](https://developer.calendly.com/api-docs/basics/authentication)
- [NestJS Documentation](https://docs.nestjs.com/) 