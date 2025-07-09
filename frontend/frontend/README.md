# Frontend - Aplicación de Autenticación

Este es el frontend de la aplicación de autenticación construido con React, Vite y Tailwind CSS.

## Características

- 🔐 **Autenticación con Google OAuth**
- 🎫 **Gestión de tokens JWT**
- 🍪 **Cookies seguras para sesiones**
- 📱 **Diseño responsivo**
- ⚡ **Desarrollo rápido con Vite**
- 🎨 **Estilos con Tailwind CSS**

## Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de producción
npm run preview
```

## Configuración

El frontend está configurado para conectarse al backend en `http://localhost:3000` a través de un proxy configurado en Vite.

### Variables de entorno

No se requieren variables de entorno adicionales ya que el proxy maneja la conexión al backend.

## Estructura del proyecto

```
src/
├── components/
│   ├── Header.jsx      # Componente de navegación
│   ├── Home.jsx        # Página principal
│   └── Profile.jsx     # Página de perfil
├── hooks/
│   └── useAuth.js      # Hook para autenticación
├── services/
│   └── api.js          # Servicios de API
├── App.jsx             # Componente principal
├── main.jsx           # Punto de entrada
└── index.css          # Estilos globales
```

## Uso

1. **Iniciar sesión**: Haz clic en "Iniciar con Google" en el header
2. **Ver perfil**: Una vez autenticado, puedes acceder a tu perfil
3. **Cerrar sesión**: Usa el botón "Cerrar Sesión" en el header

## Tecnologías utilizadas

- [React](https://reactjs.org/) - Biblioteca de UI
- [Vite](https://vitejs.dev/) - Herramienta de construcción
- [Tailwind CSS](https://tailwindcss.com/) - Framework de CSS
- [Axios](https://axios-http.com/) - Cliente HTTP
- [Google OAuth](https://developers.google.com/identity/protocols/oauth2) - Autenticación

## Desarrollo

El proyecto incluye:

- **Hot Module Replacement (HMR)** para desarrollo rápido
- **Proxy configurado** para conectar con el backend
- **Tailwind CSS** para estilos modernos
- **ESLint** para linting de código
- **TypeScript** para tipado (opcional)

## Scripts disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Vista previa de la build de producción
- `npm run lint` - Ejecuta ESLint

## Conexión con el backend

El frontend se conecta al backend a través de un proxy configurado en `vite.config.js`. Todas las llamadas a `/api/*` se redirigen automáticamente a `http://localhost:3000`.

## Endpoints utilizados

- `GET /api/auth/status` - Verificar estado de autenticación
- `GET /api/auth/profile` - Obtener perfil del usuario
- `GET /api/auth/verify` - Verificar token JWT
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/google` - Iniciar autenticación con Google
