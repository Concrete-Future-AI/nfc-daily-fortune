#!/usr/bin/env tsx

/**
 * 高德地图API调试脚本
 * 详细查看API响应内容
 */

import dotenv from 'dotenv';
import path from 'path';

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function debugAmapAPI() {
  console.log('🔍 高德地图API调试开始\n');
  
  const apiKey = process.env.AMAP_API_KEY || 'e3a41f92bb0cf57fd545dbb874a691fd';
  console.log(`🔑 使用API密钥: ${apiKey.substring(0, 10)}...\n`);
  
  // 测试IP定位API
  console.log('📍 调试IP定位API...');
  try {
    const url = `https://restapi.amap.com/v3/ip?key=${apiKey}`;
    console.log(`请求URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`响应状态: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    console.log('完整响应数据:', JSON.stringify(data, null, 2));
    
    if (data.status === '1') {
      console.log('✅ IP定位成功');
      console.log(`省份: "${data.province}"`);
      console.log(`城市: "${data.city}"`);
      console.log(`区域代码: "${data.adcode}"`);
      
      // 如果有有效的adcode，测试天气API
      if (data.adcode && data.adcode !== '') {
        console.log('\n🌤️  调试天气查询API...');
        const weatherUrl = `https://restapi.amap.com/v3/weather/weatherInfo?key=${apiKey}&city=${data.adcode}&extensions=base`;
        console.log(`天气请求URL: ${weatherUrl}`);
        
        const weatherResponse = await fetch(weatherUrl);
        console.log(`天气响应状态: ${weatherResponse.status} ${weatherResponse.statusText}`);
        
        const weatherData = await weatherResponse.json();
        console.log('天气完整响应数据:', JSON.stringify(weatherData, null, 2));
      } else {
        console.log('⚠️  adcode为空，无法查询天气');
      }
    } else {
      console.log('❌ IP定位失败');
      console.log(`错误信息: ${data.info}`);
      console.log(`错误代码: ${data.infocode}`);
    }
    
  } catch (error) {
    console.error('❌ API调用失败:', error);
  }
  
  // 测试使用固定城市代码查询天气
  console.log('\n🏙️  测试固定城市代码查询天气 (北京: 110000)...');
  try {
    const weatherUrl = `https://restapi.amap.com/v3/weather/weatherInfo?key=${apiKey}&city=110000&extensions=base`;
    console.log(`固定城市天气请求URL: ${weatherUrl}`);
    
    const weatherResponse = await fetch(weatherUrl);
    console.log(`固定城市天气响应状态: ${weatherResponse.status} ${weatherResponse.statusText}`);
    
    const weatherData = await weatherResponse.json();
    console.log('固定城市天气完整响应数据:', JSON.stringify(weatherData, null, 2));
  } catch (error) {
    console.error('❌ 固定城市天气查询失败:', error);
  }
  
  console.log('\n📊 调试完成');
}

// 运行调试
if (require.main === module) {
  debugAmapAPI().catch(console.error);
}

export { debugAmapAPI };