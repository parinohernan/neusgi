# 🚛 Backend Neusgi - Sistema de Gestión de Flota

Backend escalable para el sistema de gestión de flota de camiones, construido con Express.js, TypeScript y Prisma ORM, siguiendo los principios SOLID.

## 🛠️ Stack Tecnológico

- **Express.js** - Framework web
- **TypeScript** - Tipado estático
- **Prisma ORM** - ORM moderno con tipado fuerte
- **Joi** - Validación de datos
- **JWT** - Autenticación
- **Helmet** - Seguridad
- **Cors** - Manejo de CORS
- **Morgan** - Logging
- **Jest** - Testing

## 📁 Estructura del Proyecto

```
src/
├── config/           # Configuraciones (DB, etc.)
├── controllers/      # Controladores (MVC)
├── middleware/       # Middlewares personalizados
├── repositories/     # Capa de acceso a datos
├── routes/          # Definición de rutas
├── services/        # Lógica de negocio
├── types/           # Tipos TypeScript
├── utils/           # Utilidades
├── app.ts           # Configuración de la app
└── index.ts         # Punto de entrada
```

## 🚀 Instalación y Configuración

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
cp env.example .env
```

Editar `.env` con tus configuraciones:
```env
DATABASE_URL="mysql://usuario:contraseña@localhost:3306/neusgi"
JWT_SECRET=tu-clave-secreta-super-segura
```

### 3. Configurar base de datos
```bash
# Generar cliente Prisma
npm run db:generate

# Ejecutar migraciones
npm run db:migrate

# (Opcional) Poblar con datos de prueba
npm run db:seed
```

### 4. Ejecutar en desarrollo
```bash
npm run dev
```

## 📊 Principios SOLID Implementados

### 1. **S** - Single Responsibility Principle (SRP)
- Cada clase tiene una única responsabilidad
- `UsuarioService` maneja solo lógica de usuarios
- `UsuarioRepository` maneja solo acceso a datos
- `UsuarioController` maneja solo HTTP requests

### 2. **O** - Open/Closed Principle (OCP)
- Interfaces base permiten extensión sin modificación
- `IBaseRepository` y `IBaseService` son extensibles
- Nuevos repositorios/servicios pueden implementar las interfaces

### 3. **L** - Liskov Substitution Principle (LSP)
- Todas las implementaciones son intercambiables
- `UsuarioRepository` puede ser reemplazado por cualquier implementación de `IBaseRepository`

### 4. **I** - Interface Segregation Principle (ISP)
- Interfaces específicas para cada necesidad
- `IBaseRepository` define operaciones básicas
- Interfaces específicas para casos especiales

### 5. **D** - Dependency Inversion Principle (DIP)
- Dependencias inyectadas en lugar de creadas
- `UsuarioService` recibe `UsuarioRepository` como dependencia
- Fácil testing y cambio de implementaciones

## 🔐 Autenticación y Autorización

### Roles de Usuario
- **admin**: Acceso completo al sistema
- **logistica**: Gestión de equipos y presupuestos
- **cliente_externo**: Acceso limitado a sus datos

## 📸 Sistema de Imágenes de Equipos

### Características
- **Múltiples imágenes** por equipo (hasta 10)
- **Imagen destacada** (solo una por equipo)
- **URLs flexibles** (locales o externas)
- **Formatos soportados**: JPG, PNG, GIF, WebP
- **Almacenamiento**: JSON string en base de datos

### Estructura de Datos
```typescript
interface EquipoImagen {
  descripcion: string;  // Descripción de la imagen
  url: string;         // URL de la imagen
  destacada: boolean;  // Solo una puede ser destacada
}
```

### Migración Aplicada
- **Archivo**: `20250729010949_add_equipo_imagenes`
- **Campo**: `imagenes` (TEXT) en tabla `equipos`
- **Formato**: JSON string con array de imágenes

### Endpoints Protegidos
```typescript
// Requiere autenticación
AuthMiddleware.verifyToken

// Requiere rol específico
AuthMiddleware.requireAdmin
AuthMiddleware.requireLogistica
AuthMiddleware.requireClienteExterno
```

## 📝 API Endpoints

### Usuarios
```
GET    /api/v1/usuarios          # Listar usuarios (logística+)
GET    /api/v1/usuarios/:id      # Obtener usuario (logística+)
POST   /api/v1/usuarios          # Crear usuario (admin)
PUT    /api/v1/usuarios/:id      # Actualizar usuario (admin)
DELETE /api/v1/usuarios/:id      # Eliminar usuario (admin)
POST   /api/v1/usuarios/:id/change-password # Cambiar contraseña
```

### Health Check
```
GET    /health                   # Estado del servidor
```

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests en modo watch
npm run test:watch
```

## 📦 Scripts Disponibles

```bash
npm run dev          # Desarrollo con nodemon
npm run build        # Compilar TypeScript
npm run start        # Producción
npm run lint         # Linting
npm run lint:fix     # Linting con auto-fix
npm run format       # Formatear código
npm run db:generate  # Generar cliente Prisma
npm run db:migrate   # Ejecutar migraciones
npm run db:studio    # Abrir Prisma Studio
```

## 🔧 Configuración de Desarrollo

### ESLint y Prettier
El proyecto incluye configuración de ESLint y Prettier para mantener consistencia en el código.

### TypeScript
Configuración estricta de TypeScript para detectar errores temprano.

### Prisma Studio
```bash
npm run db:studio
```
Abre una interfaz web para explorar y editar la base de datos.

## 🚀 Despliegue

### Producción
```bash
npm run build
npm start
```

### Variables de Entorno de Producción
```env
NODE_ENV=production
DATABASE_URL=tu-url-de-produccion
JWT_SECRET=clave-secreta-de-produccion
```

## 📈 Escalabilidad

### Características de Escalabilidad
- **Arquitectura modular**: Fácil agregar nuevos módulos
- **Dependency Injection**: Desacoplamiento de componentes
- **Interfaces**: Contratos claros entre capas
- **Validación robusta**: Prevención de errores
- **Manejo de errores centralizado**: Respuestas consistentes
- **Rate limiting**: Protección contra abuso
- **Compresión**: Optimización de rendimiento

### Próximos Pasos para Escalar
1. Implementar cache con Redis
2. Agregar logging estructurado
3. Implementar métricas con Prometheus
4. Configurar load balancing
5. Implementar circuit breakers
6. Agregar monitoreo de salud

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles. 