#!/usr/bin/env tsx

/**
 * 高德地图API测试脚本
 * 测试IP定位和天气查询功能
 */

import dotenv from 'dotenv';
import path from 'path';
import { getLocationByIP, getWeatherByAdcode, getLocationAndWeather, formatLocationInfo, formatWeatherInfo } from '../lib/location-weather';

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function testAmapAPI() {
  console.log('🗺️  高德地图API测试开始\n');
  
  // 检查API密钥
  console.log('🔑 检查API密钥...');
  const apiKey = process.env.AMAP_API_KEY;
  if (!apiKey) {
    console.error('❌ 未找到AMAP_API_KEY环境变量');
    return;
  }
  console.log(`✅ API密钥已配置: ${apiKey.substring(0, 10)}...\n`);
  
  // 测试IP定位
  console.log('📍 测试IP定位功能...');
  try {
    const location = await getLocationByIP();
    if (location) {
      console.log('✅ IP定位成功');
      console.log(`   省份: ${location.province}`);
      console.log(`   城市: ${location.city}`);
      console.log(`   区域代码: ${location.adcode}`);
      console.log(`   格式化: ${formatLocationInfo(location)}`);
      
      // 测试天气查询
      console.log('\n🌤️  测试天气查询功能...');
      try {
        const weather = await getWeatherByAdcode(location.adcode);
        if (weather) {
          console.log('✅ 天气查询成功');
          console.log(`   天气: ${weather.weather}`);
          console.log(`   温度: ${weather.temperature}°C`);
          console.log(`   风向: ${weather.winddirection}`);
          console.log(`   风力: ${weather.windpower}级`);
          console.log(`   湿度: ${weather.humidity}%`);
          console.log(`   更新时间: ${weather.reporttime}`);
          console.log(`   格式化: ${formatWeatherInfo(weather)}`);
        } else {
          console.log('❌ 天气查询失败 - 返回空结果');
        }
      } catch (error) {
        console.error('❌ 天气查询失败:', error);
      }
    } else {
      console.log('❌ IP定位失败 - 返回空结果');
    }
  } catch (error) {
    console.error('❌ IP定位失败:', error);
  }
  
  // 测试组合功能
  console.log('\n🔄 测试组合功能 (getLocationAndWeather)...');
  try {
    const result = await getLocationAndWeather();
    console.log('✅ 组合功能调用成功');
    console.log(`   位置结果: ${result.location ? '有数据' : '无数据'}`);
    console.log(`   天气结果: ${result.weather ? '有数据' : '无数据'}`);
    
    if (result.location) {
      console.log(`   位置信息: ${formatLocationInfo(result.location)}`);
    }
    if (result.weather) {
      console.log(`   天气信息: ${formatWeatherInfo(result.weather)}`);
    }
  } catch (error) {
    console.error('❌ 组合功能失败:', error);
  }
  
  console.log('\n📊 高德地图API测试完成');
}

// 运行测试
if (require.main === module) {
  testAmapAPI().catch(console.error);
}

export { testAmapAPI };