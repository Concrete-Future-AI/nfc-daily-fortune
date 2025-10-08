import { getLocationByIP } from '../lib/location-weather'

async function testIPv6Fix() {
  console.log('='.repeat(80))
  console.log('🧪 测试IPv6映射地址修复')
  console.log('='.repeat(80))
  
  // 测试IPv6映射地址
  const ipv6MappedIP = '::ffff:175.13.219.100'
  console.log(`\n测试IPv6映射地址: ${ipv6MappedIP}`)
  
  try {
    const result = await getLocationByIP(ipv6MappedIP)
    console.log('✅ 定位结果:', result)
  } catch (error) {
    console.error('❌ 定位失败:', error)
  }
  
  // 测试普通IPv4地址
  const normalIP = '175.13.219.100'
  console.log(`\n测试普通IPv4地址: ${normalIP}`)
  
  try {
    const result = await getLocationByIP(normalIP)
    console.log('✅ 定位结果:', result)
  } catch (error) {
    console.error('❌ 定位失败:', error)
  }
  
  // 测试其他已知IP
  const testIP = '202.96.134.133'
  console.log(`\n测试其他已知IP: ${testIP}`)
  
  try {
    const result = await getLocationByIP(testIP)
    console.log('✅ 定位结果:', result)
  } catch (error) {
    console.error('❌ 定位失败:', error)
  }
}

testIPv6Fix().catch(console.error)