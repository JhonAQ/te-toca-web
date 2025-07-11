import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { stringifyJsonField } from '../src/lib/utils/json-helpers'

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
      settings: stringifyJsonField({
        timezone: 'America/Lima',
        businessHours: { start: '08:00', end: '18:00' }
      })
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
  
  // Crear workers con permisos específicos de colas
  await Promise.all([
    prisma.worker.upsert({
      where: { tenantId_username: { tenantId: defaultTenant.id, username: 'admin' } },
      update: {},
      create: {
        name: 'Juan Pérez',
        username: 'admin',
        password: hashedPassword,
        role: 'operator',
        tenantId: defaultTenant.id,
        permissions: stringifyJsonField({
          queues: ['bn-atencion-general', 'bn-soporte-tecnico'], // Acceso a ambas colas
          actions: ['manage_queues', 'process_tickets', 'skip_tickets', 'cancel_tickets']
        })
      }
    }),
    prisma.worker.upsert({
      where: { tenantId_username: { tenantId: defaultTenant.id, username: 'operator1' } },
      update: {},
      create: {
        name: 'María González',
        username: 'operator1',
        password: hashedPassword,
        role: 'operator',
        tenantId: defaultTenant.id,
        permissions: stringifyJsonField({
          queues: ['bn-atencion-general'], // Solo acceso a atención general
          actions: ['process_tickets', 'skip_tickets']
        })
      }
    }),
    prisma.worker.upsert({
      where: { tenantId_username: { tenantId: defaultTenant.id, username: 'supervisor' } },
      update: {},
      create: {
        name: 'Carlos Mendoza',
        username: 'supervisor',
        password: hashedPassword,
        role: 'supervisor',
        tenantId: defaultTenant.id,
        permissions: stringifyJsonField({
          queues: ['bn-atencion-general', 'bn-soporte-tecnico', 'hn-emergencias'], // Acceso a todas
          actions: ['manage_queues', 'process_tickets', 'skip_tickets', 'cancel_tickets', 'view_reports', 'manage_workers']
        })
      }
    }),
    prisma.worker.upsert({
      where: { tenantId_username: { tenantId: defaultTenant.id, username: 'tech_support' } },
      update: {},
      create: {
        name: 'Ana López',
        username: 'tech_support',
        password: hashedPassword,
        role: 'operator',
        tenantId: defaultTenant.id,
        permissions: stringifyJsonField({
          queues: ['bn-soporte-tecnico'], // Solo soporte técnico
          actions: ['process_tickets', 'skip_tickets']
        })
      }
    }),
    prisma.worker.upsert({
      where: { tenantId_username: { tenantId: defaultTenant.id, username: 'emergency' } },
      update: {},
      create: {
        name: 'Pedro Ramírez',
        username: 'emergency',
        password: hashedPassword,
        role: 'operator',
        tenantId: defaultTenant.id,
        permissions: stringifyJsonField({
          queues: ['hn-emergencias'], // Solo emergencias
          actions: ['process_tickets', 'skip_tickets', 'priority_handling']
        })
      }
    })
  ])

  // Crear más usuarios de prueba
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'cliente@test.com' },
      update: {},
      create: {
        name: 'Cliente de Prueba',
        email: 'cliente@test.com',
        password: hashedPassword,
        phone: '+51 999 888 777'
      }
    }),
    prisma.user.upsert({
      where: { email: 'ana.lopez@test.com' },
      update: {},
      create: {
        name: 'Ana López',
        email: 'ana.lopez@test.com',
        password: hashedPassword,
        phone: '+51 987 654 321'
      }
    }),
    prisma.user.upsert({
      where: { email: 'pedro.ramirez@test.com' },
      update: {},
      create: {
        name: 'Pedro Ramírez',
        email: 'pedro.ramirez@test.com',
        password: hashedPassword,
        phone: '+51 912 345 678'
      }
    })
  ])

  // Crear algunos tickets de ejemplo
  console.log('🎫 Creando tickets de ejemplo...')
  
  const generateTicketNumber = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'
    
    const letter1 = letters[Math.floor(Math.random() * letters.length)]
    const letter2 = letters[Math.floor(Math.random() * letters.length)]
    const number1 = numbers[Math.floor(Math.random() * numbers.length)]
    const number2 = numbers[Math.floor(Math.random() * numbers.length)]
    
    return `${letter1}${letter2}${number1}${number2}`
  }

  // Crear tickets en diferentes estados
  const sampleTickets = [
    {
      number: generateTicketNumber(),
      queueId: queues[0].id, // Atención General
      tenantId: defaultTenant.id,
      userId: users[0].id,
      customerName: users[0].name,
      customerPhone: users[0].phone,
      customerEmail: users[0].email,
      status: 'waiting',
      position: 1,
      estimatedWaitTime: 12,
      priority: 'normal'
    },
    {
      number: generateTicketNumber(),
      queueId: queues[0].id,
      tenantId: defaultTenant.id,
      userId: users[1].id,
      customerName: users[1].name,
      customerPhone: users[1].phone,
      customerEmail: users[1].email,
      status: 'waiting',
      position: 2,
      estimatedWaitTime: 24,
      priority: 'normal'
    },
    {
      number: generateTicketNumber(),
      queueId: queues[1].id, // Soporte Técnico
      tenantId: defaultTenant.id,
      userId: users[2].id,
      customerName: users[2].name,
      customerPhone: users[2].phone,
      customerEmail: users[2].email,
      status: 'waiting',
      position: 1,
      estimatedWaitTime: 25,
      priority: 'priority'
    }
  ]

  for (const ticketData of sampleTickets) {
    await prisma.ticket.create({
      data: ticketData
    })
  }

  console.log('✅ Datos de prueba creados correctamente')
  console.log('👤 Usuarios de prueba creados:')
  console.log('   📧 cliente@test.com / 123456')
  console.log('   📧 ana.lopez@test.com / 123456')
  console.log('   📧 pedro.ramirez@test.com / 123456')
  console.log('👷 Workers de prueba creados:')
  console.log('   🏢 Tenant: default')
  console.log('   👤 admin / 123456 (Acceso: Atención General + Soporte Técnico)')
  console.log('   👤 operator1 / 123456 (Acceso: Solo Atención General)')
  console.log('   👤 supervisor / 123456 (Acceso: Todas las colas)')
  console.log('   👤 tech_support / 123456 (Acceso: Solo Soporte Técnico)')
  console.log('   👤 emergency / 123456 (Acceso: Solo Emergencias)')
  console.log('🎫 Tickets de ejemplo creados: 3')
}

main()
  .catch((e) => {
    console.error('❌ Error creando datos de prueba:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
