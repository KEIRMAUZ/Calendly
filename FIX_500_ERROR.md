# 🚨 Solución: Error 500 en Autenticación Google

## Problema
```
ERROR [ExceptionsHandler] TypeError: Cannot read properties of undefined (reading '0')
    at AuthService.validateGoogleUser
```

## ✅ Solución Aplicada

### 1. Validaciones Agregadas en `auth.service.ts`

Se agregaron validaciones para evitar errores cuando los datos del perfil de Google no están completos:

```typescript
async validateGoogleUser(profile: any) {
  console.log('🔍 Validando perfil de Google:', JSON.stringify(profile, null, 2));
  
  const { id, name, emails, photos } = profile;
  
  // Validar que los datos necesarios existan
  if (!id) {
    throw new Error('Google ID no encontrado en el perfil');
  }
  
  if (!emails || !emails.length) {
    throw new Error('Email no encontrado en el perfil de Google');
  }
  
  if (!name) {
    throw new Error('Nombre no encontrado en el perfil de Google');
  }
  
  const user = {
    googleId: id,
    email: emails[0].value,
    firstName: name.givenName || 'Usuario',
    lastName: name.familyName || 'Google',
    picture: photos && photos.length > 0 ? photos[0].value : null,
  };

  console.log('✅ Usuario validado:', user);
  return user;
}
```

### 2. Manejo de Errores Mejorado en `auth.controller.ts`

Se agregó try-catch y logs detallados para identificar problemas:

```typescript
@Get('google/callback')
@UseGuards(AuthGuard('google'))
async googleAuthRedirect(@Req() req, @Res() res: Response) {
  try {
    console.log('🔄 Procesando callback de Google...');
    console.log('Usuario recibido:', req.user);
    
    if (!req.user) {
      console.error('❌ No se recibió usuario de Google');
      return res.redirect(`${this.configService.get('FRONTEND_URL', 'http://localhost:5173')}?error=no_user`);
    }

    const user = await this.authService.validateGoogleUser(req.user);
    const result = await this.authService.login(user);
    
    console.log('✅ Autenticación exitosa, estableciendo cookie...');
    
    // Establecer cookie JWT
    res.cookie('jwt', result.access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });
    
    const redirectUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:5173')}?success=true`;
    console.log('🔄 Redirigiendo a:', redirectUrl);
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('❌ Error en callback de Google:', error);
    const redirectUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:5173')}?error=auth_failed&message=${encodeURIComponent(error.message)}`;
    res.redirect(redirectUrl);
  }
}
```

### 3. Frontend Actualizado para Manejar Errores

El frontend ahora maneja parámetros de URL para mostrar mensajes de éxito/error:

```javascript
// Verificar parámetros de URL después de autenticación
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const success = urlParams.get('success');
  const error = urlParams.get('error');
  const message = urlParams.get('message');

  if (success === 'true') {
    setAuthMessage({ type: 'success', text: '¡Autenticación exitosa! Redirigiendo...' });
    // Recargar estado de autenticación
  } else if (error) {
    setAuthMessage({ 
      type: 'error', 
      text: `Error de autenticación: ${message || error}` 
    });
  }
}, []);
```

## 🔍 Pasos para Verificar

### 1. Reiniciar el Backend
```bash
cd Calendly
npm run start:dev
```

### 2. Verificar Logs
Cuando hagas clic en "Iniciar Sesión con Google", deberías ver en la consola del backend:

```
🔐 Google OAuth Configuration:
   Client ID: ✅ Configurado
   Client Secret: ✅ Configurado
   Callback URL: http://localhost:3000/google/callback
   ⚠️  Asegúrate de que esta URL esté en Google Console
```

### 3. Probar Autenticación
1. Ve a `http://localhost:5173`
2. Haz clic en "🧪 Mostrar Prueba Backend"
3. Haz clic en "Iniciar Sesión con Google"
4. Completa el proceso de autenticación

### 4. Verificar Logs Durante Autenticación
Deberías ver logs como:
```
🔄 Procesando callback de Google...
Usuario recibido: { ... }
🔍 Validando perfil de Google: { ... }
✅ Usuario validado: { ... }
✅ Autenticación exitosa, estableciendo cookie...
🔄 Redirigiendo a: http://localhost:5173?success=true
```

## 🚨 Si Aún Hay Problemas

### Verificar Variables de Entorno
Asegúrate de que tu archivo `.env` tenga:
```env
GOOGLE_CLIENT_ID=tu_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
GOOGLE_CALLBACK_URL=http://localhost:3000/google/callback
FRONTEND_URL=http://localhost:5173
JWT_SECRET=tu_jwt_secret_aqui
```

### Verificar Google Console
1. URL de redirección debe ser: `http://localhost:3000/google/callback`
2. URLs autorizadas deben incluir: `http://localhost:3000` y `http://localhost:5173`

### Verificar Permisos de Google
Asegúrate de que tu aplicación tenga acceso a:
- Email
- Profile
- OpenID

## ✅ Resultado Esperado

Después de estos cambios:
- ✅ No más errores 500
- ✅ Logs detallados para debugging
- ✅ Manejo de errores robusto
- ✅ Mensajes de éxito/error en el frontend
- ✅ Autenticación completa funcionando

¡El error 500 debería estar solucionado! 🎉 