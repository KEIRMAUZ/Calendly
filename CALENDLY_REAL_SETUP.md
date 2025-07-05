# 🚀 Configuración Real de Calendly

## 📋 Requisitos Previos

1. **Cuenta de Calendly** (gratuita o de pago)
2. **Acceso a la configuración de desarrollador de Calendly**

## 🔑 Paso 1: Obtener Credenciales de Calendly

### 1.1 Ir a Calendly Developer Portal
- Ve a: https://calendly.com/app/admin/integrations/api_keys
- O navega: Calendly → Settings → Integrations → API Keys

### 1.2 Crear una Nueva API Key
1. Haz clic en **"Create API Key"**
2. Dale un nombre descriptivo: `"Mi Aplicación de Eventos"`
3. Selecciona los permisos necesarios:
   - ✅ **Read Event Types** (para obtener tipos de eventos)
   - ✅ **Read Scheduled Events** (para obtener eventos programados)
   - ✅ **Create Scheduling Links** (para crear enlaces de programación)
   - ✅ **Read User Info** (para obtener información del usuario)

### 1.3 Obtener Access Token
1. Después de crear la API Key, copia el **Access Token**
2. Este token es tu credencial principal para la API

## 🔧 Paso 2: Configurar Variables de Entorno

### 2.1 Editar archivo .env
En tu archivo `Calendly/.env`, agrega:

```bash
# Calendly Real Configuration
CALENDLY_ACCESS_TOKEN=tu_access_token_real_aqui
CALENDLY_CLIENT_ID=tu_client_id_si_tienes_oauth
CALENDLY_CLIENT_SECRET=tu_client_secret_si_tienes_oauth

# OAuth Configuration (opcional para integración avanzada)
CALENDLY_REDIRECT_URL=http://localhost:3000/calendly/callback

# Webhook Configuration (opcional)
CALENDLY_WEBHOOK_SECRET=tu_webhook_secret_si_configuras_webhooks
```

### 2.2 Ejemplo de configuración:
```bash
CALENDLY_ACCESS_TOKEN=cal_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 🧪 Paso 3: Probar la Integración

### 3.1 Reiniciar el Backend
```bash
cd Calendly
npm run start:dev
```

### 3.2 Verificar en el Frontend
1. Abre tu aplicación frontend
2. Haz clic en **"🔧 Estado de Calendly"**
3. Deberías ver:
   - ✅ Token de Acceso: Configurado
   - ✅ Conexión a Calendly: Disponible

### 3.3 Probar Endpoints
1. Haz clic en **"📋 Ver Eventos"** - Deberías ver eventos reales de Calendly
2. Haz clic en **"➕ Crear Evento"** - Deberías ver tipos de eventos reales

## 🔍 Paso 4: Verificar Funcionalidad

### 4.1 Eventos Reales
- Los eventos mostrados serán eventos reales de tu cuenta de Calendly
- Las fechas y detalles serán reales
- Los invitados serán reales

### 4.2 Creación de Enlaces
- Al crear eventos de Calendly, se generarán enlaces reales
- Los invitados podrán programar citas reales
- Las confirmaciones se enviarán por email

## 🛠️ Paso 5: Configuración Avanzada (Opcional)

### 5.1 OAuth Flow (Para integración completa)
Si quieres que los usuarios se autentiquen con sus propias cuentas de Calendly:

1. **Crear OAuth App en Calendly:**
   - Ve a: https://calendly.com/app/admin/integrations/oauth
   - Crea una nueva OAuth App
   - Obtén Client ID y Client Secret

2. **Configurar Callback URL:**
   - URL: `http://localhost:3000/calendly/callback`
   - Scope: `read_events read_event_types create_scheduling_links`

### 5.2 Webhooks (Para actualizaciones en tiempo real)
Para recibir notificaciones cuando se creen/cancelen eventos:

1. **Crear Webhook:**
   - Endpoint: `http://localhost:3000/calendly/webhook`
   - Events: `invitee.created`, `invitee.canceled`

## 🚨 Solución de Problemas

### Error 400 - Bad Request
- Verifica que el Access Token sea válido
- Asegúrate de que tenga los permisos correctos
- Revisa los logs del backend para detalles específicos

### Error 401 - Unauthorized
- El Access Token ha expirado o es inválido
- Regenera el token en Calendly
- Actualiza la variable de entorno

### Error 403 - Forbidden
- El token no tiene permisos suficientes
- Verifica los permisos en la configuración de Calendly

### No se muestran eventos
- Verifica que tengas eventos programados en Calendly
- Asegúrate de que el token tenga permisos de lectura
- Revisa los logs del backend

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs del backend
2. Verifica la configuración en Calendly
3. Asegúrate de que las variables de entorno estén correctas
4. Prueba con un token nuevo

## 🎯 Resultado Esperado

Con la configuración correcta:
- ✅ Eventos reales de Calendly visibles
- ✅ Creación de enlaces de programación reales
- ✅ Integración completa con tu cuenta de Calendly
- ✅ Sin eventos de demostración
- ✅ Funcionalidad 100% real 