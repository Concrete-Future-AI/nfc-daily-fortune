import { getLocationAndWeather, formatLocationInfo, formatWeatherInfo } from '../lib/location-weather'

async function testLocationFix() {
  console.log('🧪 测试位置信息修复...')
  
  // 测试IPv6映射地址
  const testIP = '::ffff:61.149.89.186'
  console.log(`\n📍 测试IP: ${testIP}`)
  
  try {
    const { location, weather } = await getLocationAndWeather(testIP)
    
    console.log('\n📦 原始结果:')
    console.log('Location:', location)
    console.log('Weather:', weather)
    
    console.log('\n🎯 格式化结果:')
    const formattedLocation = location ? formatLocationInfo(location) : undefined
    const formattedWeather = weather ? formatWeatherInfo(weather) : undefined
    
    console.log('Formatted Location:', formattedLocation)
    console.log('Formatted Weather:', formattedWeather)
    
    // 模拟contextInfo对象
    const contextInfo = {
      currentTime: new Date().toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit'
      }),
      currentLocation: formattedLocation,
      weather: formattedWeather
    }
    
    console.log('\n🔧 ContextInfo对象:')
    console.log(JSON.stringify(contextInfo, null, 2))
    
    // 验证字段名称
    console.log('\n✅ 验证结果:')
    console.log(`currentLocation字段: ${contextInfo.currentLocation ? '✓ 有值' : '✗ 无值'}`)
    console.log(`weather字段: ${contextInfo.weather ? '✓ 有值' : '✗ 无值'}`)
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
  }
}

testLocationFix()