<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Google OAuth Authentication with NestJS

Este proyecto es una aplicación NestJS que proporciona autenticación con Google OAuth, JWT y conexión a MongoDB.

## Características

- 🔐 **Autenticación con Google OAuth**: Integración completa con Google OAuth 2.0
- 🎫 **JWT Tokens**: Generación y validación de tokens JWT
- 🗄️ **MongoDB**: Conexión a base de datos MongoDB Atlas
- 🍪 **Cookies seguras**: Manejo de sesiones con cookies HTTP-only
- 🛡️ **Guards de autenticación**: Protección de rutas con Passport.js

## Configuración

### Variables de entorno

Crea un archivo `.env` basado en `env.example`:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/google/callback

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# MongoDB Configuration
MONGO_PASSWORD=your_mongodb_password_here
MONGO_URI=mongodb+srv://keirmauz:${MONGO_PASSWORD}@cluster0.yvdjajg.mongodb.net/Calendly

# Frontend URL (for OAuth redirects)
FRONTEND_URL=http://localhost:5173

# Server Configuration
PORT=3000
NODE_ENV=development
```

### Configuración de Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google+ 
4. Crea credenciales OAuth 2.0
5. Configura las URLs autorizadas:
   - `http://localhost:3000/auth/google/callback`
   - `http://localhost:3000/google/callback`

## Instalación

```bash
# Instalar dependencias
$ npm install

# Desarrollo
$ npm run start:dev

# Producción
$ npm run start:prod
```

## Endpoints

### Autenticación

- `GET /auth/google` - Iniciar autenticación con Google
- `GET /auth/google/callback` - Callback de Google OAuth
- `GET /google/callback` - Callback alternativo
- `GET /auth/profile` - Obtener perfil del usuario (requiere JWT)
- `GET /auth/verify` - Verificar token JWT
- `GET /auth/status` - Verificar estado de autenticación
- `POST /auth/logout` - Cerrar sesión

### Rutas públicas

- `GET /` - Página principal

## Uso

1. **Iniciar autenticación**: Navega a `http://localhost:3000/auth/google`
2. **Autenticación automática**: Google redirigirá al usuario y establecerá una cookie JWT
3. **Verificar estado**: Usa `GET /auth/status` para verificar si el usuario está autenticado
4. **Acceder a rutas protegidas**: Las rutas con `@UseGuards(AuthGuard('jwt'))` requieren autenticación

## Estructura del proyecto

```
src/
├── auth/
│   ├── auth.controller.ts    # Controlador de autenticación
│   ├── auth.service.ts       # Servicio de autenticación
│   ├── auth.module.ts        # Módulo de autenticación
│   ├── google.strategy.ts    # Estrategia de Google OAuth
│   └── jwt.strategy.ts       # Estrategia de JWT
├── app.controller.ts         # Controlador principal
├── app.service.ts           # Servicio principal
├── app.module.ts            # Módulo principal
└── main.ts                  # Punto de entrada
```

## Tecnologías utilizadas

- [NestJS](https://nestjs.com/) - Framework de Node.js
- [Passport.js](http://www.passportjs.org/) - Autenticación
- [JWT](https://jwt.io/) - Tokens de autenticación
- [MongoDB](https://www.mongodb.com/) - Base de datos
- [Mongoose](https://mongoosejs.com/) - ODM para MongoDB
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2) - Autenticación con Google

## Licencia

MIT
