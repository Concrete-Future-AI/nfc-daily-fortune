#!/usr/bin/env tsx

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { generateAIPrompt, callAIService } from '../lib/ai'

console.log('🔍 AI响应质量分析\n')

// 测试用户
const testUser = {
  name: '陈女士',
  gender: '女',
  dateOfBirth: new Date('1970-03-15'),
  birthPlace: '杭州市'
}

// 测试上下文
const testContext = {
  currentTime: '2025年10月8日 星期二 20:55',
  currentLocation: '深圳市',
  weather: '多云转晴，气温28°C，南风2级，湿度65%'
}

console.log('📋 测试用户信息:')
console.log(`   姓名: ${testUser.name}`)
console.log(`   性别: ${testUser.gender}`)
console.log(`   出生日期: ${testUser.dateOfBirth.toISOString().split('T')[0]}`)
console.log(`   出生地: ${testUser.birthPlace}`)

console.log('\n🌍 上下文信息:')
console.log(`   当前时间: ${testContext.currentTime}`)
console.log(`   当前位置: ${testContext.currentLocation}`)
console.log(`   当前天气: ${testContext.weather}`)

async function testAIResponse() {
  try {
    console.log('\n🤖 生成AI提示词...')
    const prompt = generateAIPrompt(testUser, testContext)
    
    console.log('\n📤 调用AI服务...')
    const response = await callAIService(prompt)
    
    if (response.success) {
      console.log('\n✅ AI响应成功！')
      console.log('\n' + '='.repeat(80))
      console.log('📊 AI生成的运势内容:')
      console.log('='.repeat(80))
      
      const data = response.data
      console.log(`🌟 整体运势评级: ${data.overallRating}星`)
      console.log(`\n💪 健康运势:\n${data.healthFortune}`)
      console.log(`\n🏥 健康建议:\n${data.healthSuggestion}`)
      console.log(`\n💰 财富运势:\n${data.wealthFortune}`)
      console.log(`\n👥 人际运势:\n${data.interpersonalFortune}`)
      console.log(`\n🎨 幸运色: ${data.luckyColor}`)
      console.log(`\n🎯 行动建议:\n${data.actionSuggestion}`)
      
      console.log('\n' + '='.repeat(80))
      console.log('📈 响应质量分析:')
      console.log('='.repeat(80))
      
      // 分析字数
      console.log(`健康运势字数: ${data.healthFortune.length} (目标: 100-150字)`)
      console.log(`健康建议字数: ${data.healthSuggestion.length} (目标: 50-80字)`)
      console.log(`财富运势字数: ${data.wealthFortune.length} (目标: 30-50字)`)
      console.log(`人际运势字数: ${data.interpersonalFortune.length} (目标: 30-50字)`)
      console.log(`行动建议字数: ${data.actionSuggestion.length} (目标: 50-80字)`)
      
      // 检查是否包含上下文信息
      const hasWeatherRef = data.healthFortune.includes('天气') || data.healthFortune.includes('温度') || 
                           data.healthSuggestion.includes('天气') || data.healthSuggestion.includes('温度')
      const hasLocationRef = data.healthFortune.includes('深圳') || data.actionSuggestion.includes('深圳')
      const hasTimeRef = data.healthFortune.includes('秋') || data.healthFortune.includes('时节')
      
      console.log(`\n🌤️  天气信息运用: ${hasWeatherRef ? '✅' : '❌'}`)
      console.log(`📍 位置信息运用: ${hasLocationRef ? '✅' : '❌'}`)
      console.log(`⏰ 时间信息运用: ${hasTimeRef ? '✅' : '❌'}`)
      
      // 检查幸运色格式
      const colorMatch = data.luckyColor.match(/(.+)\s*\(#[0-9A-Fa-f]{6}\)/)
      console.log(`🎨 幸运色格式: ${colorMatch ? '✅' : '❌'} (${data.luckyColor})`)
      
    } else {
      console.log('\n❌ AI响应失败:')
      console.log(response.error)
    }
    
  } catch (error) {
    console.log('\n💥 测试过程中出现错误:')
    console.log(error)
  }
}

testAIResponse()