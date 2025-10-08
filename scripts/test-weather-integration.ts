#!/usr/bin/env tsx

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { generateAIPrompt, callAIService } from '../lib/ai'

console.log('🌤️ 天气信息集成测试\n')

// 测试用户
const testUser = {
  name: '王先生',
  gender: '男',
  dateOfBirth: new Date('1965-08-20'),
  birthPlace: '成都市'
}

// 测试不同天气条件
const weatherScenarios = [
  {
    name: '高温天气',
    context: {
      currentTime: '2025年10月8日 星期二 14:30',
      currentLocation: '广州市',
      weather: '晴热，气温35°C，无风，湿度85%，紫外线强'
    }
  },
  {
    name: '雨天',
    context: {
      currentTime: '2025年10月8日 星期二 16:00',
      currentLocation: '上海市',
      weather: '中雨，气温18°C，东北风4级，湿度90%'
    }
  },
  {
    name: '寒冷天气',
    context: {
      currentTime: '2025年10月8日 星期二 08:00',
      currentLocation: '哈尔滨市',
      weather: '多云，气温5°C，西北风3级，湿度45%'
    }
  }
]

async function testWeatherScenario(scenario: any) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`🌤️ 测试场景: ${scenario.name}`)
  console.log(`📍 位置: ${scenario.context.currentLocation}`)
  console.log(`🌡️ 天气: ${scenario.context.weather}`)
  console.log('='.repeat(60))
  
  try {
    const prompt = generateAIPrompt(testUser, scenario.context)
    const response = await callAIService(prompt)
    
    if (response.success) {
      const data = response.data
      
      console.log(`\n💪 健康运势:\n${data.healthFortune}`)
      console.log(`\n🏥 健康建议:\n${data.healthSuggestion}`)
      console.log(`\n🎯 行动建议:\n${data.actionSuggestion}`)
      
      // 分析天气信息运用
      const weatherTerms = ['气温', '温度', '湿度', '风', '雨', '晴', '热', '冷', '紫外线']
      const healthText = data.healthFortune + ' ' + data.healthSuggestion + ' ' + data.actionSuggestion
      const usedTerms = weatherTerms.filter(term => healthText.includes(term))
      
      console.log(`\n📊 天气信息运用分析:`)
      console.log(`   使用的天气词汇: ${usedTerms.join(', ') || '无'}`)
      console.log(`   天气信息运用程度: ${usedTerms.length > 0 ? '✅ 良好' : '❌ 不足'}`)
      
    } else {
      console.log(`❌ AI响应失败: ${response.error}`)
    }
    
  } catch (error) {
    console.log(`💥 测试出错: ${error}`)
  }
}

async function runAllTests() {
  for (const scenario of weatherScenarios) {
    await testWeatherScenario(scenario)
    await new Promise(resolve => setTimeout(resolve, 2000)) // 等待2秒避免API限制
  }
  
  console.log(`\n${'='.repeat(60)}`)
  console.log('✅ 所有天气场景测试完成')
}

runAllTests()