import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('开始创建种子数据...')

  // 创建测试用户
  const users = await Promise.all([
    prisma.user.create({
      data: {
        nfcUid: 'TEST001',
        name: '张大爷',
        gender: '男',
        dateOfBirth: new Date('1950-03-15'),
        birthPlace: '北京市',
      },
    }),
    prisma.user.create({
      data: {
        nfcUid: 'TEST002',
        name: '李奶奶',
        gender: '女',
        dateOfBirth: new Date('1955-07-22'),
        birthPlace: '上海市',
      },
    }),
    prisma.user.create({
      data: {
        nfcUid: 'TEST003',
        name: '王阿姨',
        gender: '女',
        dateOfBirth: new Date('1960-11-08'),
        birthPlace: '广州市',
      },
    }),
    prisma.user.create({
      data: {
        nfcUid: 'TEST004',
        name: '刘叔叔',
        gender: '男',
        dateOfBirth: new Date('1958-12-03'),
        birthPlace: '深圳市',
      },
    }),
    prisma.user.create({
      data: {
        nfcUid: 'TEST005',
        name: '陈阿姨',
        gender: '女',
        dateOfBirth: new Date('1962-05-18'),
        birthPlace: '杭州市',
      },
    }),
  ])

  console.log(`创建了 ${users.length} 个用户`)

  // 为部分用户创建示例运势数据
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const fortunes = await Promise.all([
    prisma.fortune.create({
      data: {
        userId: users[0].id,
        fortuneDate: today,
        overallRating: 4,
        healthFortune: '今日身体状况良好，精神饱满。适宜进行轻度运动，如散步、太极等。注意保持心情愉悦，多与家人朋友交流。',
        healthSuggestion: '建议早睡早起，保持规律作息。多喝温水，适量食用新鲜蔬果。',
        wealthFortune: '财运平稳，适合理性消费。',
        interpersonalFortune: '人际关系和谐，容易得到他人帮助。',
        luckyColor: '翡翠绿 (#00A86B)',
        actionSuggestion: '今日宜静不宜动，可以在家整理物品，或与老友通话联络感情。',
      },
    }),
    prisma.fortune.create({
      data: {
        userId: users[1].id,
        fortuneDate: today,
        overallRating: 5,
        healthFortune: '今日运势极佳，身心愉悦。适合外出活动，呼吸新鲜空气。肠胃消化良好，可以适量享用美食。',
        healthSuggestion: '保持积极心态，多晒太阳补充维生素D。注意膝关节保暖。',
        wealthFortune: '财运亨通，可能有意外收获。',
        interpersonalFortune: '贵人运旺盛，容易结识新朋友。',
        luckyColor: '胭脂红 (#C93756)',
        actionSuggestion: '今日适合参加社交活动，或者去公园散步赏花。可以尝试新的兴趣爱好。',
      },
    }),
  ])

  console.log(`创建了 ${fortunes.length} 条运势记录`)

  console.log('种子数据创建完成！')
}

main()
  .catch((e) => {
    console.error('种子数据创建失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })