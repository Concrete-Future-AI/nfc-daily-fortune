
import prisma from './lib/prisma.js';
async function clearCache() {
  const user = await prisma.user.findUnique({ where: { nfcUid: 'TEST002' } });
  if (user) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const deleted = await prisma.fortune.deleteMany({
      where: {
        userId: user.id,
        fortuneDate: { gte: today, lt: tomorrow }
      }
    });
    console.log('已清除今日运势缓存，删除记录数:', deleted.count);
  }
  await prisma.$disconnect();
}
clearCache().catch(console.error);

