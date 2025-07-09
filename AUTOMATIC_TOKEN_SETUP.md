# Configuración Automática del Access Token

## 🎯 Objetivo

Hacer que la experiencia del usuario sea más intuitiva cargando automáticamente el `CALENDLY_ACCESS_TOKEN` desde las variables de entorno del backend, eliminando la necesidad de que el usuario lo ingrese manualmente.

## 🔧 Cambios Realizados

### 1. Backend - Nuevo Endpoint

#### Endpoint Agregado:
- `GET /calendly/access-token` - Obtener el token automáticamente

#### Funcionalidad:
- Lee `CALENDLY_ACCESS_TOKEN` desde las variables de entorno
- Retorna el token de forma segura al frontend
- Maneja errores si el token no está configurado

### 2. Frontend - Carga Automática

#### Nuevas Funcionalidades:
- ✅ **Carga automática** del token al iniciar la aplicación
- ✅ **Indicador visual** del estado del token (verde/amarillo)
- ✅ **Botón "Recargar Token"** para actualizar manualmente
- ✅ **Mensajes informativos** sobre el estado del token

#### Comportamiento:
1. Al cargar la página, intenta obtener el token automáticamente
2. Si el token está disponible, lo muestra en el campo
3. Si no está disponible, muestra un mensaje de advertencia
4. El usuario puede recargar el token manualmente si es necesario

### 3. Variables de Entorno

#### Agregado en `env.example`:
```env
# Calendly Access Token (for automatic frontend loading)
CALENDLY_ACCESS_TOKEN=your_calendly_access_token_here
```

## 🚀 Cómo Configurar

### Paso 1: Configurar el Token en el Backend

1. **Copia tu token de Calendly** desde tu cuenta de Calendly
2. **Agrega la variable** en tu archivo `.env`:
   ```env
   CALENDLY_ACCESS_TOKEN=tu_token_de_calendly_aqui
   ```

### Paso 2: Reiniciar el Backend

```bash
npm run start:dev
```

### Paso 3: Verificar en el Frontend

1. **Inicia el frontend**:
   ```bash
   cd frontend/frontend
   npm run dev
   ```

2. **Navega a "Calendly Manager"**

3. **Verifica que aparezca**:
   - ✅ Indicador verde: "Token cargado automáticamente"
   - ✅ El campo de token esté lleno
   - ✅ Mensaje: "Token configurado - puedes gestionar webhooks y eventos de Calendly"

## 🎨 Experiencia del Usuario

### Antes:
- ❌ Usuario tenía que buscar y copiar su token manualmente
- ❌ Campo vacío requería acción del usuario
- ❌ No había indicación clara del estado del token

### Ahora:
- ✅ **Carga automática** al iniciar la aplicación
- ✅ **Indicador visual** del estado (verde/amarillo)
- ✅ **Mensajes informativos** claros
- ✅ **Botón de recarga** para casos especiales
- ✅ **Experiencia fluida** como si ya estuviera configurado

## 🔍 Estados del Token

### 🟢 Token Disponible:
- Indicador verde
- Campo lleno automáticamente
- Mensaje: "Token cargado automáticamente"
- Funcionalidades completas disponibles

### 🟡 Token No Disponible:
- Indicador amarillo
- Campo vacío
- Mensaje: "Token no disponible - ingresa manualmente"
- Usuario puede ingresar token manualmente

## 🛠️ Funcionalidades Disponibles

### Con Token Configurado:
- ✅ Crear webhook subscriptions
- ✅ Listar webhooks existentes
- ✅ Eliminar webhooks
- ✅ Obtener información del usuario
- ✅ Ver eventos programados
- ✅ Crear eventos manualmente
- ✅ Ver estadísticas

### Sin Token:
- ✅ Crear eventos manualmente
- ✅ Ver eventos existentes
- ✅ Ver estadísticas
- ❌ Gestión de webhooks (requiere token)

## 🔒 Seguridad

- El token se almacena solo en el backend
- El frontend solo recibe el token cuando es necesario
- No se almacena permanentemente en el frontend
- El usuario puede recargar el token si es necesario

## 🐛 Troubleshooting

### Token No Se Carga Automáticamente:
1. Verifica que `CALENDLY_ACCESS_TOKEN` esté en tu `.env`
2. Reinicia el backend
3. Usa el botón "Recargar Token"
4. Verifica la consola del navegador para errores

### Error "CALENDLY_ACCESS_TOKEN no configurado":
1. Agrega la variable a tu `.env`
2. Reinicia el backend
3. Verifica que el archivo `.env` esté en la raíz del proyecto

### Token Inválido:
1. Obtén un nuevo token desde Calendly
2. Actualiza `CALENDLY_ACCESS_TOKEN` en tu `.env`
3. Reinicia el backend
4. Usa "Recargar Token" en el frontend

## 📝 Notas Técnicas

- El endpoint `/calendly/access-token` es seguro y solo retorna el token
- La carga automática ocurre cuando el usuario está autenticado
- El token se mantiene en el estado del componente
- Los errores se manejan silenciosamente para no interrumpir la experiencia 