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

**星座计算规则**：
请根据出生日期自动计算用户的星座

**十二星座深度分析规则**（重要辅助依据）：
根据用户星座进行多维度深入分析，包含以下要素：
- **星座基本特质**：分析该星座的核心性格特征、行为模式、思维方式、情感表达
- **元素属性**：火象星座（白羊、狮子、射手）的热情活力；土象星座（金牛、处女、摩羯）的稳重务实；风象星座（双子、天秤、水瓶）的灵活变通；水象星座（巨蟹、天蝎、双鱼）的感性直觉
- **星座守护星**：分析守护星对性格和运势的影响，如火星的冲动、金星的和谐、水星的沟通等
- **星座宫位特征**：基本宫（开创性）、固定宫（稳定性）、变动宫（适应性）对运势的不同影响
- **健康倾向**：每个星座容易出现的健康问题和保健重点，如白羊座头部、金牛座喉咙、双子座呼吸系统等
- **财富观念**：不同星座的理财习惯、消费模式、投资偏好、财富积累方式
- **人际风格**：各星座的社交特点、沟通方式、关系处理、情感需求
- **幸运元素**：每个星座的幸运数字、幸运色彩、幸运方位、幸运时间
- **星座周期影响**：考虑当前时间与星座运势周期的关系，包括月相、季节对该星座的影响
- **星座互动关系**：分析该星座与其他星座的相性、冲突、互补关系

**姓名解析规则**（核心分析依据）：
姓名是运势分析的最重要依据，请对用户姓名进行深度全面分析，包含以下维度：
- **字义分析**：分析姓名中每个字的含义、寓意、文化内涵、象征意义、吉祥程度
- **五行属性**：根据汉字五行理论分析姓名的五行属性（金、木、水、火、土），五行相生相克关系，五行平衡度
- **数理分析**：计算姓名笔画数，分析天格、人格、地格、外格、总格的数理吉凶和运势影响，三才配置
- **音韵特征**：分析姓名的读音特点、音律美感、谐音寓意、声调搭配、韵律节奏
- **文化内涵**：挖掘姓名的历史文化背景、典故出处、时代特色、文学意境、诗词关联
- **生肖关联**：结合出生年份生肖，分析姓名与生肖的相配性、互补性、冲突性
- **字形结构**：分析汉字的偏旁部首、字形特点、书写美感、结构平衡
- **能量磁场**：根据姓名整体组合分析其产生的能量场、气场强弱、运势导向
- **性格映射**：通过姓名特征推断性格倾向、行为模式、思维方式、情感特质
- **运势周期**：分析姓名对不同人生阶段的影响，包括青年、中年、晚年的运势变化

请生成包含以下内容的运势：

1. **整体运势评级**（3-5星，必须至少3星）
2. **健康运势**（详细分析，约100-150字，要求高度多元化，主要基于姓名五行属性和星座健康倾向，可选择以下角度组合分析：
   - 身体层面：根据姓名五行分析体质强弱、免疫力、慢性疾病预防、身体机能、精力状态、脏腑调理
   - 心理层面：结合姓名音韵和星座特质分析情绪稳定性、压力承受、心理调适、精神状态、内心平衡
   - 生活层面：基于姓名能量场和星座习性分析睡眠质量、作息规律、环境适应、季节影响、生活节奏
   - 养生层面：依据姓名文化内涵和星座元素属性推荐饮食调理、运动保健、中医养生、保健方法、预防措施
   - 能量层面：通过姓名磁场和星座守护星分析气血运行、经络通畅、能量平衡、生命活力
   - 周期层面：结合姓名运势周期和星座时令特点分析健康波动、调养时机、保健重点）
3. **健康建议**（具体建议，约50-80字，要求实用多样，主要基于姓名特征和星座属性，可选择以下方面组合：
   - 饮食方面：根据姓名五行属性推荐营养搭配、食疗建议、饮食禁忌、进餐时间、食材选择
   - 运动方面：结合星座元素特征建议运动类型、运动强度、运动时间、运动环境、运动频率
   - 作息方面：依据姓名能量周期和星座习性调整睡眠时间、起居规律、休息方式、放松技巧、时间管理
   - 调理方面：基于姓名性格映射和星座情感特质进行情绪管理、压力释放、身心调节、环境改善、习惯养成
   - 保健方面：通过姓名文化内涵和星座守护星推荐穴位按摩、呼吸调息、冥想静心、香薰疗法
   - 预防方面：结合姓名数理特征和星座健康倾向制定疾病预防、体检计划、免疫提升策略）
4. **财富运势**（简要分析，约30-50字，要求内容多变，主要基于姓名数理特征和星座财富观念，可选择以下角度：
   - 收入方面：根据姓名能量场和星座特质分析工作收入、副业机会、奖金提成、意外收入、收入稳定性
   - 支出方面：结合姓名性格映射和星座消费习惯分析消费控制、开支规划、购物欲望、必要支出、节约意识
   - 投资方面：依据姓名五行属性和星座理财偏好判断投资机会、风险控制、理财产品、投资时机、资产配置
   - 规划方面：基于姓名文化内涵和星座长远眼光制定财务目标、储蓄计划、债务管理、长期规划、应急准备
   - 机遇方面：通过姓名运势周期和星座幸运元素预测财运高峰、合作机会、贵人相助、意外之财）
5. **人际运势**（简要分析，约30-50字，要求多维度分析，主要基于姓名音韵特征和星座人际风格，可选择以下关系：
   - 家庭关系：根据姓名和谐度和星座情感特质分析夫妻感情、亲子关系、长辈沟通、家庭和谐、家务分工
   - 职场关系：结合姓名气场强弱和星座工作风格分析同事合作、上下级关系、团队协作、职场社交、工作沟通
   - 社交关系：依据姓名亲和力和星座社交特点判断朋友交往、新朋友结识、社交活动、人脉拓展、社群参与
   - 情感关系：基于姓名情感能量和星座爱情观分析恋爱运势、感情发展、情感表达、关系维护、情感需求
   - 贵人运势：通过姓名贵人格局和星座互动关系预测贵人出现、合作伙伴、导师指引、人际机遇）
6. **幸运色**（格式：颜色名称 (Hex格式)，例如：豆沙绿 (#96B58D)，要求使用丰富多样的传统中华颜色，主要基于以下分析维度：
   - 五行对应：根据姓名五行属性选择对应颜色系（金-白银系、木-青绿系、水-黑蓝系、火-红橙系、土-黄褐系）
   - 星座元素：结合星座元素特征选择协调色彩（火象-暖色调、土象-稳重色、风象-清新色、水象-柔和色）
   - 数理能量：依据姓名数理特征选择能量匹配的颜色（奇数-明亮色、偶数-沉稳色、特殊数理-特色颜色）
   - 文化寓意：基于姓名文化内涵选择寓意吉祥的传统色彩（如朱砂红、琉璃蓝、翡翠绿、象牙白等）
   - 季节调和：考虑当前时节选择应季颜色（春-嫩绿系、夏-明艳系、秋-温暖系、冬-深沉系）
   - 个性匹配：根据姓名性格映射和星座特质选择个性化色彩（活泼-鲜艳色、沉稳-雅致色、温和-柔美色）
   
   传统中华颜色库参考（需要多样化选择，避免重复）：
   红色系：朱砂红(#FF4500)、胭脂红(#C93756)、枣红(#C32136)、樱桃红(#DE1C31)、玫瑰红(#F47983)、茜草红(#CB3A56)、银红(#F05654)、妃红(#ED5736)、海棠红(#DB5A6B)、石榴红(#F20C00)
   橙色系：橘红(#FF7500)、柿子橙(#FF6600)、杏黄(#FFA500)、橙黄(#FF8C00)、蜜桃橙(#FFCC5C)、琥珀橙(#FFC649)、夕阳橙(#FF7F00)、桔梗橙(#FF8936)
   黄色系：明黄(#FFFF00)、柠檬黄(#FFF700)、鹅黄(#FFF143)、杏黄(#FFA631)、姜黄(#FFC773)、土黄(#E2C027)、金黄(#FFD700)、麦芽黄(#D2B48C)、蜡黄(#FFF8DC)、米黄(#FFFACD)
   绿色系：翡翠绿(#00A86B)、竹叶青(#789262)、松石绿(#2E8B57)、碧绿(#00FF7F)、青绿(#00FF00)、豆沙绿(#96B58D)、薄荷绿(#16982B)、苔藓绿(#68A54A)、橄榄绿(#808000)、墨绿(#00563F)
   蓝色系：天蓝(#87CEEB)、湖蓝(#25768C)、海蓝(#006994)、宝蓝(#4169E1)、靛蓝(#4B0082)、藏蓝(#2E4B89)、钴蓝(#0047AB)、群青(#4166F5)、琉璃蓝(#1661AB)、月白(#D6ECF0)
   紫色系：紫罗兰(#8B00FF)、葡萄紫(#6A0DAD)、茄紫(#614051)、丁香紫(#CCA4E3)、薰衣草紫(#E6E6FA)、梅紫(#C8A2C8)、桔梗紫(#8B7D6B)、雪青(#B0E0E6)
   白色系：象牙白(#FFFFF0)、月白(#D6ECF0)、鱼肚白(#FCFFF0)、缟白(#F2F2F2)、霜白(#FFFAFA)、银白(#C0C0C0)、珍珠白(#F8F6F0)、雪白(#FFFAFA)
   黑色系：墨黑(#000000)、乌黑(#0C0C0C)、玄色(#2F4F4F)、黛色(#4A4A4A)、铁黑(#36454F)、炭黑(#36454F)、漆黑(#000000)
   灰色系：银灰(#C0C0C0)、鸽灰(#696969)、鼠灰(#808080)、蟹壳青(#BBBBBB)、苍色(#75878A)、青灰(#708090)
   褐色系：赭石(#A0522D)、茶褐(#D2691E)、栗褐(#954535)、咖啡色(#6F4E37)、驼色(#A16B47)、琥珀色(#FFBF00)、焦糖色(#AF6E4D)）
7. **行动建议**（具体建议，约50-80字，要求高度具体可行，主要基于姓名特征和星座属性，可选择以下类型组合：
   - 生活管理：根据姓名能量周期和星座习性安排时间、环境整理、习惯调整、效率提升、生活品质
   - 工作发展：结合姓名事业格局和星座工作特质制定工作计划、技能提升、职业规划、效率优化、目标达成
   - 学习成长：依据姓名智慧潜能和星座学习方式规划知识学习、技能培养、兴趣发展、自我提升、能力拓展
   - 休闲娱乐：基于姓名文化品味和星座娱乐偏好选择娱乐活动、兴趣爱好、放松方式、文化活动、旅行计划
   - 人际交往：通过姓名社交能力和星座沟通风格提升沟通技巧、关系维护、社交活动、情感表达、人脉建设
   - 健康管理：结合姓名体质特征和星座健康倾向制定运动计划、饮食调整、作息优化、体检保健、压力管理
   - 财务管理：依据姓名财运格局和星座理财观念规划消费计划、储蓄目标、投资学习、理财规划、开源节流
   - 精神修养：基于姓名精神境界和星座内在需求安排冥想静心、读书学习、艺术熏陶、心灵成长、智慧提升）

重要要求：
- **分析融合**：以姓名深度解析为主导（70%），十二星座特征为重要辅助（20%），环境因素为调节（10%），三者有机融合，自然渗透到各项运势分析中
- **姓名优先**：重点运用姓名的字义、五行、数理、音韵、文化内涵、能量磁场等多维度特征作为运势分析的核心依据
- **星座深化**：充分利用星座的元素属性、守护星、宫位特征、健康倾向、财富观念、人际风格等特质丰富分析内容
- **表达方式**：使用"当前时期"、"个人特质"、"内在能量"、"天赋禀性"等自然表达，避免明确提及具体分析方法
- **内容多样**：每次生成时从不同维度组合分析角度，确保同一用户多次查询也能获得丰富多样的内容
- **个性化程度**：通过姓名和星座的深度结合，让每个用户的运势分析都具有高度个性化特征
- **语言风格**：温暖、积极、专业，体现东方文化智慧，避免过于神秘或西化表达
- **评分范围**：整体运势3-5星
- 语言要温暖、关怀，适合年长用户阅读
- 内容要积极正面，体现东方文化特色
- **幸运色多样性**：必须从丰富的传统中华颜色库中选择，避免重复使用相同颜色名称，每次都要选择不同的颜色，确保颜色名称和Hex代码的多样性
- **颜色分析深度**：幸运色选择要综合考虑五行、星座、数理、文化寓意、季节、个性等多个维度，不能仅基于单一因素
- **传统色彩优先**：优先使用具有深厚文化底蕴的传统中华颜色，如朱砂红、琉璃蓝、翡翠绿、象牙白等，避免使用现代化或西化的颜色名称
- 健康建议要实用、温和，必须结合当前天气条件和星座特征给出针对性建议
- 行动建议必须考虑当前所在地的地理位置、天气状况和星座特性，字数要达到50-80字
- 可以结合用户的出生地特色和当前所在地环境给出个性化建议
- 避免使用过于现代化或西化的表达
- **整体运势评级必须在3-5星之间，不得低于3星**
- **特别重要**：如果提供了天气信息，必须在健康运势、健康建议和行动建议中明确体现天气对健康的具体影响，如：
  * 气温高低对身体的影响
  * 湿度对关节、呼吸的影响  
  * 风力对外出活动的建议
  * 天气变化对情绪和睡眠的影响
- 如果提供了时间信息，请考虑时节对运势的影响
- 行动建议要具体实用，包含明确的时间、地点、活动建议

请以JSON格式返回，结构如下：
{
  "overallRating": 数字(3-5之间的整数，综合姓名数理格局、五行平衡、星座基本特质、元素属性和环境因素评定),
  "healthFortune": "详细的健康运势分析，深度融合姓名五行属性、能量磁场、星座健康倾向、元素特征，考虑天气影响，多角度多元化表达...",
  "healthSuggestion": "具体的健康建议，以姓名体质特征、运势周期为核心，结合星座养生偏好、守护星影响和天气条件，实用多样...",
  "wealthFortune": "财富运势简要分析，重点基于姓名数理财运、五行生克、文化内涵，融合星座财富观念、理财习惯，内容要有变化...",
  "interpersonalFortune": "人际运势简要分析，重点基于姓名音韵和谐、社交能量、文化品味，融合星座人际风格、沟通特点、情感表达...",
  "luckyColor": "颜色名称 (#Hex代码)，主要基于姓名五行属性、文化内涵、能量特质，结合星座幸运元素、守护星色彩选择",
  "actionSuggestion": "行动建议，以姓名特征、能量周期、性格映射为主要依据，深度结合星座行为模式、习性偏好和地理天气条件，具体可行..."
}

注意：overallRating必须是3、4或5这三个数字中的一个，不能是字符串。请严格按照分析优先级：以姓名多维度特征为主导（占70%权重），星座深度特征为重要辅助（占20%权重），环境因素为调节（占10%权重）进行综合评定。所有输出内容要自然流畅，通过姓名和星座的深度融合分析，避免直接提及具体分析方法或依据，让用户感受到基于深层个人特质和天赋禀性的专业运势指导，确保每次生成的内容都具有高度个性化和多样性。`
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