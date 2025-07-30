const fs = require('fs');
const path = require('path');

// Lista de archivos a actualizar
const files = [
  'src/repositories/CertificadoRepository.ts',
  'src/repositories/CuentaCorrienteRepository.ts',
  'src/repositories/FacturaRepository.ts',
  'src/repositories/OrdenCompraRepository.ts',
  'src/repositories/PagoRepository.ts',
  'src/repositories/ParteDiarioRepository.ts',
  'src/repositories/RemitoRepository.ts'
];

// Función para procesar un archivo
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Cambio 1: Reemplazar 'equipo: {' por 'equipos: { include: { equipo: {'
    const equipoIncludePattern = /equipo:\s*{/g;
    if (equipoIncludePattern.test(content)) {
      content = content.replace(equipoIncludePattern, 'equipos: {\n            include: {\n              equipo: {');
      modified = true;
    }
    
    // Cambio 2: Reemplazar 'equipo: true,' por 'equipos: { include: { equipo: true } },'
    const equipoTruePattern = /equipo:\s*true,/g;
    if (equipoTruePattern.test(content)) {
      content = content.replace(equipoTruePattern, 'equipos: {\n              include: {\n                equipo: true\n              }\n            },');
      modified = true;
    }
    
    // Cambio 3: Reemplazar 'equipoId: id,' por 'equipos: { some: { equipoId: id } }'
    const equipoIdPattern = /equipoId:\s*id,/g;
    if (equipoIdPattern.test(content)) {
      content = content.replace(equipoIdPattern, 'equipos: {\n        some: {\n          equipoId: id\n        }\n      }');
      modified = true;
    }
    
    // Cambio 4: Reemplazar 'equipoId,' por 'equipos: { some: { equipoId } }'
    const equipoIdOnlyPattern = /equipoId,/g;
    if (equipoIdOnlyPattern.test(content)) {
      content = content.replace(equipoIdOnlyPattern, 'equipos: {\n        some: {\n          equipoId\n        }\n      }');
      modified = true;
    }
    
    // Cambio 5: Reemplazar 'equipoId: data.equipoId,' por 'equipos: { create: data.equipoIds?.map(equipoId => ({ equipoId })) || [] }'
    const equipoIdDataPattern = /equipoId:\s*data\.equipoId,/g;
    if (equipoIdDataPattern.test(content)) {
      content = content.replace(equipoIdDataPattern, 'equipos: {\n        create: data.equipoIds?.map(equipoId => ({ equipoId })) || []\n      }');
      modified = true;
    }
    
    // Cambio 6: Reemplazar 'equipoId: presupuestoExistente.equipoId' por 'equipos: { some: { equipoId: presupuestoExistente.equipos?.[0]?.equipoId } }'
    const equipoIdPresupuestoPattern = /equipoId:\s*presupuestoExistente\.equipoId/g;
    if (equipoIdPresupuestoPattern.test(content)) {
      content = content.replace(equipoIdPresupuestoPattern, 'equipos: {\n        some: {\n          equipoId: presupuestoExistente.equipos?.[0]?.equipoId\n        }\n      }');
      modified = true;
    }
    
    // Cambio 7: Reemplazar 'equipoId: filters.equipoId' por 'equipos: { some: { equipoId: filters.equipoId } }'
    const equipoIdFiltersPattern = /equipoId:\s*filters\.equipoId/g;
    if (equipoIdFiltersPattern.test(content)) {
      content = content.replace(equipoIdFiltersPattern, 'equipos: {\n        some: {\n          equipoId: filters.equipoId\n        }\n      }');
      modified = true;
    }
    
    // Cambio 8: Reemplazar 'equipoId: parseInt(equipoId as string)' por 'equipos: { some: { equipoId: parseInt(equipoId as string) } }'
    const equipoIdParseIntPattern = /equipoId:\s*parseInt\(equipoId as string\)/g;
    if (equipoIdParseIntPattern.test(content)) {
      content = content.replace(equipoIdParseIntPattern, 'equipos: {\n        some: {\n          equipoId: parseInt(equipoId as string)\n        }\n      }');
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Actualizado: ${filePath}`);
    } else {
      console.log(`⏭️  Sin cambios: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
  }
}

// Procesar todos los archivos
console.log('🔧 Actualizando repositorios...\n');

files.forEach(file => {
  if (fs.existsSync(file)) {
    processFile(file);
  } else {
    console.log(`⚠️  Archivo no encontrado: ${file}`);
  }
});

console.log('\n✅ Proceso completado!'); 