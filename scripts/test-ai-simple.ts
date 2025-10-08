#!/usr/bin/env tsx

/**
 * 简化版AI服务测试脚本
 * 专门用于快速验证AI服务配置和连接
 */

import dotenv from 'dotenv';
import path from 'path';
import { generateAIPrompt, callAIService } from '../lib/ai';

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function quickAITest() {
  console.log('🚀 快速AI服务测试\n');
  
  // 检查环境变量
  console.log('🔧 检查环境变量...');
  const requiredVars = ['AI_ENDPOINT', 'AI_API_KEY', 'AI_MODEL_NAME'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ 缺少环境变量:', missingVars.join(', '));
    return;
  }
  
  console.log('✅ 环境变量完整');
  console.log(`   端点: ${process.env.AI_ENDPOINT}`);
  console.log(`   模型: ${process.env.AI_MODEL_NAME}`);
  console.log(`   密钥: ${process.env.AI_API_KEY?.substring(0, 10)}...\n`);
  
  // 测试AI服务
  console.log('🤖 测试AI服务连接...');
  
  const testUser = {
    name: "测试用户",
    gender: "女",
    dateOfBirth: new Date("1990-01-01"),
    birthPlace: "北京市"
  };
  
  const contextInfo = {
    currentTime: new Date().toLocaleString('zh-CN'),
    location: "北京市朝阳区",
    weather: "晴朗，气温22°C"
  };
  
  try {
    const prompt = generateAIPrompt(testUser, contextInfo);
    console.log('✅ AI提示词生成成功');
    
    const response = await callAIService(prompt);
    
    if (response.success) {
      console.log('✅ AI服务调用成功！');
      console.log(`   整体评级: ${response.data.overallRating}星`);
      console.log(`   健康运势: ${response.data.healthFortune.substring(0, 80)}...`);
      console.log(`   幸运色: ${response.data.luckyColor}`);
      console.log('\n🎉 AI服务配置正常，可以正常使用！');
    } else {
      console.error('❌ AI服务调用失败:', response.error);
      console.log('\n💡 建议检查：');
      console.log('   1. AI_ENDPOINT 是否正确');
      console.log('   2. AI_API_KEY 是否有效');
      console.log('   3. AI_MODEL_NAME 是否支持');
      console.log('   4. 网络连接是否正常');
    }
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

// 运行测试
if (require.main === module) {
  quickAITest().catch(console.error);
}

export { quickAITest };