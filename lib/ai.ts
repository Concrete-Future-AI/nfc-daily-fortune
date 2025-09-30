export function generateAIPrompt(user: {
  name: string
  gender?: string
  dateOfBirth: Date
  birthPlace?: string
}) {
  const birthDateStr = user.dateOfBirth.toISOString().split('T')[0]
  
  return `请为以下用户生成今日健康运势内容，要求：

用户信息：
- 姓名：${user.name}
- 性别：${user.gender || '未指定'}
- 出生日期：${birthDateStr}
- 出生地点：${user.birthPlace || '未指定'}

请生成包含以下内容的运势：

1. **整体运势评级**（1-5星）
2. **健康运势**（详细分析，约100-150字）
3. **健康建议**（具体建议，约50-80字）
4. **财富运势**（简要分析，约30-50字）
5. **人际运势**（简要分析，约30-50字）
6. **幸运色**（格式：颜色名称 (Hex格式)，例如：豆沙绿 (#96B58D)）
7. **行动建议**（具体建议，约50-80字）

要求：
- 语言要温暖、关怀，适合年长用户阅读
- 内容要积极正面，体现东方文化特色
- 幸运色要使用传统中文颜色名称，并包含准确的Hex代码
- 健康建议要实用、温和
- 避免使用过于现代化或西化的表达

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

export async function callAIService(prompt: string): Promise<AIResponse> {
  const endpoint = process.env.AI_ENDPOINT
  const apiKey = process.env.AI_API_KEY
  const modelName = process.env.AI_MODEL_NAME || 'gpt-3.5-turbo'

  if (!endpoint || !apiKey) {
    throw new Error('AI服务配置不完整')
  }

  try {
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
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      throw new Error(`AI服务调用失败: ${response.status}`)
    }

    const data = await response.json()
    
    // 解析AI返回的内容
    const content = data.choices[0]?.message?.content
    if (!content) {
      throw new Error('AI服务返回内容为空')
    }

    // 尝试解析JSON
    try {
      const parsed = JSON.parse(content)
      return {
        success: true,
        data: parsed,
        rawResponse: data
      }
    } catch (jsonError) {
      // 如果JSON解析失败，返回原始内容
      return {
        success: false,
        error: 'AI返回内容格式错误',
        rawContent: content,
        rawResponse: data
      }
    }

  } catch (error) {
    console.error('AI服务调用失败:', error)
    throw error
  }
}