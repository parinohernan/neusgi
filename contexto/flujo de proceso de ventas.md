# 🚛 Flujo del Proceso de Venta - NEUSGI

## 📋 Resumen Ejecutivo
Este documento describe el flujo completo del proceso de venta desde la creación del presupuesto hasta el cierre de la cuenta corriente, siguiendo las mejores prácticas del sector logístico.

---

## 🔄 Flujo Detallado del Proceso

### 🔹 **FASE 1: Creación del Presupuesto**
**🎯 Objetivo:** Establecer la propuesta comercial inicial

#### Acciones a realizar:
- ✅ **Cliente:** Seleccionar cliente existente o crear nuevo
- 🚛 **Equipos:** Asignar camión(es) según disponibilidad
- 📝 **Servicio:** Definir descripción detallada del servicio
  - Origen y destino
  - Fechas de ejecución
  - Costos desglosados
  - Condiciones especiales
- 📊 **Estado:** Presupuesto → **PENDIENTE**

#### Entidades involucradas:
- `presupuestos` (nuevo registro)
- `clientes` (existente o nuevo)
- `equipos` (verificación de disponibilidad)

---

### 🔹 **FASE 2: Aprobación del Cliente → Orden de Compra (OC)**
**🎯 Objetivo:** Confirmar la ejecución del servicio

#### Acciones a realizar:
- 📄 **Recepción:** Cliente envía OC (física/foto/email)
- 📁 **Registro:** Crear entrada en `ordenes_compra`
  - ID del presupuesto asociado
  - Fecha de aprobación
  - Archivo adjunto (OC escaneada)
  - Detalles de la orden
- 🔄 **Cambios de Estado:**
  - Presupuesto → **EN OBRA**
  - Equipo asignado → **OCUPADO**

#### Entidades involucradas:
- `ordenes_compra` (nuevo registro)
- `presupuestos` (actualización de estado)
- `equipos` (actualización de estado)

---

### 🔹 **FASE 3: Ejecución del Servicio ("EN OBRA")**
**🎯 Objetivo:** Gestionar la ejecución del servicio

#### Acciones habilitadas:

##### 📊 **Partes Diarios**
- Registro diario de actividades
- Campos: km recorridos, horas trabajadas, incidencias
- Asociación automática a la OC activa
- Validación de datos en tiempo real

##### 📋 **Remitos**
- Generación automática de PDF
- Detalles del viaje y servicios realizados
- Numeración secuencial
- Archivo adjunto para descarga

#### Entidades involucradas:
- `partes_diario` (registros diarios)
- `remitos` (documentos de entrega)
- `ordenes_compra` (seguimiento de progreso)

---

### 🔹 **FASE 4: Cierre del Servicio**
**🎯 Objetivo:** Finalizar la ejecución del servicio

#### Requisitos para el cierre:
- ✅ Todos los partes diarios cargados
- ✅ Todos los remitos generados
- 📜 **Certificado de Servicio** generado
  - PDF con firmas digitales
  - Resumen ejecutivo del servicio
  - Evidencia de cumplimiento

#### Cambios de Estado:
- Presupuesto → **CERRADO**
- Equipo → **DISPONIBLE**
- OC → **COMPLETADA**

#### Entidades involucradas:
- `certificados` (nuevo registro)
- `presupuestos` (actualización final)
- `equipos` (liberación)
- `ordenes_compra` (cierre)

---

### 🔹 **FASE 5: Facturación y Cuenta Corriente**
**🎯 Objetivo:** Gestionar la cobranza del servicio

#### Generación de Factura:
- 🧾 **Creación automática** al cerrar la OC
- 📊 **Campos principales:**
  - ID de la OC asociada
  - Monto total del servicio
  - Fecha de emisión
  - Fecha de pago (inicialmente NULL)
  - Condiciones de pago

#### Seguimiento:
- 📋 **Facturas Pendientes:** Filtro `fecha_pago IS NULL`
- 💰 **Cuenta Corriente:** Historial completo de facturas y pagos
- 📈 **Reportes:** Estado de cobranza por cliente

#### Entidades involucradas:
- `facturas` (nuevo registro)
- `cuenta_corriente` (seguimiento de pagos)

---

### 🔹 **FASE 6: Recepción de Pago**
**🎯 Objetivo:** Registrar y procesar los pagos recibidos

#### Tipos de Pago Soportados:
- 💵 **Efectivo**
- 🏦 **Transferencias bancarias**
- 💳 **Tarjetas de crédito/débito**
- 📄 **Cheques**
- 🏛️ **Otros medios de pago**

#### Acciones a realizar:
- 📝 **Registro del pago** en `pagos`
- 💰 **Actualización de cuenta corriente**
- 📊 **Actualización del saldo impago** de la factura
- ✅ **Cierre de factura** si el pago es completo

#### Entidades involucradas:
- `pagos` (nuevo registro)
- `facturas` (actualización de saldo)
- `cuenta_corriente` (actualización)

---

## 📊 Estados del Sistema

### 📋 **Estados de Presupuesto:**
- 🔄 `PENDIENTE` - Esperando aprobación del cliente
- 🚧 `EN OBRA` - Servicio en ejecución
- ✅ `CERRADO` - Servicio completado
- ❌ `CANCELADO` - Presupuesto cancelado

### 🚛 **Estados de Equipo:**
- ✅ `DISPONIBLE` - Listo para asignar
- 🚧 `OCUPADO` - En servicio
- 🔧 `MANTENIMIENTO` - En reparación

### 📄 **Estados de Orden de Compra:**
- 🚧 `ACTIVA` - En ejecución
- ✅ `COMPLETADA` - Servicio finalizado
- ❌ `CANCELADA` - Orden cancelada

### 🧾 **Estados de Factura:**
- ⏳ `PENDIENTE` - Sin pago
- 💰 `PAGADA` - Pago completo
- ❌ `CANCELADA` - Factura anulada

---

## 🔍 Análisis de Entidades Faltantes

Basado en el flujo descrito, necesitamos implementar los siguientes módulos:

### ❌ **Módulos Pendientes:**
1. **Órdenes de Compra** - Gestión de órdenes de trabajo
2. **Partes Diarios** - Registro de actividades diarias
3. **Remitos** - Gestión de remitos de entrega
4. **Certificados** - Gestión de certificados de servicio
5. **Facturas** - Sistema de facturación
6. **Pagos** - Gestión de pagos recibidos
7. **Cuenta Corriente** - Seguimiento de saldos por cliente

### ✅ **Módulos Implementados:**
- ✅ **Usuarios** - Gestión de usuarios y autenticación
- ✅ **Equipos** - Gestión de flota de equipos
- ✅ **Clientes** - Gestión de clientes
- ✅ **Presupuestos** - Gestión de presupuestos

---

## 🎯 Próximos Pasos Recomendados

1. **Implementar Órdenes de Compra** (prioridad alta)
2. **Implementar Partes Diarios** (prioridad alta)
3. **Implementar Remitos** (prioridad media)
4. **Implementar Facturas** (prioridad alta)
5. **Implementar Pagos** (prioridad alta)
6. **Implementar Certificados** (prioridad media)
7. **Implementar Cuenta Corriente** (prioridad alta)

---

*📅 Última actualización: [Fecha actual]*
*👨‍💻 Desarrollado para: NEUSGI - Sistema de Gestión Logística*
