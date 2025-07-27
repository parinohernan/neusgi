import dotenv from 'dotenv';
import { App } from './app';

// Cargar variables de entorno
dotenv.config();

// Configuración del puerto
const PORT = parseInt(process.env['PORT'] || '3000', 10);

// Crear e iniciar la aplicación
const app = new App(PORT);

// Manejar señales de terminación
process.on('SIGINT', async () => {
  console.log('\n🛑 Recibida señal SIGINT, cerrando servidor...');
  await app.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Recibida señal SIGTERM, cerrando servidor...');
  await app.stop();
  process.exit(0);
});

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
  process.exit(1);
});

// Iniciar la aplicación
app.start().catch((error) => {
  console.error('❌ Error fatal iniciando la aplicación:', error);
  process.exit(1);
}); 