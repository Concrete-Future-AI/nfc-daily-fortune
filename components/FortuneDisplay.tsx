'use client'

import { useState, useEffect } from 'react'

interface FortuneData {
  id: string
  nfcUid: string
  date: string
  overallRating: number
  luckyColor: string
  luckyColorDescription: string
  healthFortune: string
  wealthFortune: string
  interpersonalFortune: string
  createdAt: string
  updatedAt: string
}

interface FortuneDisplayProps {
  nfcUid: string
  onBack: () => void
}

export default function FortuneDisplay({ nfcUid, onBack }: FortuneDisplayProps) {
  const [fortune, setFortune] = useState<FortuneData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasInitialized, setHasInitialized] = useState(false)

  useEffect(() => {
    // 防止重复初始化
    if (hasInitialized) return

    setHasInitialized(true)
    
    const fetchFortune = async () => {
      try {
        const response = await fetch(`/api/fortune/${nfcUid}`)
        if (!response.ok) {
          throw new Error('获取运势失败')
        }
        const data = await response.json()
        if (data) {
          setFortune(data)
          setIsLoading(false)
          return true // 表示获取成功
        }
        return false // 表示还没有数据
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取运势失败')
        setIsLoading(false)
        return false
      }
    }

    // 立即获取一次
    fetchFortune().then(success => {
      if (success) return // 如果成功获取到数据，就不需要轮询了

      // 只有在没有获取到数据时才开始轮询
      const interval = setInterval(async () => {
        const success = await fetchFortune()
        if (success) {
          clearInterval(interval)
        }
      }, 5000)

      // 设置超时，30秒后停止轮询
      const timeout = setTimeout(() => {
        clearInterval(interval)
        if (!fortune) {
          setError('运势生成超时，请稍后重试')
          setIsLoading(false)
        }
      }, 30000)

      return () => {
        clearInterval(interval)
        clearTimeout(timeout)
      }
    })
  }, [nfcUid, hasInitialized])

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        style={{
          color: i < rating ? '#FFD700' : '#E0E0E0',
          fontSize: '24px',
          marginRight: '4px'
        }}
      >
        ★
      </span>
    ))
  }

  // 从幸运色字符串中提取Hex颜色代码
  const extractColorCode = (colorString: string): string => {
    if (!colorString) return '#789262' // 默认颜色
    
    // 匹配Hex颜色代码的正则表达式
    const hexMatch = colorString.match(/#[0-9A-Fa-f]{6}/)
    if (hexMatch) {
      return hexMatch[0]
    }
    
    // 如果没有找到Hex代码，检查是否本身就是Hex格式
    if (colorString.startsWith('#') && colorString.length === 7) {
      return colorString
    }
    
    // 如果都不是，返回默认颜色
    return '#789262'
  }

  const formatDate = (dateString: string) => {
    if (!dateString) {
      // 如果没有日期字符串，使用当前日期
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      return `${year}年${month}月${day}日`
    }
    
    const date = new Date(dateString)
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      // 如果日期无效，使用当前日期
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      return `${year}年${month}月${day}日`
    }
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}年${month}月${day}日`
  }

  if (isLoading) {
    return (
      <div style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        fontFamily: 'var(--font-wenkai), system-ui, sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: 'rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          color: '#5D4037'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #6D4C41',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ fontSize: '18px', margin: 0 }}>正在为您生成专属运势...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        fontFamily: 'var(--font-wenkai), system-ui, sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: 'rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          color: '#d32f2f'
        }}>
          <p style={{ fontSize: '18px', marginBottom: '20px' }}>{error}</p>
          <button
            onClick={onBack}
            style={{
              padding: '12px 24px',
              backgroundColor: '#6D4C41',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            返回
          </button>
        </div>
      </div>
    )
  }

  if (!fortune) {
    return null
  }

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: 'transparent',
      fontFamily: 'var(--font-wenkai), system-ui, sans-serif',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: '400px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '30px',
        boxSizing: 'border-box'
      }}>
        {/* 头部 Logo 和标题 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'url(/logo.png) center/contain no-repeat',
            marginRight: '16px',
            flexShrink: 0
          }}></div>
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#5D4037',
              margin: '0 0 4px 0',
              fontFamily: 'var(--font-wenkai), system-ui, sans-serif'
            }}>你的今日运势</h1>
            <p style={{
              fontSize: '14px',
              color: '#795548',
              margin: 0
            }}>{formatDate(fortune.date)} · 愿这份指引为你带来好运</p>
          </div>
        </div>

        {/* 总体评分 */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#5D4037',
            margin: '0 0 16px 0'
          }}>总体运势</h2>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            {renderStars(fortune.overallRating)}
          </div>
          <p style={{
            fontSize: '14px',
            color: '#795548',
            margin: 0
          }}>{fortune.overallRating}/5 星</p>
        </div>

        {/* 幸运色 */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#5D4037',
            margin: '0 0 16px 0'
          }}>今日幸运色</h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: extractColorCode(fortune.luckyColor),
              borderRadius: '50%',
              border: '3px solid rgba(255, 255, 255, 0.8)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}></div>
            <div>
              <p style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#5D4037',
                margin: '0 0 4px 0'
              }}>{fortune.luckyColor}</p>
              <p style={{
                fontSize: '14px',
                color: '#795548',
                margin: 0,
                lineHeight: '1.4'
              }}>{fortune.luckyColorDescription || '今日幸运色将为您带来好运和正能量'}</p>
            </div>
          </div>
        </div>

        {/* 健康运势 */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#5D4037',
            margin: '0 0 12px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '20px' }}>💚</span>
            健康运势
          </h3>
          <p style={{
            fontSize: '15px',
            color: '#424242',
            lineHeight: '1.6',
            margin: 0
          }}>{fortune.healthFortune}</p>
        </div>

        {/* 财富和人际运势 - 同一行显示 */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '30px'
        }}>
          {/* 财富运势 */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            borderRadius: '16px',
            padding: '24px',
            flex: 1
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#5D4037',
              margin: '0 0 12px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '20px' }}>💰</span>
              财富运势
            </h3>
            <p style={{
              fontSize: '15px',
              color: '#424242',
              lineHeight: '1.6',
              margin: 0
            }}>{fortune.wealthFortune}</p>
          </div>

          {/* 人际运势 */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            borderRadius: '16px',
            padding: '24px',
            flex: 1
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#5D4037',
              margin: '0 0 12px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '20px' }}>🤝</span>
              人际运势
            </h3>
            <p style={{
              fontSize: '15px',
              color: '#424242',
              lineHeight: '1.6',
              margin: 0
            }}>{fortune.interpersonalFortune}</p>
          </div>
        </div>



        {/* 底部 NFC UID */}
        <p style={{
          textAlign: 'center',
          color: '#999',
          fontSize: '12px',
          marginTop: '20px',
          opacity: 0.7
        }}>
          {nfcUid}
        </p>
      </div>

      {/* CSS 动画 */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}