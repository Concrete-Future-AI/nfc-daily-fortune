/**
 * 地理位置和天气查询工具函数
 * 使用高德地图API进行IP定位和天气查询
 */

// 高德地图API密钥
const AMAP_API_KEY = 'e3a41f92bb0cf57fd545dbb874a691fd'

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
    const url = new URL('https://restapi.amap.com/v3/ip')
    url.searchParams.append('key', AMAP_API_KEY)
    if (ip) {
      url.searchParams.append('ip', ip)
    }

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

    if (data.status !== '1') {
      console.error('IP定位失败:', data.info)
      return null
    }

    return {
      province: data.province,
      city: data.city,
      adcode: data.adcode,
    }
  } catch (error) {
    console.error('IP定位服务调用失败:', error)
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
    const url = new URL('https://restapi.amap.com/v3/weather/weatherInfo')
    url.searchParams.append('key', AMAP_API_KEY)
    url.searchParams.append('city', adcode)
    url.searchParams.append('extensions', extensions)

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

    if (data.status !== '1') {
      console.error('天气查询失败:', data.info)
      return null
    }

    // 返回实况天气数据
    if (extensions === 'base' && data.lives && data.lives.length > 0) {
      const weather = data.lives[0]
      return {
        weather: weather.weather,
        temperature: weather.temperature,
        winddirection: weather.winddirection,
        windpower: weather.windpower,
        humidity: weather.humidity,
        reporttime: weather.reporttime,
      }
    }

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

  if (location && location.adcode) {
    weather = await getWeatherByAdcode(location.adcode)
  }

  return {
    location,
    weather,
  }
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