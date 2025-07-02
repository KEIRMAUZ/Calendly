# 🔐 Configuración de Google OAuth2

## 📋 Pasos para Configurar Google OAuth2

### 1. Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google+ API** (ahora llamada Google People API)

### 2. Crear Credenciales OAuth2

1. Ve a **"APIs & Services"** → **"Credentials"**
2. Haz clic en **"Create Credentials"** → **"OAuth 2.0 Client IDs"**
3. Selecciona **"Web application"** como tipo de aplicación

### 3. Configurar URLs Autorizadas

#### Authorized JavaScript origins:
```
http://localhost:3000
http://localhost:5173
http://127.0.0.1:3000
http://127.0.0.1:5173
```

#### Authorized redirect URIs:
```
http://localhost:3000/google/callback
```

### 4. Configurar Variables de Entorno

Crea un archivo `.env` en la carpeta `Calendly` con:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=tu_google_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_google_client_secret_aqui
GOOGLE_CALLBACK_URL=http://localhost:3000/google/callback

# JWT Configuration
JWT_SECRET=tu_jwt_secret_super_seguro_aqui

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 5. Verificar Configuración

#### URLs que DEBEN coincidir:

1. **Google Console** → **Authorized redirect URIs**:
   ```
   http://localhost:3000/google/callback
   ```

2. **Backend** → **google.strategy.ts**:
   ```typescript
   callbackURL: 'http://localhost:3000/google/callback'
   ```

3. **Backend** → **auth.controller.ts**:
   ```typescript
   @Controller('google')
   @Get('callback')
   ```

## 🚨 Solución de Errores Comunes

### Error: "redirect_uri_mismatch"

**Causa**: La URL de redirección no coincide con la configurada en Google Console.

**Solución**:
1. Verifica que en Google Console tengas exactamente:
   ```
   http://localhost:3000/google/callback
   ```
2. Asegúrate de que no haya espacios extra
3. Verifica que el protocolo sea `http://` (no `https://`)

### Error: "Invalid client"

**Causa**: Las credenciales de Google no están configuradas correctamente.

**Solución**:
1. Verifica que `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` estén en el archivo `.env`
2. Asegúrate de que las credenciales sean correctas
3. Verifica que el proyecto tenga la API de Google+ habilitada

### Error: "Unexpected token 'H'"

**Causa**: El endpoint raíz devuelve texto en lugar de JSON.

**Solución**: ✅ **Ya solucionado** - El endpoint ahora devuelve JSON válido.

## 🔍 Verificar Configuración

### 1. Verificar Variables de Entorno
```bash
cd Calendly
echo $GOOGLE_CLIENT_ID
echo $GOOGLE_CLIENT_SECRET
```

### 2. Verificar Endpoints
```bash
# Probar endpoint raíz
curl http://localhost:3000/

# Probar endpoint de Google Auth
curl http://localhost:3000/auth/google
```

### 3. Verificar en Google Console
- **Project**: Tu proyecto está seleccionado
- **APIs**: Google+ API está habilitada
- **Credentials**: OAuth 2.0 Client ID está configurado
- **Authorized redirect URIs**: Contiene `http://localhost:3000/google/callback`

## 🎯 URLs Importantes

| Propósito | URL |
|-----------|-----|
| Backend | `http://localhost:3000` |
| Frontend | `http://localhost:5173` |
| Google Auth | `http://localhost:3000/auth/google` |
| Google Callback | `http://localhost:3000/google/callback` |

## ✅ Checklist de Configuración

- [ ] Proyecto creado en Google Cloud Console
- [ ] Google+ API habilitada
- [ ] OAuth 2.0 Client ID creado
- [ ] URLs autorizadas configuradas correctamente
- [ ] Archivo `.env` creado con credenciales
- [ ] Backend corriendo en puerto 3000
- [ ] Frontend corriendo en puerto 5173
- [ ] Prueba de conexión exitosa
- [ ] Autenticación con Google funcionando

¡Una vez completado este checklist, la autenticación con Google debería funcionar correctamente! 🎉 