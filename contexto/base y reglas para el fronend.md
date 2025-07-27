# 🎨 Base y Reglas para el Frontend - NEUSGI

## 📋 Resumen Ejecutivo
Este documento define las bases arquitectónicas, reglas de diseño y especificaciones técnicas para el desarrollo del frontend del sistema NEUSGI, enfocado en la gestión logística y el flujo de proceso de ventas.

---

## 🏗️ Arquitectura del Frontend

### 🔹 **Stack Tecnológico Recomendado**
- **Framework:** React 18+ con TypeScript
- **Estado Global:** Zustand (ligero y performante)
- **Routing:** React Router v6
- **UI Components:** Tailwind CSS + Headless UI
- **Formularios:** React Hook Form + Zod
- **HTTP Client:** Axios con interceptors
- **Notificaciones:** React Hot Toast
- **Iconos:** Lucide React
- **Charts:** Recharts (para dashboards)
- **PDF Generation:** React PDF
- **Date/Time:** Day.js

### 🔹 **Estructura de Carpetas**
```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/           # Componentes base reutilizables
│   │   ├── forms/        # Formularios específicos
│   │   ├── layout/       # Componentes de layout
│   │   └── features/     # Componentes por módulo
│   ├── hooks/            # Custom hooks
│   ├── services/         # Servicios API
│   ├── stores/           # Estado global (Zustand)
│   ├── types/            # Tipos TypeScript
│   ├── utils/            # Utilidades
│   ├── pages/            # Páginas principales
│   └── routes/           # Configuración de rutas
```

---

## 🎨 Diseño y UX

### 🔹 **Principios de Diseño**
1. **Simplicidad:** Interfaces limpias y sin distracciones
2. **Agilidad:** Navegación rápida y acciones directas
3. **Reactividad:** Feedback inmediato en todas las acciones
4. **Consistencia:** Patrones de diseño uniformes
5. **Accesibilidad:** Cumplimiento WCAG 2.1

### 🔹 **Paleta de Colores**
```css
/* Colores principales */
--primary: #2563eb;      /* Azul moderno */
--primary-dark: #1d4ed8;
--secondary: #64748b;    /* Gris azulado */
--success: #10b981;      /* Verde */
--warning: #f59e0b;      /* Amarillo */
--error: #ef4444;        /* Rojo */
--info: #06b6d4;         /* Cyan */

/* Colores de fondo */
--bg-primary: #ffffff;
--bg-secondary: #f8fafc;
--bg-dark: #1e293b;

/* Colores de texto */
--text-primary: #1e293b;
--text-secondary: #64748b;
--text-muted: #94a3b8;
```

### 🔹 **Tipografía**
- **Font Family:** Inter (Google Fonts)
- **Weights:** 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
- **Sizes:** Sistema de escalas (12px, 14px, 16px, 18px, 20px, 24px, 32px)

### 🔹 **Componentes Base**
- **Botones:** Primario, secundario, outline, ghost
- **Inputs:** Text, select, date, number, textarea
- **Cards:** Con sombras sutiles y bordes redondeados
- **Modals:** Overlay con backdrop blur
- **Tables:** Responsive con sorting y pagination
- **Badges:** Para estados y etiquetas
- **Alerts:** Success, warning, error, info

---

## 🚀 Flujos de Usuario Principales

### 🔹 **1. Dashboard Principal**
**Objetivo:** Vista general del estado del negocio

#### Componentes:
- 📊 **Cards de métricas:** Presupuestos pendientes, OCs activas, facturas por cobrar
- 📈 **Gráficos:** Ventas mensuales, equipos ocupados, clientes activos
- 🔔 **Notificaciones:** Alertas importantes y tareas pendientes
- 📋 **Acciones rápidas:** Crear presupuesto, nueva OC, registrar pago

#### Diseño:
- Layout en grid responsive
- Cards con hover effects
- Colores según estado (verde=positivo, rojo=negativo, amarillo=pendiente)

### 🔹 **2. Flujo de Presupuesto**
**Objetivo:** Crear y gestionar presupuestos de manera eficiente

#### Pasos del flujo:
1. **Selección de Cliente**
   - Búsqueda rápida con autocomplete
   - Opción de crear cliente nuevo
   - Información del cliente visible

2. **Configuración del Servicio**
   - Formulario paso a paso
   - Validación en tiempo real
   - Preview del presupuesto

3. **Asignación de Equipos**
   - Vista de disponibilidad en tiempo real
   - Filtros por tipo y capacidad
   - Calendario de ocupación

4. **Revisión y Envío**
   - Resumen completo
   - PDF preview
   - Envío por email

#### Características:
- **Wizard de pasos** con indicador de progreso
- **Guardado automático** de borradores
- **Validación inteligente** con mensajes claros
- **Responsive design** para móviles

### 🔹 **3. Gestión de Órdenes de Compra**
**Objetivo:** Seguimiento completo del ciclo de vida de las OCs

#### Estados visuales:
- 🟡 **PENDIENTE:** OC recibida, pendiente de procesar
- 🔵 **EN OBRA:** Servicio en ejecución
- 🟢 **COMPLETADA:** Servicio finalizado
- 🔴 **CANCELADA:** OC cancelada

#### Funcionalidades:
- **Timeline visual** del progreso
- **Upload de documentos** con drag & drop
- **Notificaciones automáticas** por cambios de estado
- **Acciones contextuales** según el estado

### 🔹 **4. Partes Diarios**
**Objetivo:** Registro ágil de actividades diarias

#### Diseño:
- **Formulario simplificado** con campos esenciales
- **Auto-completado** de datos recurrentes
- **Validación de horarios** y distancias
- **Fotos adjuntas** con preview

#### Características:
- **Modo offline** con sincronización posterior
- **GPS integration** para ubicación automática
- **Firma digital** del conductor
- **Export a PDF** inmediato

### 🔹 **5. Facturación y Cobranza**
**Objetivo:** Gestión eficiente de la facturación y seguimiento de pagos

#### Dashboard de cobranza:
- **Tabla de facturas** con filtros avanzados
- **Indicadores de vencimiento** con colores
- **Acciones masivas** (enviar recordatorios, etc.)
- **Gráficos de cobranza** por período

#### Funcionalidades:
- **Generación automática** de facturas
- **Envío por email** con tracking
- **Registro de pagos** con múltiples medios
- **Reportes de cobranza** exportables

---

## ⚡ Performance y Optimización

### 🔹 **Estrategias de Performance**
1. **Code Splitting:** Lazy loading por rutas
2. **Memoización:** React.memo y useMemo para componentes pesados
3. **Virtualización:** Para listas largas (react-window)
4. **Caching:** React Query para datos de API
5. **Bundle Optimization:** Tree shaking y minificación

### 🔹 **Loading States**
- **Skeleton screens** para contenido que carga
- **Spinners contextuales** para acciones específicas
- **Progressive loading** de imágenes
- **Optimistic updates** para mejor UX

### 🔹 **Error Handling**
- **Error boundaries** por módulo
- **Fallback UI** para errores de red
- **Retry mechanisms** automáticos
- **User-friendly messages** en español

---

## 📱 Responsive Design

### 🔹 **Breakpoints**
```css
/* Mobile First */
--sm: 640px;   /* Tablets pequeñas */
--md: 768px;   /* Tablets */
--lg: 1024px;  /* Laptops */
--xl: 1280px;  /* Desktops */
--2xl: 1536px; /* Pantallas grandes */
```

### 🔹 **Adaptaciones por Dispositivo**
- **Mobile:** Navegación por tabs, formularios simplificados
- **Tablet:** Sidebar colapsible, layouts híbridos
- **Desktop:** Sidebar fija, múltiples columnas, shortcuts de teclado

---

## 🔐 Seguridad y Autenticación

### 🔹 **Autenticación**
- **JWT tokens** con refresh automático
- **Persistencia** en localStorage (seguro)
- **Logout automático** por inactividad
- **Roles y permisos** por módulo

### 🔹 **Validación**
- **Client-side:** React Hook Form + Zod
- **Server-side:** Validación en API
- **Sanitización:** De inputs y outputs
- **CSRF protection:** Headers de seguridad

---

## 🧪 Testing Strategy

### 🔹 **Tipos de Testing**
1. **Unit Tests:** Jest + React Testing Library
2. **Integration Tests:** Para flujos completos
3. **E2E Tests:** Cypress para casos críticos
4. **Visual Regression:** Storybook + Chromatic

### 🔹 **Cobertura Objetivo**
- **Unit Tests:** 80% de cobertura
- **Integration Tests:** Flujos principales
- **E2E Tests:** Happy paths críticos

---

## 📦 Deployment y CI/CD

### 🔹 **Build Process**
- **Vite** para desarrollo rápido
- **Webpack** para producción optimizada
- **Environment variables** por entorno
- **Bundle analysis** para optimización

### 🔹 **Deployment**
- **Docker** para containerización
- **Nginx** para servir estáticos
- **CDN** para assets
- **HTTPS** obligatorio

---

## 🎯 Próximos Pasos de Implementación

### 🔹 **Fase 1: Setup y Base (Semana 1)**
1. Configurar proyecto React + TypeScript
2. Implementar sistema de routing
3. Configurar Tailwind CSS
4. Crear componentes base
5. Implementar autenticación

### 🔹 **Fase 2: Módulos Core (Semanas 2-3)**
1. Dashboard principal
2. Gestión de clientes
3. Gestión de equipos
4. Sistema de presupuestos

### 🔹 **Fase 3: Flujo de Ventas (Semanas 4-5)**
1. Órdenes de compra
2. Partes diarios
3. Remitos
4. Facturación

### 🔹 **Fase 4: Optimización (Semana 6)**
1. Performance optimization
2. Testing
3. Documentación
4. Deployment

---

## 📚 Recursos y Referencias

### 🔹 **Librerías Recomendadas**
- [React Hook Form](https://react-hook-form.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/)
- [React Hot Toast](https://react-hot-toast.com/)

### 🔹 **Patrones de Diseño**
- **Atomic Design:** Para organización de componentes
- **Container/Presentational:** Para separación de lógica
- **Custom Hooks:** Para lógica reutilizable
- **Render Props:** Para componentes flexibles

---

*📅 Última actualización: [Fecha actual]*
*👨‍💻 Desarrollado para: NEUSGI - Sistema de Gestión Logística*
*🎨 Diseño: Moderno, Simple y Reactivo*
