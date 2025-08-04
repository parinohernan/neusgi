const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testIniciarActividad() {
  try {
    console.log('🔍 Buscando presupuestos aceptados...');
    
    const presupuestosAceptados = await prisma.presupuesto.findMany({
      where: {
        estado: 'aceptado'
      },
      include: {
        ordenCompra: true,
        equipos: {
          include: {
            equipo: true
          }
        }
      }
    });

    console.log(`📊 Encontrados ${presupuestosAceptados.length} presupuestos aceptados:`);
    
    presupuestosAceptados.forEach(p => {
      console.log(`- Presupuesto #${p.id}:`);
      console.log(`  Estado: ${p.estado}`);
      console.log(`  Tiene orden de compra: ${p.ordenCompra ? 'SÍ' : 'NO'}`);
      console.log(`  Equipos: ${p.equipos.length}`);
      p.equipos.forEach(pe => {
        console.log(`    - Equipo ${pe.equipo.patente}: ${pe.equipo.estado}`);
      });
    });

    if (presupuestosAceptados.length === 0) {
      console.log('❌ No hay presupuestos aceptados para probar');
      return;
    }

    const presupuestoConOC = presupuestosAceptados.find(p => p.ordenCompra);
    
    if (!presupuestoConOC) {
      console.log('❌ No hay presupuestos aceptados con orden de compra');
      return;
    }

    console.log(`\n✅ Presupuesto #${presupuestoConOC.id} seleccionado para prueba`);
    console.log(`📋 Orden de compra #${presupuestoConOC.ordenCompra.id}`);
    
    // Verificar que los equipos estén disponibles
    const equiposDisponibles = presupuestoConOC.equipos.every(pe => pe.equipo.estado === 'disponible');
    
    if (!equiposDisponibles) {
      console.log('❌ No todos los equipos están disponibles');
      presupuestoConOC.equipos.forEach(pe => {
        console.log(`  - Equipo ${pe.equipo.patente}: ${pe.equipo.estado}`);
      });
      return;
    }

    console.log('✅ Todos los equipos están disponibles');
    console.log('🎯 El presupuesto está listo para iniciar actividad');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testIniciarActividad(); 