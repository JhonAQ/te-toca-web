import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Creando datos de prueba...')

  // Crear categorías
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Bancos' },
      update: {},
      create: {
        name: 'Bancos',
        iconName: 'bank',
        color: '#3B82F6',
        enterpriseCount: 2
      }
    }),
    prisma.category.upsert({
      where: { name: 'Salud' },
      update: {},
      create: {
        name: 'Salud',
        iconName: 'health',
        color: '#10B981',
        enterpriseCount: 1
      }
    }),
    prisma.category.upsert({
      where: { name: 'Gobierno' },
      update: {},
      create: {
        name: 'Gobierno',
        iconName: 'government',
        color: '#F59E0B',
        enterpriseCount: 1
      }
    })
  ])

  // Crear tenant por defecto
  const defaultTenant = await prisma.tenant.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      name: 'TeToca Demo',
      settings: {
        timezone: 'America/Lima',
        businessHours: { start: '08:00', end: '18:00' }
      }
    }
  })

  // Crear empresas
  const companies = await Promise.all([
    prisma.company.upsert({
      where: { id: 'banco-nacion' },
      update: {},
      create: {
        id: 'banco-nacion',
        name: 'Banco de la Nación',
        shortName: 'BN',
        type: 'banco',
        address: 'Av. República de Panamá 3664, San Isidro',
        schedule: 'Lun-Vie: 8:00-17:00, Sáb: 8:00-13:00',
        phone: '+51 1 518-3000',
        tenantId: defaultTenant.id,
        categoryId: categories[0].id
      }
    }),
    prisma.company.upsert({
      where: { id: 'hospital-nacional' },
      update: {},
      create: {
        id: 'hospital-nacional',
        name: 'Hospital Nacional',
        shortName: 'HN',
        type: 'hospital',
        address: 'Av. Honorio Delgado 262, San Martín de Porres',
        schedule: '24 horas',
        phone: '+51 1 482-8505',
        tenantId: defaultTenant.id,
        categoryId: categories[1].id
      }
    })
  ])

  // Crear colas
  const queues = await Promise.all([
    prisma.queue.upsert({
      where: { id: 'bn-atencion-general' },
      update: {},
      create: {
        id: 'bn-atencion-general',
        name: 'Atención General',
        description: 'Cola principal para consultas generales y información',
        category: 'General',
        priority: 'medium',
        averageWaitTime: 12,
        tenantId: defaultTenant.id,
        companyId: companies[0].id
      }
    }),
    prisma.queue.upsert({
      where: { id: 'bn-soporte-tecnico' },
      update: {},
      create: {
        id: 'bn-soporte-tecnico',
        name: 'Soporte Técnico',
        description: 'Resolución de problemas técnicos y asistencia especializada',
        category: 'Técnico',
        priority: 'high',
        averageWaitTime: 25,
        tenantId: defaultTenant.id,
        companyId: companies[0].id
      }
    }),
    prisma.queue.upsert({
      where: { id: 'hn-emergencias' },
      update: {},
      create: {
        id: 'hn-emergencias',
        name: 'Emergencias',
        description: 'Atención médica de emergencia',
        category: 'Emergencia',
        priority: 'high',
        averageWaitTime: 5,
        tenantId: defaultTenant.id,
        companyId: companies[1].id
      }
    })
  ])

  // Crear worker por defecto
  const hashedPassword = await bcrypt.hash('123456', 12)
  
  await prisma.worker.upsert({
    where: { tenantId_username: { tenantId: defaultTenant.id, username: 'admin' } },
    update: {},
    create: {
      name: 'Juan Pérez',
      username: 'admin',
      password: hashedPassword,
      role: 'operator',
      tenantId: defaultTenant.id,
      permissions: ['manage_queues', 'process_tickets']
    }
  })

  // Crear usuario de prueba
  await prisma.user.upsert({
    where: { email: 'cliente@test.com' },
    update: {},
    create: {
      name: 'Cliente de Prueba',
      email: 'cliente@test.com',
      password: hashedPassword,
      phone: '+51 999 888 777'
    }
  })

  console.log('✅ Datos de prueba creados correctamente')
}

main()
  .catch((e) => {
    console.error('❌ Error creando datos de prueba:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
