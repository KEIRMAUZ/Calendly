#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Configuración de Integración Real con Calendly');
console.log('================================================\n');

console.log('📋 Pasos para obtener tu Access Token:');
console.log('1. Ve a: https://calendly.com/app/admin/integrations/api_keys');
console.log('2. Haz clic en "Create API Key"');
console.log('3. Dale un nombre como "Mi Aplicación de Eventos"');
console.log('4. Selecciona los permisos: Read Event Types, Read Scheduled Events, Create Scheduling Links');
console.log('5. Copia el Access Token generado\n');

rl.question('🔑 Ingresa tu Access Token de Calendly (empieza con "cal_"): ', (token) => {
  if (!token.trim()) {
    console.log('❌ No se ingresó ningún token');
    rl.close();
    return;
  }

  if (!token.startsWith('cal_')) {
    console.log('⚠️  El token debe empezar con "cal_". Verifica que sea correcto.');
    rl.close();
    return;
  }

  // Leer el archivo .env actual
  const envPath = path.join(__dirname, '.env');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // Verificar si ya existe CALENDLY_ACCESS_TOKEN
  if (envContent.includes('CALENDLY_ACCESS_TOKEN=')) {
    // Actualizar el token existente
    envContent = envContent.replace(
      /CALENDLY_ACCESS_TOKEN=.*/,
      `CALENDLY_ACCESS_TOKEN=${token.trim()}`
    );
  } else {
    // Agregar el token al final del archivo
    envContent += `\n# Calendly Real Configuration\nCALENDLY_ACCESS_TOKEN=${token.trim()}\n`;
  }

  // Escribir el archivo .env
  fs.writeFileSync(envPath, envContent);

  console.log('✅ Token de Calendly configurado exitosamente!');
  console.log('📁 Archivo .env actualizado');
  console.log('\n🔄 Para aplicar los cambios:');
  console.log('1. Reinicia el servidor backend: npm run start:dev');
  console.log('2. Ve al frontend y haz clic en "🔧 Estado de Calendly"');
  console.log('3. Deberías ver "Conexión a Calendly: Disponible"');
  console.log('\n🎯 Ahora tendrás una integración 100% real con Calendly!');

  rl.close();
});

rl.on('close', () => {
  console.log('\n👋 ¡Configuración completada!');
  process.exit(0);
}); 