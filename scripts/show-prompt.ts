#!/usr/bin/env tsx

import { generateAIPrompt } from '../lib/ai'

console.log('🔍 AI提示词生成示例\n')

// 示例用户数据
const testUser = {
  name: '张三',
  gender: '男',
  dateOfBirth: new Date('1980-05-15'),
  birthPlace: '北京市'
}

// 示例上下文信息
const testContext = {
  currentTime: '2025年10月8日 星期二 18:45',
  currentLocation: '上海市',
  weather: '晴，气温25°C，东北风≤3级，湿度70%'
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

console.log('\n' + '='.repeat(80))
console.log('🤖 生成的AI提示词:')
console.log('='.repeat(80))

const prompt = generateAIPrompt(testUser, testContext)
console.log(prompt)

console.log('\n' + '='.repeat(80))
console.log('✅ 提示词展示完成')