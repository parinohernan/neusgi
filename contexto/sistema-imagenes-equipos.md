# 📸 Sistema de Imágenes de Equipos - NEUSGI

## 🎯 **Descripción General**

El sistema de imágenes de equipos permite gestionar múltiples imágenes por equipo, facilitando la documentación visual y el seguimiento del estado de los vehículos de la flota.

## 🏗️ **Arquitectura del Sistema**

### **Base de Datos**
- **Tabla**: `equipos`
- **Campo**: `imagenes` (TEXT)
- **Formato**: JSON string con array de objetos
- **Migración**: `20250729010949_add_equipo_imagenes`

### **Estructura de Datos**
```typescript
interface EquipoImagen {
  descripcion: string;  // Descripción de la imagen
  url: string;         // URL de la imagen (local o externa)
  destacada: boolean;  // Solo una imagen puede ser destacada
}
```

## 🔧 **Componentes Frontend**

### **ImageGallery.tsx**
**Propósito**: Visualización de imágenes con galería interactiva

**Características:**
- ✅ Imagen destacada como principal
- ✅ Modal de vista ampliada
- ✅ Navegación entre imágenes
- ✅ Modo editable (eliminar, destacar)
- ✅ Responsive design

**Props:**
```typescript
interface ImageGalleryProps {
  imagenes: EquipoImagen[];
  onImageUpdate?: (imagenes: EquipoImagen[]) => void;
  editable?: boolean;
  maxImages?: number;
}
```

### **ImageUploader.tsx**
**Propósito**: Gestión completa de imágenes

**Características:**
- ✅ Formulario para agregar nuevas imágenes
- ✅ Vista previa de imágenes existentes
- ✅ Control de imagen destacada
- ✅ Validación de URLs
- ✅ Límite configurable de imágenes

**Props:**
```typescript
interface ImageUploaderProps {
  imagenes: EquipoImagen[];
  onImagesChange: (imagenes: EquipoImagen[]) => void;
  maxImages?: number;
}
```

## 📋 **Reglas del Sistema**

### **Límites y Restricciones**
- **Máximo 10 imágenes** por equipo
- **Una sola imagen destacada** por equipo
- **URLs requeridas** para cada imagen
- **Descripción obligatoria** para cada imagen

### **Formatos Soportados**
- ✅ **JPG/JPEG**: Imágenes comprimidas
- ✅ **PNG**: Imágenes con transparencia
- ✅ **GIF**: Imágenes animadas
- ✅ **WebP**: Formato moderno optimizado

### **Tipos de URLs**
- ✅ **URLs externas**: `https://ejemplo.com/imagen.jpg`
- ✅ **URLs locales**: `/uploads/equipos/imagen.jpg`
- ✅ **URLs relativas**: `./assets/imagen.jpg`

## 🎨 **Interfaz de Usuario**

### **Galería de Imágenes**
```
┌─────────────────────────────────────┐
│  [Imagen Destacada - Vista Grande]  │
│  Descripción: Vista frontal         │
│  [Destacada] [Eliminar]             │
└─────────────────────────────────────┘

┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│ [1] │ │ [2] │ │ [3] │ │ [+] │
│     │ │     │ │     │ │     │
└─────┘ └─────┘ └─────┘ └─────┘
```

### **Modal de Vista Ampliada**
```
┌─────────────────────────────────────┐
│ [×]                    [←] [→]      │
│                                     │
│        [Imagen Ampliada]            │
│                                     │
│  Descripción: Vista frontal         │
│  [Destacada] 1 de 3                 │
└─────────────────────────────────────┘
```

### **Formulario de Agregar Imagen**
```
┌─────────────────────────────────────┐
│ Nueva imagen                        │
│                                     │
│ Descripción: [Vista frontal    ]    │
│ URL:        [https://...       ]    │
│                                     │
│ [Agregar] [Cancelar]                │
└─────────────────────────────────────┘
```

## 🔄 **Flujo de Trabajo**

### **1. Crear Equipo con Imágenes**
1. Usuario llena formulario de nuevo equipo
2. Agrega imágenes usando `ImageUploader`
3. Marca una imagen como destacada
4. Guarda equipo con imágenes incluidas

### **2. Editar Imágenes de Equipo**
1. Usuario accede a página de edición
2. Ve imágenes existentes en `ImageGallery`
3. Agrega/elimina imágenes con `ImageUploader`
4. Cambia imagen destacada si es necesario
5. Guarda cambios

### **3. Visualizar Galería**
1. Usuario hace clic en imagen
2. Se abre modal con vista ampliada
3. Navega entre imágenes con flechas
4. Ve información de cada imagen

## 🛠️ **Implementación Técnica**

### **Backend (Node.js + Prisma)**
```typescript
// Repositorio
private convertPrismaEquipo(prismaEquipo: any): Equipo {
  let imagenes: EquipoImagen[] = [];
  
  if (prismaEquipo.imagenes) {
    try {
      imagenes = JSON.parse(prismaEquipo.imagenes);
    } catch (error) {
      console.warn('Error parsing imagenes JSON:', error);
      imagenes = [];
    }
  }

  return {
    ...prismaEquipo,
    imagenes,
  };
}
```

### **Frontend (React + TypeScript)**
```typescript
// Hook para gestionar imágenes
const [imagenes, setImagenes] = useState<EquipoImagen[]>([]);

// Función para agregar imagen
const addImage = (nuevaImagen: EquipoImagen) => {
  const nuevasImagenes = [...imagenes, nuevaImagen];
  setImagenes(nuevasImagenes);
};
```

## 📊 **Estados y Validaciones**

### **Estados de Imagen**
- ✅ **Válida**: URL accesible, formato correcto
- ⚠️ **Cargando**: Imagen en proceso de carga
- ❌ **Error**: URL inválida o imagen no encontrada

### **Validaciones**
- ✅ **URL requerida**: No puede estar vacía
- ✅ **Formato válido**: Debe ser URL válida
- ✅ **Descripción requerida**: No puede estar vacía
- ✅ **Límite de imágenes**: Máximo 10 por equipo
- ✅ **Una destacada**: Solo una imagen puede ser destacada

## 🎯 **Casos de Uso**

### **Caso 1: Documentación de Equipo Nuevo**
1. **Contexto**: Se adquiere un nuevo camión
2. **Acción**: Se toman fotos del vehículo
3. **Proceso**: Se suben al sistema con descripciones
4. **Resultado**: Equipo documentado visualmente

### **Caso 2: Seguimiento de Mantenimiento**
1. **Contexto**: Equipo en mantenimiento
2. **Acción**: Se toman fotos del estado actual
3. **Proceso**: Se agregan a la galería existente
4. **Resultado**: Historial visual del mantenimiento

### **Caso 3: Presentación a Clientes**
1. **Contexto**: Cliente solicita ver equipos disponibles
2. **Acción**: Se muestran galerías de equipos
3. **Proceso**: Cliente navega por imágenes
4. **Resultado**: Mejor experiencia de selección

## 🚀 **Beneficios del Sistema**

### **Para la Empresa**
- ✅ **Documentación visual** completa de la flota
- ✅ **Historial de mantenimiento** con imágenes
- ✅ **Presentación profesional** a clientes
- ✅ **Control de calidad** visual de equipos

### **Para los Usuarios**
- ✅ **Interfaz intuitiva** para gestionar imágenes
- ✅ **Vista ampliada** para detalles
- ✅ **Navegación fácil** entre imágenes
- ✅ **Validación automática** de datos

### **Para el Sistema**
- ✅ **Escalabilidad** (hasta 10 imágenes por equipo)
- ✅ **Flexibilidad** (URLs locales o externas)
- ✅ **Integración** completa con CRUD de equipos
- ✅ **Performance** optimizada

## 📈 **Métricas de Implementación**

### **Archivos Creados/Modificados**
- ✅ **2 componentes UI** nuevos
- ✅ **2 páginas** actualizadas
- ✅ **1 migración** de base de datos
- ✅ **3 archivos de tipos** actualizados
- ✅ **1 repositorio** actualizado

### **Funcionalidades Implementadas**
- ✅ **Galería visual** con imagen destacada
- ✅ **Gestión completa** de imágenes
- ✅ **Modal de vista ampliada**
- ✅ **Validación** de URLs y datos
- ✅ **Responsive design**
- ✅ **Accesibilidad** básica

---

*📅 Documentación creada: Julio 2024*
*👨‍💻 Sistema: NEUSGI - Gestión de Flota*
*🎯 Funcionalidad: Sistema de Imágenes de Equipos*
*🚀 Estado: Completamente implementado y funcional* 