# Activación Manual de Contactos

Este documento explica cómo activar manualmente los contactos después de que se registren en Calendly.

## 🎯 Funcionalidad

Cuando un usuario completa el formulario de contacto y luego se registra en Calendly, puedes activar manualmente el contacto usando el endpoint proporcionado.

## 🔧 Activación Manual

### Endpoint de Activación

```bash
PUT /api/contact/activate/{email}
```

### Ejemplo de Uso

```bash
# Reemplaza con el email del contacto que quieres activar
curl -X PUT "http://localhost:3000/api/contact/activate/usuario@ejemplo.com"
```

### Respuesta Exitosa

```json
{
  "success": true,
  "message": "Contacto activado exitosamente",
  "data": {
    "id": "...",
    "email": "usuario@ejemplo.com",
    "status": "active",
    "processed": true,
    "processedAt": "2024-01-15T10:00:00.000Z",
    "calendlyEventType": "Consulta de Viaje",
    "calendlyRegistrationDate": "2024-01-15T10:00:00.000Z"
  }
}
```

## 📊 Estructura de Datos

### Estado del Contacto

```javascript
// Estado inicial (después del formulario)
{
  status: 'pending',
  processed: false,
  processedAt: null
}

// Estado después de la activación manual
{
  status: 'active',
  processed: true,
  processedAt: new Date(),
  calendlyEventType: 'Consulta de Viaje',
  calendlyStartTime: new Date(),
  calendlyRegistrationDate: new Date(),
  calendlyInviteeName: 'Usuario Calendly',
  calendlyInviteeUri: 'calendly-registration'
}
```

## 🔍 Endpoints Disponibles

### Activación de Contactos
- **PUT** `/api/contact/activate/{email}` - Activar contacto por email

### Gestión de Contactos
- **POST** `/api/contact` - Crear nuevo contacto
- **GET** `/api/contact` - Obtener todos los contactos
- **GET** `/api/contact/:id` - Obtener contacto específico
- **PUT** `/api/contact/:id/status` - Actualizar estado manualmente
- **DELETE** `/api/contact/:id` - Eliminar contacto

## 🚀 Flujo Completo

1. **Usuario llena formulario** → Contacto se guarda con estado `pending`
2. **Usuario se registra en Calendly** → (Proceso manual)
3. **Administrador activa contacto** → Usa el endpoint de activación
4. **Estado cambia a active** → Contacto marcado como procesado

## 📝 Logs de Debug

El sistema registra los siguientes eventos:

```
🎯 Activating contact for email: usuario@email.com
✅ Contact activated successfully
```

## 🎨 Frontend

El frontend incluye:
- **Notificaciones elegantes** con animaciones suaves
- **Auto-cierre** después de 4 segundos
- **Barra de progreso** visual
- **Iconos intuitivos** para cada tipo de mensaje
- **Responsive design** para móviles

## 📱 Estados de Notificación

- **Loading**: "Enviando formulario..." (con spinner)
- **Success**: "¡Formulario enviado exitosamente! Redirigiendo a Calendly..."
- **Error**: "Error al enviar el formulario. Por favor, intenta de nuevo." 