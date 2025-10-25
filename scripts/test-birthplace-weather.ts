/**
 * 测试使用用户出生地调用高德API获取天气信息
 */

import { PrismaClient } from '@prisma/client'
import { getLocationByBirthPlace, getWeatherByAdcode, formatLocationInfo, formatWeatherInfo } from '../lib/location-weather'

const prisma = new PrismaClient()

async function testBirthPlaceWeather() {
  try {
    console.log('🚀 开始测试用户出生地天气查询...\n')
    
    // 1. 从数据库获取有出生地信息的用户
    console.log('📊 从数据库获取用户出生地信息...')
    const users = await prisma.user.findMany({
      where: {
        birthPlace: {
          not: null,
        },
        name: {
          not: {
            startsWith: '待注册用户_'
          }
        }
      },
      select: {
        id: true,
        name: true,
        birthPlace: true
      },
      take: 5 // 只测试前5个用户
    })
    
    console.log(`✅ 找到 ${users.length} 个有出生地信息的用户\n`)
    
    if (users.length === 0) {
      console.log('❌ 没有找到有出生地信息的用户')
      return
    }
    
    // 2. 对每个用户测试出生地天气查询
    for (const user of users) {
      console.log(`\n${'='.repeat(60)}`)
      console.log(`👤 测试用户: ${user.name} (ID: ${user.id})`)
      console.log(`📍 出生地: ${user.birthPlace}`)
      console.log(`${'='.repeat(60)}`)
      
      try {
        // 2.1 根据出生地获取地理位置信息
        console.log('\n🔍 步骤1: 根据出生地获取地理位置信息...')
        const location = await getLocationByBirthPlace(user.birthPlace!)
        
        if (!location) {
          console.log('❌ 无法获取出生地的地理位置信息')
          continue
        }
        
        console.log('✅ 地理位置信息获取成功:')
        console.log(formatLocationInfo(location))
        
        // 2.2 根据地理位置获取天气信息
        console.log('\n🌤️ 步骤2: 根据地理位置获取天气信息...')
        const weather = await getWeatherByAdcode(location.adcode)
        
        if (!weather) {
          console.log('❌ 无法获取天气信息')
          continue
        }
        
        console.log('✅ 天气信息获取成功:')
        console.log(formatWeatherInfo(weather))
        
        console.log('\n🎉 该用户的出生地天气查询测试成功!')
        
      } catch (error) {
        console.error(`❌ 用户 ${user.name} 的出生地天气查询失败:`, error)
      }
    }
    
    console.log(`\n\n🏁 测试完成! 共测试了 ${users.length} 个用户的出生地天气查询`)
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 运行测试
testBirthPlaceWeather().catch(console.error)