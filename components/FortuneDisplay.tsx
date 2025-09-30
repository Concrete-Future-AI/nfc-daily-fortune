'use client'

import { useState, useEffect } from 'react'

interface Fortune {
  id: number
  fortuneDate: string
  overallRating: number
  healthFortune: string
  healthSuggestion: string
  wealthFortune: string
  interpersonalFortune: string
  luckyColor: string
  actionSuggestion: string
  createdAt: string
}

interface FortuneDisplayProps {
  nfcUid: string
}

export default function FortuneDisplay({ nfcUid }: FortuneDisplayProps) {
  const [fortune, setFortune] = useState<Fortune | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const pollFortune = async () => {
      setIsLoading(true)
      setError('')

      const start = Date.now()
      const timeoutMs = 60000 // 最长等待60秒

      // 简单的 NFC UID 校验
      if (!nfcUid || nfcUid.trim().length === 0) {
        setError('NFC UID不能为空')
        setIsLoading(false)
        return
      }
      if (nfcUid.length > 50) {
        setError('NFC UID长度不能超过50个字符')
        setIsLoading(false)
        return
      }

      while (!cancelled && Date.now() - start < timeoutMs) {
        try {
          const response = await fetch(`/api/fortune/${nfcUid}`)
          const data = await response.json()

          if (response.ok) {
            if (!cancelled) {
              setFortune(data)
              setIsLoading(false)
            }
            return
          }
          // 对于404/500等，继续轮询，等待后端生成完成
        } catch (err) {
          // 网络错误，稍后重试
        }

        await new Promise((r) => setTimeout(r, 1000))
      }

      // 超时仍未获取成功
      if (!cancelled) {
        setError('获取运势失败，请稍后重试')
        setIsLoading(false)
      }
    }

    pollFortune()
    return () => { cancelled = true }
  }, [nfcUid])

  const fetchFortune = async () => {
    // 手动重试：重置状态并启动轮询
    setFortune(null)
    setError('')
    setIsLoading(true)
    // 触发 useEffect 的轮询逻辑
    // 注意：此处不直接调用轮询函数，依赖 nfcUid 不变的情况下刷新状态显示
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        style={{
          color: i < rating ? 'hsl(var(--accent))' : 'hsl(var(--muted-foreground))',
          fontSize: '18px',
          lineHeight: 1,
        }}
      >
        {i < rating ? '★' : '☆'}
      </span>
    ))
  }

  const extractHexColor = (colorString: string): string | null => {
    const hexMatch = colorString?.match(/#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/)
    return hexMatch ? hexMatch[0] : null
  }

  const extractColorName = (colorString: string) => {
    return colorString.replace(/\s*\(#[A-Fa-f0-9]{6}\)/, '').trim()
  }

  if (isLoading) {
    return (
      <div className="overlay" role="status" aria-live="polite">
        <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid hsl(var(--border))', borderTop: '3px solid hsl(var(--primary))', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p>正在获取运势…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="main-content">
        <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ 
              color: 'hsl(var(--destructive))', 
              fontSize: '14px', 
              backgroundColor: 'hsl(var(--destructive) / 0.1)', 
              padding: '12px', 
              borderRadius: 'var(--radius)', 
              border: '1px solid hsl(var(--destructive) / 0.2)',
              marginBottom: '16px'
            }}>
              {error}
            </div>
            <button onClick={fetchFortune} className="btn">
              重新获取
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!fortune) {
    return (
      <div className="main-content">
        <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ color: 'hsl(var(--muted-foreground))' }}>暂无今日运势</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="main-container">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* 公司Logo */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '30px', 
          paddingTop: '30px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <img 
            src="/logo.png" 
            alt="公司Logo" 
            style={{ 
              height: '120px', 
              width: 'auto',
              objectFit: 'contain',
              maxWidth: '100%'
            }} 
          />
        </div>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div className="section-title">
            <h1 style={{ color: '#000000' }}>今日运势</h1>
          </div>
          <p style={{ color: 'hsl(var(--muted-foreground))', marginTop: '10px' }}>
            {new Date().toLocaleDateString('zh-CN')}
          </p>
        </div>

        {fortune && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px' }}>
            {/* 整体运势评分 */}
            <div className="block">
              <div className="block-header">
                <h3 className="block-title" style={{ color: '#000000' }}>整体运势</h3>
              </div>
              <div className="block-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <div style={{ display: 'flex' }}>
                  {renderStars(fortune.overallRating)}
                </div>
              </div>
            </div>

            {/* 幸运颜色：展示颜色名称与通用说明（无独立色框） */}
            <div className="block">
              <div className="block-header">
                <h3 className="block-title" style={{ color: '#000000' }}>幸运颜色</h3>
              </div>
              <div className="block-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                <div 
                  className="lucky-color-swatch" 
                  style={{ 
                    backgroundColor: extractHexColor(fortune.luckyColor) ?? '#cccccc',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    border: '3px solid #ffffff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(0,0,0,0.1)',
                    flexShrink: 0
                  }}
                ></div>
                <div className="lucky-color-info" style={{ textAlign: 'left' }}>
                  <div className="lucky-name" style={{ 
                    fontWeight: 700, 
                    color: '#333333',
                    fontSize: '18px',
                    textShadow: '0 1px 2px rgba(255,255,255,0.8)',
                    marginBottom: '4px'
                  }}>
                    {extractColorName(fortune.luckyColor)}
                  </div>
                  <p className="hint" style={{ margin: 0, fontSize: '14px' }}>佩戴、使用此色，可增助今日好运</p>
                </div>
              </div>
            </div>

            {/* 健康运势 */}
            <div className="block">
              <div className="block-header">
                <h3 className="block-title" style={{ color: '#000000' }}>健康运势</h3>
              </div>
              <div className="block-body">
                <p style={{ margin: '0 auto', maxWidth: '600px' }}>{fortune.healthFortune}</p>
              </div>
            </div>

            {/* 健康建议 */}
            <div className="block">
              <div className="block-header">
                <h3 className="block-title" style={{ color: '#000000' }}>健康建议</h3>
              </div>
              <div className="block-body">
                <p style={{ margin: '0 auto', maxWidth: '600px' }}>{fortune.healthSuggestion}</p>
              </div>
            </div>

            {/* 财富运势 */}
            <div className="block">
              <div className="block-header">
                <h3 className="block-title" style={{ color: '#000000' }}>财富运势</h3>
              </div>
              <div className="block-body">
                <p style={{ margin: '0 auto', maxWidth: '600px' }}>{fortune.wealthFortune}</p>
              </div>
            </div>

            {/* 人际运势 */}
            <div className="block">
              <div className="block-header">
                <h3 className="block-title" style={{ color: '#000000' }}>人际运势</h3>
              </div>
              <div className="block-body">
                <p style={{ margin: '0 auto', maxWidth: '600px' }}>{fortune.interpersonalFortune}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}