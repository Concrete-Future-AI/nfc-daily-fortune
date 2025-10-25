import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generateAIPrompt, callAIService } from '@/lib/ai'
import { getLocationAndWeather, formatLocationInfo, formatWeatherInfo } from '@/lib/location-weather'

// 频率控制配置
const RATE_LIMIT_CONFIG = {
  batchSize: 10,        // 每批处理的用户数量
  delayBetweenBatches: 5000,  // 批次间延迟（毫秒）
  delayBetweenUsers: 1000,    // 用户间延迟（毫秒）
  maxConcurrent: 3      // 最大并发数
}

// 延迟函数
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 限制并发的Promise处理函数
async function processWithConcurrencyLimit<T>(
  items: T[],
  processor: (item: T) => Promise<void>,
  maxConcurrent: number,
  delayBetweenItems: number = 0
): Promise<{ successCount: number; failCount: number }> {
  let successCount = 0
  let failCount = 0
  
  // 分批处理
  for (let i = 0; i < items.length; i += maxConcurrent) {
    const batch = items.slice(i, i + maxConcurrent)
    
    // 并发处理当前批次
    const promises = batch.map(async (item, index) => {
      try {
        // 为每个项目添加延迟，避免同时发起请求
        if (delayBetweenItems > 0 && index > 0) {
          await delay(delayBetweenItems * index)
        }
        await processor(item)
        successCount++
      } catch (error) {
        console.error('处理项目失败:', error)
        failCount++
      }
    })
    
    await Promise.all(promises)
    
    // 批次间延迟
    if (i + maxConcurrent < items.length) {
      console.log(`完成批次 ${Math.floor(i / maxConcurrent) + 1}，等待 ${RATE_LIMIT_CONFIG.delayBetweenBatches}ms 后继续...`)
      await delay(RATE_LIMIT_CONFIG.delayBetweenBatches)
    }
  }
  
  return { successCount, failCount }
}

export async function POST() {
  try {
    console.log('开始批量生成运势，使用频率控制机制...')
    
    // 获取所有已注册用户（排除预注册用户）
    const users = await prisma.user.findMany({
      where: {
        name: {
          not: {
            startsWith: '待注册用户_'
          }
        }
      }
    })
    console.log(`找到 ${users.length} 个已注册用户`)
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // 过滤出需要生成运势的用户
    const usersNeedingFortune = []
    for (const user of users) {
      const existingFortune = await prisma.fortune.findFirst({
        where: {
          userId: user.id,
          fortuneDate: {
            gte: today,
            lt: tomorrow
          }
        }
      })
      
      if (!existingFortune) {
        usersNeedingFortune.push(user)
      }
    }
    
    console.log(`需要生成运势的用户数量: ${usersNeedingFortune.length}`)
    
    if (usersNeedingFortune.length === 0) {
      return NextResponse.json({
        success: true,
        message: '所有用户今日运势已存在，无需生成',
        successCount: 0,
        failCount: 0
      })
    }

    // 使用频率控制处理用户
    const { successCount, failCount } = await processWithConcurrencyLimit(
      usersNeedingFortune,
      async (user) => {
        await generateFortuneForUser(user, today)
      },
      RATE_LIMIT_CONFIG.maxConcurrent,
      RATE_LIMIT_CONFIG.delayBetweenUsers
    )

    console.log(`批量生成完成，成功: ${successCount}, 失败: ${failCount}`)

    return NextResponse.json({
      success: true,
      message: `批量生成完成，成功: ${successCount}, 失败: ${failCount}`,
      successCount,
      failCount,
      totalUsers: users.length,
      usersNeedingFortune: usersNeedingFortune.length
    })

  } catch (error) {
    console.error('批量生成运势失败:', error)
    return NextResponse.json(
      { error: '批量生成失败' },
      { status: 500 }
    )
  }
}

async function generateFortuneForUser(user: { id: number; name: string; gender?: string | null; dateOfBirth: Date; birthPlace?: string | null }, date: Date) {
  // 获取位置天气信息（批量生成时不依赖特定IP）
  const { location, weather } = await getLocationAndWeather()
  
  // 构建上下文信息
  const currentTime = new Date().toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit'
  })
  
  const contextInfo = {
    currentTime,
    location: location ? formatLocationInfo(location) : undefined,
    weather: weather ? formatWeatherInfo(weather) : undefined
  }

  // 生成运势
  const prompt = generateAIPrompt({
    name: user.name,
    gender: user.gender || undefined,
    dateOfBirth: user.dateOfBirth,
    birthPlace: user.birthPlace || undefined
  }, contextInfo)
  const aiResult = await callAIService(prompt)
    
    if (!aiResult.success) {
      throw new Error(`AI服务调用失败: ${aiResult.error}`)
    }

    const aiData = aiResult.data
    
    const fortuneData = {
      userId: user.id,
      fortuneDate: date,
    overallRating: aiData.overallRating,
    healthFortune: aiData.healthFortune,
    healthSuggestion: aiData.healthSuggestion,
    wealthFortune: aiData.wealthFortune,
    interpersonalFortune: aiData.interpersonalFortune,
    luckyColor: aiData.luckyColor,
    actionSuggestion: aiData.actionSuggestion,
    rawAiResponse: aiData
  }

  return await prisma.fortune.create({
      data: {
        userId: fortuneData.userId,
        fortuneDate: fortuneData.fortuneDate,
        overallRating: fortuneData.overallRating,
        healthFortune: fortuneData.healthFortune,
        healthSuggestion: fortuneData.healthSuggestion,
        wealthFortune: fortuneData.wealthFortune,
        interpersonalFortune: fortuneData.interpersonalFortune,
        luckyColor: fortuneData.luckyColor,
        actionSuggestion: fortuneData.actionSuggestion,
        rawAiResponse: fortuneData.rawAiResponse
      }
    })
}