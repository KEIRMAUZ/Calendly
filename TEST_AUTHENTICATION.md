# 🧪 Probar Autenticación con Google

## ✅ Cambios Realizados

### 1. Estrategia de Google Actualizada
- **Agregado `googleId`** al perfil procesado
- **Validaciones mejoradas** en la estrategia
- **Logs detallados** para debugging

### 2. Servicio de Autenticación Corregido
- **Usa `googleId`** de la estrategia
- **Validaciones robustas** para todos los campos
- **Manejo de errores** mejorado

## 🚀 Probar la Autenticación

### 1. Reiniciar el Backend
```bash
cd Calendly
npm run start:dev
```

### 2. Verificar Logs de Inicio
Deberías ver:
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
Usuario recibido: {
  googleId: "123456789",
  email: "usuario@gmail.com",
  firstName: "Usuario",
  lastName: "Apellido",
  picture: "https://...",
  accessToken: "ya29..."
}
🔍 Perfil original de Google: { ... }
✅ Usuario procesado por estrategia: { ... }
🔍 Validando perfil de Google: { ... }
✅ Usuario validado: { ... }
✅ Autenticación exitosa, estableciendo cookie...
🔄 Redirigiendo a: http://localhost:5173?success=true
```

## 🎯 Resultado Esperado

### ✅ Éxito
- **Redirección exitosa** a `http://localhost:5173?success=true`
- **Mensaje de éxito** en el frontend
- **Usuario autenticado** mostrado con foto y datos
- **Cookie JWT** establecida correctamente

### ❌ Error
- **Redirección con error** a `http://localhost:5173?error=auth_failed&message=...`
- **Mensaje de error** específico en el frontend
- **Logs detallados** en la consola del backend

## 🔍 Debugging

### Si Hay Errores
1. **Revisa los logs** del backend para ver exactamente qué datos recibe
2. **Verifica la configuración** de Google Console
3. **Asegúrate** de que las variables de entorno estén correctas

### Logs Importantes
- `🔍 Perfil original de Google:` - Datos crudos de Google
- `✅ Usuario procesado por estrategia:` - Datos después del procesamiento
- `🔍 Validando perfil de Google:` - Datos que llegan al servicio
- `✅ Usuario validado:` - Datos finales del usuario

## 🚨 Solución de Problemas

### Error: "Google ID no encontrado"
- **Verifica** que la estrategia esté enviando el `googleId`
- **Revisa** los logs del perfil original de Google

### Error: "Email no encontrado"
- **Verifica** que el usuario tenga email en Google
- **Revisa** que los scopes incluyan 'email'

### Error: "Nombre no encontrado"
- **Verifica** que el usuario tenga nombre en Google
- **Revisa** que los scopes incluyan 'profile'

## ✅ Checklist de Verificación

- [ ] Backend reiniciado correctamente
- [ ] Logs de configuración mostrados
- [ ] Autenticación con Google iniciada
- [ ] Callback procesado sin errores
- [ ] Usuario redirigido al frontend
- [ ] Mensaje de éxito mostrado
- [ ] Usuario autenticado visible
- [ ] Cookie JWT establecida

¡Con estos cambios, la autenticación debería funcionar perfectamente! 🎉 