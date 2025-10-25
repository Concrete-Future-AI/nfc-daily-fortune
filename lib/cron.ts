import cron from 'node-cron'

// 每天凌晨2点执行批量生成运势
export function startFortuneGenerationJob() {
  cron.schedule('0 2 * * *', async () => {
    const startTime = new Date()
    console.log(`[${startTime.toISOString()}] 开始执行定时运势生成任务...`)
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/fortune/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // 增加超时时间，因为批量处理可能需要较长时间
        signal: AbortSignal.timeout(30 * 60 * 1000) // 30分钟超时
      })
      
      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status} ${response.statusText}`)
      }
      
      const result = await response.json()
      const endTime = new Date()
      const duration = endTime.getTime() - startTime.getTime()
      
      console.log(`[${endTime.toISOString()}] 定时运势生成任务完成 (耗时: ${Math.round(duration / 1000)}秒):`, {
        success: result.success,
        message: result.message,
        successCount: result.successCount,
        failCount: result.failCount,
        totalUsers: result.totalUsers,
        usersNeedingFortune: result.usersNeedingFortune
      })
      
      // 如果有失败的情况，记录警告
      if (result.failCount > 0) {
        console.warn(`⚠️ 有 ${result.failCount} 个用户的运势生成失败`)
      }
      
    } catch (error) {
      const endTime = new Date()
      const duration = endTime.getTime() - startTime.getTime()
      
      console.error(`[${endTime.toISOString()}] 定时运势生成任务失败 (耗时: ${Math.round(duration / 1000)}秒):`, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      
      // 可以在这里添加告警通知逻辑
      // 例如发送邮件、钉钉通知等
    }
  })
  
  console.log('🕐 运势定时生成任务已启动，每天凌晨2点执行（带频率控制）')
}