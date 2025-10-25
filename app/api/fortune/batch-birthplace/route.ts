import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generateAIPrompt, callAIService } from '@/lib/ai'
import { getLocationByBirthPlace, getWeatherByAdcode, formatLocationInfo, formatWeatherInfo } from '@/lib/location-weather'

// 优化的频率控制配置 - 更快更多
const RATE_LIMIT_CONFIG = {
  batchSize: 20,        // 每批处理的用户数量（增加）
  delayBetweenBatches: 2000,  // 批次间延迟（减少）
  delayBetweenUsers: 500,     // 用户间延迟（减少）
  maxConcurrent: 5      // 最大并发数（增加）
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
): Promise<{ successCount: number; failCount: number; errors: string[] }> {
  let successCount = 0
  let failCount = 0
  const errors: string[] = []
  
  // 分批处理
  for (let i = 0; i < items.length; i += maxConcurrent) {
    const batch = items.slice(i, i + maxConcurrent)
    
    console.log(`处理批次 ${Math.floor(i / maxConcurrent) + 1}/${Math.ceil(items.length / maxConcurrent)}，用户 ${i + 1}-${Math.min(i + maxConcurrent, items.length)}`)
    
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
        const errorMsg = `处理项目失败: ${error instanceof Error ? error.message : String(error)}`
        console.error(errorMsg)
        errors.push(errorMsg)
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
  
  return { successCount, failCount, errors }
}

export async function POST() {
  const startTime = Date.now()
  
  try {
    console.log('🚀 开始批量生成运势（使用出生地作为位置信息）...')
    
    // 获取所有已注册用户（排除预注册用户）
    const users = await prisma.user.findMany({
      where: {
        name: {
          not: {
            startsWith: '待注册用户_'
          }
        },
        AND: [
          {
            birthPlace: {
              not: null
            }
          },
          {
            birthPlace: {
              not: ''
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        gender: true,
        dateOfBirth: true,
        birthPlace: true
      }
    })
    console.log(`📊 找到 ${users.length} 个有出生地信息的已注册用户`)
    
    if (users.length === 0) {
      return NextResponse.json({
        success: true,
        message: '没有找到有出生地信息的已注册用户',
        successCount: 0,
        failCount: 0,
        totalUsers: 0,
        processingTime: Date.now() - startTime
      })
    }
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // 过滤出需要生成运势的用户（只为今天还没有运势的用户生成）
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
      
      // 只为今天还没有运势的用户生成
      if (!existingFortune) {
        usersNeedingFortune.push(user)
      }
    }
    
    console.log(`🎯 需要生成运势的用户数量: ${usersNeedingFortune.length}`)
    
    if (usersNeedingFortune.length === 0) {
      return NextResponse.json({
        success: true,
        message: '所有用户今日运势已存在，无需生成',
        successCount: 0,
        failCount: 0,
        totalUsers: users.length,
        processingTime: Date.now() - startTime
      })
    }

    // 使用优化的频率控制处理用户
    const { successCount, failCount, errors } = await processWithConcurrencyLimit(
      usersNeedingFortune,
      async (user) => {
        await generateFortuneForUserWithBirthPlace(user, today)
      },
      RATE_LIMIT_CONFIG.maxConcurrent,
      RATE_LIMIT_CONFIG.delayBetweenUsers
    )

    const processingTime = Date.now() - startTime
    console.log(`🏁 批量生成完成，成功: ${successCount}, 失败: ${failCount}, 耗时: ${processingTime}ms`)

    return NextResponse.json({
      success: true,
      message: `批量生成完成，成功: ${successCount}, 失败: ${failCount}`,
      successCount,
      failCount,
      totalUsers: users.length,
      usersNeedingFortune: usersNeedingFortune.length,
      processingTime,
      errors: errors.slice(0, 10), // 只返回前10个错误
      config: RATE_LIMIT_CONFIG
    })

  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('❌ 批量生成运势失败:', error)
    return NextResponse.json(
      { 
        error: '批量生成失败',
        details: error instanceof Error ? error.message : String(error),
        processingTime
      },
      { status: 500 }
    )
  }
}

async function generateFortuneForUserWithBirthPlace(
  user: { 
    id: number; 
    name: string; 
    gender?: string | null; 
    dateOfBirth: Date; 
    birthPlace: string | null 
  }, 
  date: Date
) {
  // 类型检查：确保birthPlace不为null
  if (!user.birthPlace) {
    throw new Error(`用户 ${user.name} 的出生地信息为空`)
  }
  
  console.log(`👤 为用户 ${user.name} (出生地: ${user.birthPlace}) 生成运势...`)
  
  try {
    // 1. 根据用户出生地获取地理位置信息
    const birthLocation = await getLocationByBirthPlace(user.birthPlace)
    
    if (!birthLocation) {
      throw new Error(`无法解析出生地: ${user.birthPlace}`)
    }
    
    // 2. 根据出生地获取天气信息
    const weather = await getWeatherByAdcode(birthLocation.adcode)
    
    // 3. 构建上下文信息
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
      location: formatLocationInfo(birthLocation),
      weather: weather ? formatWeatherInfo(weather) : '天气信息暂不可用',
      note: `基于用户出生地 ${user.birthPlace} 的位置和天气信息`
    }

    // 4. 生成运势
    const prompt = generateAIPrompt({
      name: user.name,
      gender: user.gender || undefined,
      dateOfBirth: user.dateOfBirth,
      birthPlace: user.birthPlace
    }, contextInfo)
    
    const aiResult = await callAIService(prompt)
      
    if (!aiResult.success) {
      throw new Error(`AI服务调用失败: ${aiResult.error}`)
    }

    const aiData = aiResult.data
    
    // 5. 创建新的运势记录
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
      rawAiResponse: {
        ...aiData,
        locationContext: contextInfo
      }
    }

    const result = await prisma.fortune.create({
      data: fortuneData
    })
    
    console.log(`✅ 用户 ${user.name} 运势生成成功 (ID: ${result.id})`)
    return result
    
  } catch (error) {
    console.error(`❌ 用户 ${user.name} 运势生成失败:`, error)
    throw error
  }
}