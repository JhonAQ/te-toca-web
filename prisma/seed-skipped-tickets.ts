import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createSkippedTickets() {
  console.log('🎫 Creating sample skipped tickets...')

  const generateTicketNumber = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'
    
    const letter1 = letters[Math.floor(Math.random() * letters.length)]
    const letter2 = letters[Math.floor(Math.random() * letters.length)]
    const number1 = numbers[Math.floor(Math.random() * numbers.length)]
    const number2 = numbers[Math.floor(Math.random() * numbers.length)]
    
    return `${letter1}${letter2}${number1}${number2}`
  }

  // Get a queue to add skipped tickets to
  const queue = await prisma.queue.findFirst({
    where: { isActive: true }
  })

  if (!queue) {
    console.log('❌ No active queue found')
    return
  }

  // Get a user for tickets
  const user = await prisma.user.findFirst()
  
  if (!user) {
    console.log('❌ No user found')
    return
  }

  const skippedTickets = [
    {
      number: generateTicketNumber(),
      queueId: queue.id,
      tenantId: queue.tenantId,
      userId: user.id,
      customerName: 'Cliente Saltado 1',
      customerPhone: '+51 999 111 222',
      status: 'skipped',
      position: 0,
      estimatedWaitTime: 0,
      priority: 'normal',
      reason: 'Cliente no respondió al llamado',
      skippedAt: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
    },
    {
      number: generateTicketNumber(),
      queueId: queue.id,
      tenantId: queue.tenantId,
      userId: user.id,
      customerName: 'Cliente Saltado 2',
      customerPhone: '+51 999 333 444',
      status: 'skipped',
      position: 0,
      estimatedWaitTime: 0,
      priority: 'priority',
      reason: 'Documentación incompleta',
      skippedAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
    },
    {
      number: generateTicketNumber(),
      queueId: queue.id,
      tenantId: queue.tenantId,
      userId: user.id,
      customerName: 'Cliente Saltado 3',
      customerPhone: '+51 999 555 666',
      status: 'skipped',
      position: 0,
      estimatedWaitTime: 0,
      priority: 'normal',
      reason: 'Cliente se retiró temporalmente',
      skippedAt: new Date(Date.now() - 45 * 60 * 1000) // 45 minutes ago
    }
  ]

  for (const ticketData of skippedTickets) {
    await prisma.ticket.create({
      data: ticketData
    })
  }

  console.log('✅ Created', skippedTickets.length, 'skipped tickets for queue:', queue.name)
}

createSkippedTickets()
  .catch((e) => {
    console.error('❌ Error creating skipped tickets:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
