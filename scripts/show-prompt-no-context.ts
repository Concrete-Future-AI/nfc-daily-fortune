#!/usr/bin/env tsx

import { generateAIPrompt } from '../lib/ai'

console.log('🔍 AI提示词生成示例（无上下文信息）\n')

// 示例用户数据
const testUser = {
  name: '李四',
  gender: '女',
  dateOfBirth: new Date('1975-12-20'),
  birthPlace: '广州市'
}

console.log('📋 测试用户信息:')
console.log(`   姓名: ${testUser.name}`)
console.log(`   性别: ${testUser.gender}`)
console.log(`   出生日期: ${testUser.dateOfBirth.toISOString().split('T')[0]}`)
console.log(`   出生地: ${testUser.birthPlace}`)

console.log('\n' + '='.repeat(80))
console.log('🤖 生成的AI提示词（无上下文）:')
console.log('='.repeat(80))

const prompt = generateAIPrompt(testUser)
console.log(prompt)

console.log('\n' + '='.repeat(80))
console.log('✅ 提示词展示完成')