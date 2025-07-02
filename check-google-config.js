// Script para verificar la configuración de Google OAuth
require('dotenv').config();

console.log('🔍 Verificando configuración de Google OAuth...\n');

// Verificar variables de entorno
const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const callbackURL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/google/callback';
const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';

console.log('📋 Variables de Entorno:');
console.log('   GOOGLE_CLIENT_ID:', clientID ? '✅ Configurado' : '❌ No configurado');
console.log('   GOOGLE_CLIENT_SECRET:', clientSecret ? '✅ Configurado' : '❌ No configurado');
console.log('   GOOGLE_CALLBACK_URL:', callbackURL);
console.log('   FRONTEND_URL:', frontendURL);
console.log('');

// Verificar formato de las credenciales
if (clientID) {
  console.log('🔑 Formato del Client ID:');
  console.log('   Longitud:', clientID.length, 'caracteres');
  console.log('   Formato:', clientID.includes('.apps.googleusercontent.com') ? '✅ Correcto' : '❌ Incorrecto');
  console.log('   Ejemplo esperado: xxxxxx.apps.googleusercontent.com');
  console.log('');
}

if (clientSecret) {
  console.log('🔐 Formato del Client Secret:');
  console.log('   Longitud:', clientSecret.length, 'caracteres');
  console.log('   Formato:', clientSecret.length >= 20 ? '✅ Parece correcto' : '❌ Muy corto');
  console.log('');
}

// Instrucciones para Google Console
console.log('🌐 Configuración en Google Console:');
console.log('   1. Ve a https://console.cloud.google.com/');
console.log('   2. Selecciona tu proyecto');
console.log('   3. Ve a "APIs & Services" → "Credentials"');
console.log('   4. Edita tu OAuth 2.0 Client ID');
console.log('   5. En "Authorized redirect URIs" agrega:');
console.log(`      ${callbackURL}`);
console.log('   6. En "Authorized JavaScript origins" agrega:');
console.log('      http://localhost:3000');
console.log('      http://localhost:5173');
console.log('      http://127.0.0.1:3000');
console.log('      http://127.0.0.1:5173');
console.log('');

// Verificar URLs
console.log('🔗 URLs Importantes:');
console.log('   Backend:', 'http://localhost:3000');
console.log('   Frontend:', frontendURL);
console.log('   Google Auth:', 'http://localhost:3000/auth/google');
console.log('   Google Callback:', callbackURL);
console.log('');

// Checklist
console.log('✅ Checklist de Configuración:');
console.log('   [ ] Variables de entorno configuradas');
console.log('   [ ] Google Console configurado');
console.log('   [ ] URLs de redirección coinciden');
console.log('   [ ] Backend corriendo en puerto 3000');
console.log('   [ ] Frontend corriendo en puerto 5173');
console.log('');

if (!clientID || !clientSecret) {
  console.log('❌ ERROR: Faltan credenciales de Google');
  console.log('   Crea un archivo .env en la carpeta Calendly con:');
  console.log('   GOOGLE_CLIENT_ID=tu_client_id_aqui');
  console.log('   GOOGLE_CLIENT_SECRET=tu_client_secret_aqui');
  console.log('   GOOGLE_CALLBACK_URL=' + callbackURL);
} else {
  console.log('✅ Configuración básica correcta');
  console.log('   Verifica que las URLs en Google Console coincidan exactamente');
} 