/**
 * 地理位置和天气查询工具函数
 * 使用高德地图API进行IP定位和天气查询
 */

// 高德地图API密钥
const AMAP_API_KEY = process.env.AMAP_API_KEY || 'e3a41f92bb0cf57fd545dbb874a691fd'

// IP定位接口返回类型
interface IPLocationResponse {
  status: string
  info: string
  infocode: string
  province: string
  city: string
  adcode: string
  rectangle: string
}

// 天气查询接口返回类型
interface WeatherResponse {
  status: string
  count: string
  info: string
  infocode: string
  lives?: Array<{
    province: string
    city: string
    adcode: string
    weather: string
    temperature: string
    winddirection: string
    windpower: string
    humidity: string
    reporttime: string
  }>
  forecasts?: Array<{
    city: string
    adcode: string
    province: string
    reporttime: string
    casts: Array<{
      date: string
      week: string
      dayweather: string
      nightweather: string
      daytemp: string
      nighttemp: string
      daywind: string
      nightwind: string
      daypower: string
      nightpower: string
    }>
  }>
}

// 位置信息类型
export interface LocationInfo {
  province: string
  city: string
  adcode: string
}

// 天气信息类型
export interface WeatherInfo {
  weather: string
  temperature: string
  winddirection: string
  windpower: string
  humidity: string
  reporttime: string
}

/**
 * 根据IP地址获取地理位置信息
 * @param ip IP地址，如果不提供则使用请求方的IP
 * @returns 位置信息
 */
export async function getLocationByIP(ip?: string): Promise<LocationInfo | null> {
  try {
    // 处理IPv6映射的IPv4地址（如 ::ffff:175.13.219.100 -> 175.13.219.100）
    let processedIp = ip
    if (ip && ip.startsWith('::ffff:')) {
      processedIp = ip.replace('::ffff:', '')
      console.log('🔄 IPv6映射地址转换:', `${ip} -> ${processedIp}`)
    }
    
    // 打印高德API相关变量
    console.log('\n' + '🗺️'.repeat(20) + ' 高德API IP定位调用 ' + '🗺️'.repeat(20))
    console.log('📍 API密钥:', AMAP_API_KEY ? `${AMAP_API_KEY.substring(0, 8)}...` : '未设置')
    console.log('🌐 原始IP:', ip || '当前请求IP')
    console.log('🌐 处理后IP:', processedIp || '当前请求IP')
    
    const url = new URL('https://restapi.amap.com/v3/ip')
    url.searchParams.append('key', AMAP_API_KEY)
    if (processedIp) {
      url.searchParams.append('ip', processedIp)
    }
    
    console.log('🔗 请求URL:', url.toString())

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('IP定位请求失败:', response.status, response.statusText)
      return null
    }

    const data: IPLocationResponse = await response.json()
    
    console.log('📦 API响应状态:', data.status)
    console.log('📦 API响应信息:', data.info)
    console.log('📦 API响应码:', data.infocode)
    console.log('📦 原始响应数据:', JSON.stringify(data, null, 2))

    if (data.status !== '1') {
      console.error('IP定位失败:', data.info)
      return null
    }

    // 处理高德API返回数组或空值的情况
    const province = Array.isArray(data.province) ? '' : data.province || ''
    const city = Array.isArray(data.city) ? '' : data.city || ''
    const adcode = Array.isArray(data.adcode) ? '' : data.adcode || ''
    
    console.log('🏛️ 处理后的省份:', province)
    console.log('🏙️ 处理后的城市:', city)
    console.log('🔢 处理后的区域码:', adcode)

    // 如果IP定位返回空值，返回null
    if (!province && !city && !adcode) {
      console.log('❌ IP定位返回空值')
      console.log('=' .repeat(80))
      return null
    }

    const result = {
      province,
      city,
      adcode,
    }
    
    console.log('✅ IP定位成功，返回结果:', JSON.stringify(result, null, 2))
    console.log('=' .repeat(80))
    
    return result
  } catch (error) {
    console.error('IP定位服务调用失败:', error)
    return null
  }
}

/**
 * 根据出生地名称获取位置信息（用于获取出生地的天气）
 * @param birthPlace 出生地名称，如"北京市"、"上海市"等
 */
export async function getLocationByBirthPlace(birthPlace: string): Promise<LocationInfo | null> {
  try {
    // 打印高德API相关变量
    console.log('\n' + '🏠'.repeat(20) + ' 高德API 出生地查询 ' + '🏠'.repeat(20))
    console.log('📍 API密钥:', AMAP_API_KEY ? `${AMAP_API_KEY.substring(0, 8)}...` : '未设置')
    console.log('🏙️ 出生地名称:', birthPlace)
    
    const url = new URL('https://restapi.amap.com/v3/geocode/geo')
    url.searchParams.append('key', AMAP_API_KEY)
    url.searchParams.append('address', birthPlace)
    
    console.log('🔗 请求URL:', url.toString())

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('地理编码请求失败:', response.status, response.statusText)
      return null
    }

    const data = await response.json()
    
    console.log('📦 API响应状态:', data.status)
    console.log('📦 API响应信息:', data.info)
    console.log('📦 原始响应数据:', JSON.stringify(data, null, 2))

    if (data.status !== '1' || !data.geocodes || data.geocodes.length === 0) {
      console.error('地理编码失败:', data.info)
      console.log('=' .repeat(80))
      return null
    }

    const geocode = data.geocodes[0]
    const result = {
      province: geocode.province || '',
      city: geocode.city || '',
      adcode: geocode.adcode || '',
    }
    
    console.log('✅ 出生地查询成功，返回结果:', JSON.stringify(result, null, 2))
    console.log('=' .repeat(80))
    
    return result
  } catch (error) {
    console.error('地理编码服务调用失败:', error)
    return null
  }
}

/**
 * 根据城市编码获取天气信息
 * @param adcode 城市编码
 * @param extensions 天气类型，'base'为实况天气，'all'为预报天气
 * @returns 天气信息
 */
export async function getWeatherByAdcode(
  adcode: string,
  extensions: 'base' | 'all' = 'base'
): Promise<WeatherInfo | null> {
  try {
    // 打印高德API相关变量
    console.log('\n' + '🌤️'.repeat(20) + ' 高德API 天气查询 ' + '🌤️'.repeat(20))
    console.log('📍 API密钥:', AMAP_API_KEY ? `${AMAP_API_KEY.substring(0, 8)}...` : '未设置')
    console.log('🔢 城市编码:', adcode)
    console.log('📊 查询类型:', extensions === 'base' ? '实况天气' : '预报天气')
    
    const url = new URL('https://restapi.amap.com/v3/weather/weatherInfo')
    url.searchParams.append('key', AMAP_API_KEY)
    url.searchParams.append('city', adcode)
    url.searchParams.append('extensions', extensions)
    
    console.log('🔗 请求URL:', url.toString())

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('天气查询请求失败:', response.status, response.statusText)
      return null
    }

    const data: WeatherResponse = await response.json()
    
    console.log('📦 API响应状态:', data.status)
    console.log('📦 API响应信息:', data.info)
    console.log('📦 API响应码:', data.infocode)
    console.log('📦 原始响应数据:', JSON.stringify(data, null, 2))

    if (data.status !== '1') {
      console.error('天气查询失败:', data.info)
      console.log('=' .repeat(80))
      return null
    }

    // 返回实况天气数据
    if (extensions === 'base' && data.lives && data.lives.length > 0) {
      const weather = data.lives[0]
      const result = {
        weather: weather.weather,
        temperature: weather.temperature,
        winddirection: weather.winddirection,
        windpower: weather.windpower,
        humidity: weather.humidity,
        reporttime: weather.reporttime,
      }
      
      console.log('✅ 天气查询成功，返回结果:', JSON.stringify(result, null, 2))
      console.log('=' .repeat(80))
      
      return result
    }

    console.log('❌ 天气数据为空或格式不正确')
    console.log('=' .repeat(80))
    return null
  } catch (error) {
    console.error('天气查询服务调用失败:', error)
    return null
  }
}

/**
 * 获取客户端IP地址的位置和天气信息
 * @param ip 客户端IP地址
 * @returns 包含位置和天气信息的对象
 */
export async function getLocationAndWeather(ip?: string): Promise<{
  location: LocationInfo | null
  weather: WeatherInfo | null
}> {
  const location = await getLocationByIP(ip)
  let weather: WeatherInfo | null = null

  if (location?.adcode) {
    weather = await getWeatherByAdcode(location.adcode)
  }

  return { location, weather }
}

/**
 * 获取完整的上下文信息，包括当前位置、出生地位置和天气
 * @param birthPlace 用户出生地
 * @param ip 可选的IP地址
 */
export async function getFullContextInfo(birthPlace?: string, ip?: string): Promise<{
  currentLocation: LocationInfo | null
  birthLocation: LocationInfo | null
  weather: WeatherInfo | null
}> {
  // 获取当前位置
  const currentLocation = await getLocationByIP(ip)
  
  // 获取出生地位置
  let birthLocation: LocationInfo | null = null
  if (birthPlace) {
    birthLocation = await getLocationByBirthPlace(birthPlace)
  }
  
  // 获取天气信息（优先使用当前位置，如果没有则使用出生地）
  let weather: WeatherInfo | null = null
  const locationForWeather = currentLocation || birthLocation
  if (locationForWeather?.adcode) {
    weather = await getWeatherByAdcode(locationForWeather.adcode)
  }

  return { currentLocation, birthLocation, weather }
}

/**
 * 格式化天气信息为可读字符串
 * @param weather 天气信息
 * @returns 格式化的天气描述
 */
export function formatWeatherInfo(weather: WeatherInfo): string {
  return `${weather.weather}，气温${weather.temperature}°C，${weather.winddirection}风${weather.windpower}级，湿度${weather.humidity}%`
}

/**
 * 格式化位置信息为可读字符串
 * @param location 位置信息
 * @returns 格式化的位置描述
 */
export function formatLocationInfo(location: LocationInfo): string {
  if (location.province === location.city) {
    return location.city
  }
  return `${location.province}${location.city}`
}