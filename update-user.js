const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function updateUser() {
  try {
    const user = await prisma.user.update({
      where: { email: 'gibbo70@outlook.com' },
      data: {
        plan: 'PRO',
        subscriptionStatus: 'active',
      },
    })
    console.log('Updated user:', user)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateUser()
