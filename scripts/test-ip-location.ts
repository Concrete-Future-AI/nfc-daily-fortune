#!/usr/bin/env tsx

/**
 * IP定位功能测试脚本
 * 专门测试从IP获取地址的功能
 */

import dotenv from 'dotenv';
import path from 'path';
import { getLocationByIP, getLocationByBirthPlace, formatLocationInfo } from '../lib/location-weather';

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function testIPLocation() {
  console.log('🌍 IP定位功能测试开始\n');
  
  // 1. 测试IP定位（不指定IP，使用当前IP）
  console.log('📍 测试1: 当前IP定位...');
  try {
    const currentLocation = await getLocationByIP();
    if (currentLocation) {
      console.log('✅ 当前IP定位成功');
      console.log(`   省份: ${currentLocation.province}`);
      console.log(`   城市: ${currentLocation.city}`);
      console.log(`   区域代码: ${currentLocation.adcode}`);
      console.log(`   格式化: ${formatLocationInfo(currentLocation)}`);
    } else {
      console.log('⚠️  当前IP定位失败或返回空值');
    }
  } catch (error) {
    console.error('❌ 当前IP定位异常:', error);
  }
  
  // 2. 测试指定IP定位（使用一些公开的IP地址）
  const testIPs = [
    '8.8.8.8',      // Google DNS
    '114.114.114.114', // 国内DNS
    '202.96.134.133'   // 上海电信DNS
  ];
  
  console.log('\n📍 测试2: 指定IP定位...');
  for (const ip of testIPs) {
    console.log(`\n测试IP: ${ip}`);
    try {
      const location = await getLocationByIP(ip);
      if (location) {
        console.log('✅ IP定位成功');
        console.log(`   省份: ${location.province}`);
        console.log(`   城市: ${location.city}`);
        console.log(`   区域代码: ${location.adcode}`);
        console.log(`   格式化: ${formatLocationInfo(location)}`);
      } else {
        console.log('⚠️  IP定位失败或返回空值');
      }
    } catch (error) {
      console.error('❌ IP定位异常:', error);
    }
  }
  
  // 3. 测试出生地定位
  const testBirthPlaces = [
    '北京市',
    '上海市',
    '广州市',
    '深圳市',
    '杭州市',
    '成都市'
  ];
  
  console.log('\n📍 测试3: 出生地定位...');
  for (const birthPlace of testBirthPlaces) {
    console.log(`\n测试出生地: ${birthPlace}`);
    try {
      const location = await getLocationByBirthPlace(birthPlace);
      if (location) {
        console.log('✅ 出生地定位成功');
        console.log(`   省份: ${location.province}`);
        console.log(`   城市: ${location.city}`);
        console.log(`   区域代码: ${location.adcode}`);
        console.log(`   格式化: ${formatLocationInfo(location)}`);
      } else {
        console.log('❌ 出生地定位失败');
      }
    } catch (error) {
      console.error('❌ 出生地定位异常:', error);
    }
  }
  
  console.log('\n📊 IP定位功能测试完成');
}

// 运行测试
if (require.main === module) {
  testIPLocation().catch(console.error);
}

export { testIPLocation };