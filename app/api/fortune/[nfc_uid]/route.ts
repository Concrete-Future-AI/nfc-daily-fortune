import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generateAIPrompt, callAIService } from '@/lib/ai'
import { getLocationAndWeather, formatLocationInfo, formatWeatherInfo } from '@/lib/location-weather'

// 获取客户端IP地址的辅助函数
function getClientIP(request: Request): string | undefined {
  // 尝试从各种头部获取真实IP
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIP) {
    return realIP
  }
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  return undefined
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ nfc_uid: string }> }
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
        // 获取客户端IP和位置天气信息
        const clientIP = getClientIP(request)
        const { location, weather } = await getLocationAndWeather(clientIP)
        
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
        
        // 实时生成运势
        const prompt = generateAIPrompt({
          name: user.name,
          gender: user.gender || undefined,
          dateOfBirth: user.dateOfBirth,
          birthPlace: user.birthPlace || undefined
        }, contextInfo);
        const aiResponse = await callAIService(prompt);
        
        if (!aiResponse || !aiResponse.success) {
          return NextResponse.json(
            { error: "生成运势失败" },
            { status: 500 }
          );
        }

        const aiData = aiResponse.data;

        // 使用 upsert 来避免唯一性约束冲突
        fortune = await prisma.fortune.upsert({
          where: {
            userId_fortuneDate: {
              userId: user.id,
              fortuneDate: today,
            },
          },
          update: {
            overallRating: aiData.overallRating,
            luckyColor: aiData.luckyColor,
            healthFortune: aiData.healthFortune,
            healthSuggestion: aiData.healthSuggestion,
            wealthFortune: aiData.wealthFortune,
            interpersonalFortune: aiData.interpersonalFortune,
            actionSuggestion: aiData.actionSuggestion,
          },
          create: {
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