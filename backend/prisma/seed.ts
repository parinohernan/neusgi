import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear o verificar empresa
  const existingEmpresa = await prisma.empresa.findFirst({
    where: {
      nombre: 'NeusGroup'
    }
  });

  if (!existingEmpresa) {
    const empresa = await prisma.empresa.create({
      data: {
        nombre: 'NeusGroup',
        cuit: '20000000002',
        ciudad: 'Rincon de los Sauces',
        direccion: 'San Martin 213',
        telefono: '+54 299 123-4567',
        email: 'info@neusgroup.com',
        web: 'www.neusgroup.com'
      }
    });
    console.log('✅ Empresa creada:', empresa.nombre);
  } else {
    console.log('✅ Empresa ya existe:', existingEmpresa.nombre);
  }

  // Verificar si ya existe un usuario administrador
  const existingAdmin = await prisma.usuario.findFirst({
    where: {
      email: 'admin@neusgi.com'
    }
  });

  if (existingAdmin) {
    console.log('✅ Usuario administrador ya existe');
    return;
  }

  // Crear usuario administrador
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.usuario.create({
    data: {
      nombre: 'Administrador',
      email: 'admin@neusgi.com',
      passwordHash: hashedPassword,
      rol: 'admin'
    }
  });

  console.log('✅ Usuario administrador creado:', {
    id: adminUser.id,
    nombre: adminUser.nombre,
    email: adminUser.email,
    rol: adminUser.rol
  });

  // Crear algunos clientes de ejemplo
  const clientes = [
    {
      nombreEmpresa: 'Constructora ABC S.A.',
      rutCuit: '20-12345678-9',
      direccion: 'Av. San Martín 1234, Buenos Aires',
      telefono: '+54 11 1234-5678',
      email: 'contacto@constructoraabc.com'
    },
    {
      nombreEmpresa: 'Transportes XYZ Ltda.',
      rutCuit: '30-98765432-1',
      direccion: 'Ruta 9 Km 45, Córdoba',
      telefono: '+54 351 987-6543',
      email: 'info@transportesxyz.com'
    },
    {
      nombreEmpresa: 'Logística Rápida S.R.L.',
      rutCuit: '30-45678912-3',
      direccion: 'Zona Industrial 789, Rosario',
      telefono: '+54 341 456-7890',
      email: 'ventas@logisticarapida.com'
    }
  ];

  for (const clienteData of clientes) {
    const existingCliente = await prisma.cliente.findUnique({
      where: { rutCuit: clienteData.rutCuit }
    });

    if (!existingCliente) {
      const cliente = await prisma.cliente.create({
        data: clienteData
      });
      console.log('✅ Cliente creado:', cliente.nombreEmpresa);
    }
  }

  // Crear categorías por defecto
  const categorias = [
    { nombre: 'Batea', descripcion: 'Equipos tipo batea para transporte de materiales' },
    { nombre: 'Volcador', descripcion: 'Equipos tipo volcador para descarga de materiales' },
    { nombre: 'Regador', descripcion: 'Equipos tipo regador para riego y limpieza' },
  ];

  for (const categoriaData of categorias) {
    const existingCategoria = await prisma.categoria.findUnique({
      where: { nombre: categoriaData.nombre }
    });

    if (!existingCategoria) {
      const categoria = await prisma.categoria.create({
        data: categoriaData
      });
      console.log('✅ Categoría creada:', categoria.nombre);
    }
  }

  // Crear tipos de empleado por defecto
  const tiposEmpleado = [
    { nombre: 'Conductor', descripcion: 'Operadores de equipos y vehículos' },
    { nombre: 'Mecánico', descripcion: 'Personal de mantenimiento y reparación' },
    { nombre: 'Administración', descripcion: 'Personal administrativo' },
    { nombre: 'Supervisor', descripcion: 'Supervisores de obra y equipos' },
    { nombre: 'Otros', descripcion: 'Otros tipos de empleados' },
  ];

  for (const tipoData of tiposEmpleado) {
    const existingTipo = await prisma.tipoEmpleado.findUnique({
      where: { nombre: tipoData.nombre }
    });

    if (!existingTipo) {
      const tipo = await prisma.tipoEmpleado.create({
        data: tipoData
      });
      console.log('✅ Tipo de empleado creado:', tipo.nombre);
    }
  }

  // Crear algunos equipos de ejemplo
  const equipos = [
    {
      patente: 'ABC123',
      modelo: 'Mercedes-Benz Actros 1844',
      categoriaId: 1, // Batea
      capacidadKg: 18000.00,
      estado: 'disponible' as const
    },
    {
      patente: 'XYZ789',
      modelo: 'Scania R420',
      categoriaId: 2, // Volcador
      capacidadKg: 20000.00,
      estado: 'disponible' as const
    },
    {
      patente: 'DEF456',
      modelo: 'Volvo FH16 750',
      categoriaId: 1, // Batea
      capacidadKg: 25000.00,
      estado: 'disponible' as const
    }
  ];

  for (const equipoData of equipos) {
    const existingEquipo = await prisma.equipo.findUnique({
      where: { patente: equipoData.patente }
    });

    if (!existingEquipo) {
      const equipo = await prisma.equipo.create({
        data: equipoData
      });
      console.log('✅ Equipo creado:', equipo.patente);
    }
  }

  console.log('🎉 Seed completado exitosamente!');
  console.log('');
  console.log('📋 Credenciales de acceso:');
  console.log('   Email: admin@neusgi.com');
  console.log('   Contraseña: admin123');
  console.log('');
  console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer login');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 