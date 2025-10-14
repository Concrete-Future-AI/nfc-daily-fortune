export function generateAIPrompt(user: {
  name: string
  gender?: string
  dateOfBirth: Date
  birthPlace?: string
}, contextInfo?: {
  currentTime?: string
  currentLocation?: string
  weather?: string
}) {
  const birthDateStr = user.dateOfBirth.toISOString().split('T')[0]
  
  // 构建上下文信息
  let contextSection = ''
  if (contextInfo) {
    contextSection = `

当前环境信息：
- 当前时间：${contextInfo.currentTime || '未知'}
- 当前所在地：${contextInfo.currentLocation || '未知'}
- 当前天气：${contextInfo.weather || '未知'}`
  }
  
  return `请为以下用户生成今日健康运势内容，要求：

用户信息：
- 姓名：${user.name}
- 性别：${user.gender || '未指定'}
- 出生日期：${birthDateStr}
- 出生地点：${user.birthPlace || '未指定'}${contextSection}

请生成包含以下内容的运势：

1. **整体运势评级**（1-5星）
2. **健康运势**（详细分析，约100-150字）
3. **健康建议**（具体建议，约50-80字）
4. **财富运势**（简要分析，约30-50字）
5. **人际运势**（简要分析，约30-50字）
6. **幸运色**（格式：颜色名称 (Hex格式)，例如：豆沙绿 (#96B58D)）
7. **行动建议**（具体建议，约50-80字）

重要要求：
- 语言要温暖、关怀，适合年长用户阅读
- 内容要积极正面，体现东方文化特色
- 幸运色要使用传统中文颜色名称，并包含准确的Hex代码
- 健康建议要实用、温和，必须结合当前天气条件给出针对性建议
- 行动建议必须考虑当前所在地的地理位置和天气状况，字数要达到50-80字
- 可以结合用户的出生地特色和当前所在地环境给出个性化建议
- 避免使用过于现代化或西化的表达
- **特别重要**：如果提供了天气信息，必须在健康运势、健康建议和行动建议中明确体现天气对健康的具体影响，如：
  * 气温高低对身体的影响
  * 湿度对关节、呼吸的影响  
  * 风力对外出活动的建议
  * 天气变化对情绪和睡眠的影响
- 如果提供了时间信息，请考虑时节对运势的影响
- 行动建议要具体实用，包含明确的时间、地点、活动建议

请以JSON格式返回，结构如下：
{
  "overallRating": 4,
  "healthFortune": "详细的健康运势分析...",
  "healthSuggestion": "具体的健康建议...",
  "wealthFortune": "财富运势简要分析...",
  "interpersonalFortune": "人际运势简要分析...",
  "luckyColor": "颜色名称 (#Hex代码)",
  "actionSuggestion": "行动建议..."
}`
}

interface AISuccessResponse {
  success: true
  data: {
    overallRating: number
    healthFortune: string
    healthSuggestion: string
    wealthFortune: string
    interpersonalFortune: string
    luckyColor: string
    actionSuggestion: string
    [key: string]: string | number
  }
  rawResponse: unknown
}

interface AIErrorResponse {
  success: false
  error: string
  rawContent: unknown
  rawResponse: unknown
}

export type AIResponse = AISuccessResponse | AIErrorResponse

// 重试配置
interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  backoffMultiplier: number
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1秒
  maxDelay: 10000, // 10秒
  backoffMultiplier: 2
}

// 定义错误类型接口
interface ErrorWithMessage {
  name?: string
  message: string
  stack?: string
}

// 类型守卫函数
function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  )
}

// 延迟函数
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 计算重试延迟时间（指数退避）
function calculateDelay(attempt: number, config: RetryConfig): number {
  const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1)
  return Math.min(delay, config.maxDelay)
}

// 判断错误是否可重试
function isRetryableError(error: unknown): boolean {
  if (!isErrorWithMessage(error)) {
    return false
  }
  
  // 网络错误、超时、5xx服务器错误等可重试
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return true // 网络错误
  }
  if (error.message.includes('timeout')) {
    return true // 超时错误
  }
  if (error.message.includes('AI服务调用失败')) {
    const statusMatch = error.message.match(/(\d{3})/)
    if (statusMatch) {
      const status = parseInt(statusMatch[1])
      return status >= 500 || status === 429 // 5xx错误或限流
    }
  }
  return false
}

export async function callAIService(prompt: string): Promise<AIResponse> {
  const endpoint = process.env.AI_ENDPOINT
  const apiKey = process.env.AI_API_KEY
  const modelName = process.env.AI_MODEL_NAME

  if (!endpoint || !apiKey || !modelName) {
    throw new Error('AI服务配置不完整')
  }

  // 输出完整的提示词内容到终端
  console.log('\n' + '='.repeat(80))
  console.log('🤖 AI运势生成 - 完整提示词内容')
  console.log('='.repeat(80))
  console.log(prompt)
  console.log('='.repeat(80) + '\n')

  const config = DEFAULT_RETRY_CONFIG
  let lastError: unknown

  for (let attempt = 1; attempt <= config.maxRetries + 1; attempt++) {
    try {
      console.log(`AI服务调用尝试 ${attempt}/${config.maxRetries + 1}`)
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`AI服务调用失败 (${response.status}): ${errorText}`)
      }

      const data = await response.json()
      console.log('AI服务响应:', {
        status: response.status,
        hasChoices: !!data.choices,
        choicesLength: data.choices?.length,
        firstChoice: data.choices?.[0]
      })

      if (!data.choices || data.choices.length === 0) {
        throw new Error('AI服务返回数据格式错误: 缺少choices')
      }

      const content = data.choices[0].message?.content
      if (!content) {
        throw new Error('AI服务返回数据格式错误: 缺少content')
      }

      console.log('AI返回内容:', {
        contentLength: content.length,
        contentPreview: content.substring(0, 200) + (content.length > 200 ? '...' : '')
      })

      // 尝试解析JSON，支持重试
      const parseResult = await tryParseJSON(content, attempt)
      
      if (parseResult.success) {
        console.log('AI服务调用成功')
        return {
          success: true,
          data: parseResult.data,
          rawResponse: data
        }
      } else {
        // 如果是最后一次尝试，返回错误
        if (attempt > config.maxRetries) {
          return {
            success: false,
            error: `AI返回内容格式错误 (${config.maxRetries + 1}次尝试后失败): ${parseResult.error}`,
            rawContent: content,
            rawResponse: data
          }
        }
      }

    } catch (error: unknown) {
       lastError = error
       const errorMessage = isErrorWithMessage(error) ? error.message : String(error)
       const errorStack = isErrorWithMessage(error) ? error.stack : undefined
       
       console.error(`AI服务调用失败 (尝试 ${attempt}):`, {
         error: errorMessage,
         stack: errorStack,
         attempt,
         maxRetries: config.maxRetries
       })

      // 如果是最后一次尝试，或者错误不可重试，直接抛出
      if (attempt > config.maxRetries || !isRetryableError(error)) {
        console.error(`AI服务调用最终失败 (${attempt}次尝试):`, error)
        throw error
      }

      // 等待后重试
      const delayMs = calculateDelay(attempt, config)
      console.log(`等待 ${delayMs}ms 后重试...`)
      await delay(delayMs)
    }
  }

  // 理论上不应该到达这里
  throw lastError || new Error('AI服务调用失败')
}

// 定义 JSON 解析结果类型
interface ParseResult {
  overallRating: number
  healthFortune: string
  healthSuggestion: string
  wealthFortune: string
  interpersonalFortune: string
  luckyColor: string
  actionSuggestion: string
  [key: string]: string | number
}

// JSON解析重试函数
async function tryParseJSON(content: string, attempt: number): Promise<{success: true, data: ParseResult} | {success: false, error: string}> {
  try {
    // 尝试直接解析
    const parsed = JSON.parse(content) as ParseResult
    return { success: true, data: parsed }
  } catch (jsonError: unknown) {
     const errorMessage = isErrorWithMessage(jsonError) ? jsonError.message : String(jsonError)
     console.warn(`JSON解析失败 (尝试 ${attempt}):`, {
       error: errorMessage,
       content: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
       contentLength: content.length
     })

     // 尝试清理和修复JSON
     try {
       const cleanedContent = cleanJSONContent(content)
       const parsed = JSON.parse(cleanedContent) as ParseResult
       console.log(`JSON清理后解析成功 (尝试 ${attempt})`)
       return { success: true, data: parsed }
     } catch (cleanError: unknown) {
       const cleanErrorMessage = isErrorWithMessage(cleanError) ? cleanError.message : String(cleanError)
       return { 
         success: false, 
         error: `原始解析失败: ${errorMessage}, 清理后解析失败: ${cleanErrorMessage}` 
       }
     }
  }
}

// 清理JSON内容
function cleanJSONContent(content: string): string {
  // 移除可能的markdown代码块标记
  let cleaned = content.replace(/```json\s*/g, '').replace(/```\s*$/g, '')
  
  // 移除前后空白
  cleaned = cleaned.trim()
  
  // 尝试提取JSON对象（查找第一个{到最后一个}）
  const firstBrace = cleaned.indexOf('{')
  const lastBrace = cleaned.lastIndexOf('}')
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1)
  }
  
  return cleaned
}