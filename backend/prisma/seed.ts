import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

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

  // Crear algunos equipos de ejemplo
  const equipos = [
    {
      patente: 'ABC123',
      modelo: 'Mercedes-Benz Actros 1844',
      capacidadKg: 18000.00,
      estado: 'disponible' as const
    },
    {
      patente: 'XYZ789',
      modelo: 'Scania R420',
      capacidadKg: 20000.00,
      estado: 'disponible' as const
    },
    {
      patente: 'DEF456',
      modelo: 'Volvo FH16 750',
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