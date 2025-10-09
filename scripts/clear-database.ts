import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearDatabase() {
  console.log('开始清除数据库数据...')

  try {
    // 删除所有运势记录（因为有外键约束，需要先删除）
    const deletedFortunes = await prisma.fortune.deleteMany({})
    console.log(`删除了 ${deletedFortunes.count} 条运势记录`)

    // 删除所有用户记录
    const deletedUsers = await prisma.user.deleteMany({})
    console.log(`删除了 ${deletedUsers.count} 个用户`)

    console.log('数据库清除完成！')
  } catch (error) {
    console.error('清除数据库时出错:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

clearDatabase()
  .catch((e) => {
    console.error('清除数据库失败:', e)
    process.exit(1)
  })