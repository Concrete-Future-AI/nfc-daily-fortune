import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generateAIPrompt, callAIService } from '@/lib/ai'

export async function GET(
  request: Request,
  { params }: { params: { nfc_uid: string } }
) {
  try {
    const { nfc_uid } = await params;
    const nfcUid = nfc_uid;

    // NFC UID验证
    if (!nfcUid) {
      return NextResponse.json(
        { error: "NFC UID不能为空" },
        { status: 400 }
      );
    }
    if (typeof nfcUid !== 'string') {
      return NextResponse.json(
        { error: "NFC UID格式不正确" },
        { status: 400 }
      );
    }
    if (nfcUid.length > 50) {
      return NextResponse.json(
        { error: "NFC UID长度不能超过50个字符" },
        { status: 400 }
      );
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { nfcUid },
    });

    if (!user) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }

    // 检查是否为预生成的未注册用户
    const isPreGenerated = user.name.startsWith('待注册用户_');
    
    if (isPreGenerated) {
      return NextResponse.json(
        { error: "用户需要先完成注册" },
        { status: 404 }
      );
    }

    // 获取今天的日期
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 查找今天的运势
    let fortune = await prisma.fortune.findFirst({
      where: {
        userId: user.id,
        fortuneDate: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    // 如果没有今天的运势，根据模式决定是否生成
    if (!fortune) {
      const generationMode = process.env.FORTUNE_GENERATION_MODE || "on_demand";
      
      if (generationMode === "on_demand") {
        // 实时生成运势
        const prompt = generateAIPrompt({
          name: user.name,
          gender: user.gender || undefined,
          dateOfBirth: user.dateOfBirth,
          birthPlace: user.birthPlace || undefined
        });
        const aiResponse = await callAIService(prompt);
        
        if (!aiResponse || !aiResponse.success) {
          return NextResponse.json(
            { error: "生成运势失败" },
            { status: 500 }
          );
        }

        const aiData = aiResponse.data;

        fortune = await prisma.fortune.create({
          data: {
            userId: user.id,
            fortuneDate: today,
            overallRating: aiData.overallRating,
            luckyColor: aiData.luckyColor,
            healthFortune: aiData.healthFortune,
            healthSuggestion: aiData.healthSuggestion,
            wealthFortune: aiData.wealthFortune,
            interpersonalFortune: aiData.interpersonalFortune,
            actionSuggestion: aiData.actionSuggestion,
          },
        });
      } else {
        return NextResponse.json(
          { error: "今日运势尚未生成" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(fortune);
  } catch (error) {
    console.error("获取运势失败:", error);
    return NextResponse.json(
      { error: "获取运势失败" },
      { status: 500 }
    );
  }
}

async function generateFortune(userId: number, date: Date) {
  try {
    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      console.error('用户不存在')
      return null
    }

    // 生成运势
    const prompt = generateAIPrompt({
      name: user.name,
      gender: user.gender || undefined,
      dateOfBirth: user.dateOfBirth,
      birthPlace: user.birthPlace || undefined
    })
    const aiResult = await callAIService(prompt)
    
    if (!aiResult.success) {
      console.error('AI服务调用失败:', aiResult.error)
      return null
    }

    const aiData = aiResult.data
    
    const newFortune = {
      userId,
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
      data: newFortune
    })

  } catch (error) {
    console.error('生成运势失败:', error)
    return null
  }
}