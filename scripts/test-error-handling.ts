#!/usr/bin/env tsx

/**
 * 错误处理和重试机制测试脚本
 */

import dotenv from 'dotenv';
import path from 'path';
import { generateAIPrompt, callAIService } from '../lib/ai';

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// 测试用户数据
const testUser = {
  name: '测试用户',
  gender: '男',
  dateOfBirth: new Date('1990-01-01'),
  birthPlace: '北京市'
};

const testContext = {
  currentTime: '2025年10月8日 星期二 18:00',
  currentLocation: '北京市',
  weather: '晴，气温15°C，微风'
};

async function testNormalAICall() {
  console.log('🧪 测试1: 正常AI调用');
  console.log('=' .repeat(50));
  
  try {
    const prompt = generateAIPrompt(testUser, testContext);
    console.log('📝 生成提示词成功');
    
    const result = await callAIService(prompt);
    
    if (result.success) {
      console.log('✅ AI调用成功');
      console.log(`   整体评级: ${result.data.overallRating}星`);
      console.log(`   幸运色: ${result.data.luckyColor}`);
      console.log(`   健康运势: ${result.data.healthFortune.substring(0, 50)}...`);
    } else {
      console.log('❌ AI调用失败');
      console.log(`   错误: ${result.error}`);
      console.log(`   原始内容: ${typeof result.rawContent === 'string' ? result.rawContent.substring(0, 100) + '...' : result.rawContent}`);
    }
  } catch (error: any) {
    console.error('❌ 测试异常:', error?.message || String(error));
  }
  
  console.log('\n');
}

async function testWithInvalidEndpoint() {
  console.log('🧪 测试2: 无效端点测试（模拟网络错误）');
  console.log('=' .repeat(50));
  
  // 临时修改环境变量
  const originalEndpoint = process.env.AI_ENDPOINT;
  process.env.AI_ENDPOINT = 'https://invalid-endpoint-that-does-not-exist.com/v1/chat/completions';
  
  try {
    const prompt = generateAIPrompt(testUser, testContext);
    console.log('📝 生成提示词成功');
    console.log('🔄 开始调用AI服务（预期会重试）...');
    
    const startTime = Date.now();
    const result = await callAIService(prompt, { maxRetries: 2 }); // 减少重试次数以节省时间
    const endTime = Date.now();
    
    console.log(`⏱️  总耗时: ${endTime - startTime}ms`);
    
    if (result.success) {
      console.log('✅ AI调用成功（意外）');
    } else {
      console.log('❌ AI调用失败（预期）');
      console.log(`   错误: ${result.error}`);
    }
  } catch (error: any) {
    console.log('❌ AI调用失败（预期）');
    console.log(`   错误: ${error?.message || String(error)}`);
  } finally {
    // 恢复原始端点
    process.env.AI_ENDPOINT = originalEndpoint;
  }
  
  console.log('\n');
}

async function testWithMalformedJSON() {
  console.log('🧪 测试3: JSON格式错误处理测试');
  console.log('=' .repeat(50));
  
  // 创建一个会返回格式错误JSON的提示词
  const malformedPrompt = `请返回一个不完整的JSON格式，比如缺少括号或引号的内容。
  
  要求返回类似这样的内容（故意格式错误）：
  {
    "overallRating": 4,
    "healthFortune": "今日健康运势不错
    "luckyColor": "红色 (#FF0000)"
  `;
  
  try {
    console.log('📝 使用故意格式错误的提示词');
    console.log('🔄 开始调用AI服务（预期JSON解析会重试）...');
    
    const startTime = Date.now();
    const result = await callAIService(malformedPrompt, { maxRetries: 2 });
    const endTime = Date.now();
    
    console.log(`⏱️  总耗时: ${endTime - startTime}ms`);
    
    if (result.success) {
      console.log('✅ AI调用成功（JSON解析成功）');
      console.log(`   整体评级: ${result.data.overallRating}`);
    } else {
      console.log('❌ AI调用失败（JSON解析失败）');
      console.log(`   错误: ${result.error}`);
      console.log(`   原始内容: ${typeof result.rawContent === 'string' ? result.rawContent.substring(0, 200) + '...' : result.rawContent}`);
    }
  } catch (error: any) {
    console.error('❌ 测试异常:', error?.message || String(error));
  }
  
  console.log('\n');
}

async function testRetryConfiguration() {
  console.log('🧪 测试4: 重试配置测试');
  console.log('=' .repeat(50));
  
  // 临时修改为无效端点
  const originalEndpoint = process.env.AI_ENDPOINT;
  process.env.AI_ENDPOINT = 'https://httpstat.us/500'; // 返回500错误的测试端点
  
  try {
    const prompt = generateAIPrompt(testUser, testContext);
    console.log('📝 生成提示词成功');
    console.log('🔄 测试自定义重试配置（1次重试，短延迟）...');
    
    const startTime = Date.now();
    const result = await callAIService(prompt, { 
      maxRetries: 1, 
      baseDelay: 500,
      maxDelay: 1000 
    });
    const endTime = Date.now();
    
    console.log(`⏱️  总耗时: ${endTime - startTime}ms`);
    
    if (result.success) {
      console.log('✅ AI调用成功（意外）');
    } else {
      console.log('❌ AI调用失败（预期）');
      console.log(`   错误: ${result.error}`);
    }
  } catch (error: any) {
    console.log('❌ AI调用失败（预期）');
    console.log(`   错误: ${error?.message || String(error)}`);
  } finally {
    // 恢复原始端点
    process.env.AI_ENDPOINT = originalEndpoint;
  }
  
  console.log('\n');
}

async function runAllTests() {
  console.log('🚀 错误处理和重试机制测试开始\n');
  
  await testNormalAICall();
  await testWithInvalidEndpoint();
  await testWithMalformedJSON();
  await testRetryConfiguration();
  
  console.log('✅ 所有测试完成');
  console.log('\n📊 测试总结:');
  console.log('1. 正常AI调用 - 验证基本功能');
  console.log('2. 网络错误重试 - 验证网络异常时的重试机制');
  console.log('3. JSON解析重试 - 验证格式错误时的处理和重试');
  console.log('4. 重试配置 - 验证自定义重试参数的效果');
}

// 运行测试
if (require.main === module) {
  runAllTests().catch(console.error);
}

export { runAllTests };