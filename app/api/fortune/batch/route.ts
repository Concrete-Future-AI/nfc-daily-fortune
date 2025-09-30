import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generateAIPrompt, callAIService } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    // 获取所有用户
    const users = await prisma.user.findMany()
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    let successCount = 0
    let failCount = 0

    for (const user of users) {
      try {
        // 检查今天是否已生成运势
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
          // 生成运势
          await generateFortuneForUser(user.id, today)
          successCount++
        }
      } catch (error) {
        console.error(`为用户 ${user.id} 生成运势失败:`, error)
        failCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `批量生成完成，成功: ${successCount}, 失败: ${failCount}`,
      successCount,
      failCount
    })

  } catch (error) {
    console.error('批量生成运势失败:', error)
    return NextResponse.json(
      { error: '批量生成失败' },
      { status: 500 }
    )
  }
}

async function generateFortuneForUser(user: any, date: Date) {
  // 生成运势
          const prompt = generateAIPrompt({
            name: user.name,
            gender: user.gender || undefined,
            dateOfBirth: user.dateOfBirth,
            birthPlace: user.birthPlace || undefined
          })
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