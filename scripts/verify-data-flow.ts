#!/usr/bin/env tsx

/**
 * 数据流验证脚本
 * 验证位置和天气信息是否真实传递给AI大模型
 */

import dotenv from 'dotenv';
import path from 'path';
import { getLocationAndWeather, formatLocationInfo, formatWeatherInfo } from '../lib/location-weather';
import { generateAIPrompt, callAIService } from '../lib/ai';

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function verifyDataFlow() {
  console.log('🔍 数据流验证开始\n');
  
  // 1. 获取位置和天气信息
  console.log('📍 步骤1: 获取位置和天气信息...');
  const { location, weather } = await getLocationAndWeather();
  
  if (!location || !weather) {
    console.error('❌ 无法获取位置或天气信息');
    return;
  }
  
  const currentTime = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
  const locationStr = formatLocationInfo(location);
  const weatherStr = formatWeatherInfo(weather);
  
  console.log(`✅ 位置信息: ${locationStr}`);
  console.log(`✅ 天气信息: ${weatherStr}`);
  console.log(`✅ 时间信息: ${currentTime}\n`);
  
  // 2. 生成AI提示词
  console.log('🤖 步骤2: 生成AI提示词...');
  const testUser = {
    name: '测试用户',
    gender: '男',
    dateOfBirth: new Date('1990-01-01'),
    birthPlace: '北京市'
  };
  
  const context = {
    currentTime,
    location: locationStr,
    weather: weatherStr
  };
  
  const prompt = generateAIPrompt(testUser, context);
  console.log('✅ AI提示词生成成功');
  console.log('📝 提示词内容预览:');
  console.log('=' .repeat(50));
  console.log(prompt.substring(0, 500) + '...');
  console.log('=' .repeat(50));
  
  // 检查提示词是否包含位置和天气信息
  const hasLocation = prompt.includes(locationStr);
  const hasWeather = prompt.includes(weatherStr);
  const hasTime = prompt.includes(currentTime);
  
  console.log(`\n🔍 数据包含检查:`);
  console.log(`   位置信息包含: ${hasLocation ? '✅' : '❌'}`);
  console.log(`   天气信息包含: ${hasWeather ? '✅' : '❌'}`);
  console.log(`   时间信息包含: ${hasTime ? '✅' : '❌'}`);
  
  if (!hasLocation || !hasWeather || !hasTime) {
    console.error('❌ 提示词中缺少必要的上下文信息');
    return;
  }
  
  // 3. 调用AI服务
  console.log('\n🚀 步骤3: 调用AI服务...');
  try {
    const aiResponse = await callAIService(prompt);
    console.log('✅ AI服务调用成功');
    console.log('📋 AI响应内容:');
    console.log('=' .repeat(50));
    console.log(JSON.stringify(aiResponse, null, 2));
    console.log('=' .repeat(50));
    
    // 检查AI响应是否体现了位置和天气信息
    const responseStr = JSON.stringify(aiResponse);
    const aiMentionsWeather = responseStr.includes('雨') || responseStr.includes('天气') || responseStr.includes('气温') || responseStr.includes('湿');
    const aiMentionsLocation = responseStr.includes('北京') || responseStr.includes('位置');
    
    console.log(`\n🧠 AI理解检查:`);
    console.log(`   AI提及天气相关: ${aiMentionsWeather ? '✅' : '❌'}`);
    console.log(`   AI提及位置相关: ${aiMentionsLocation ? '✅' : '❌'}`);
    
    if (aiMentionsWeather && aiMentionsLocation) {
      console.log('\n🎉 验证成功！位置和天气信息已成功传递给AI并被理解使用');
    } else {
      console.log('\n⚠️  AI可能没有充分利用位置和天气信息');
    }
    
  } catch (error) {
    console.error('❌ AI服务调用失败:', error);
  }
  
  console.log('\n📊 数据流验证完成');
}

// 运行验证
if (require.main === module) {
  verifyDataFlow().catch(console.error);
}

export { verifyDataFlow };