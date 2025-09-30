import cron from 'node-cron'

// 每天凌晨2点执行批量生成运势
export function startFortuneGenerationJob() {
  cron.schedule('0 2 * * *', async () => {
    console.log('开始执行定时运势生成任务...')
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/fortune/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      const result = await response.json()
      console.log('定时运势生成任务完成:', result)
    } catch (error) {
      console.error('定时运势生成任务失败:', error)
    }
  })
  
  console.log('运势定时生成任务已启动，每天凌晨2点执行')
}