'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import UserRegistration from '@/components/UserRegistration'
import FortuneDisplay from '@/components/FortuneDisplay'

function HomeContent() {
  const [currentView, setCurrentView] = useState<'loading' | 'registration' | 'fortune' | 'invalid'>('loading')
  const [nfcUid, setNfcUid] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [fontSize, setFontSize] = useState<number>(16)
  const searchParams = useSearchParams()

  useEffect(() => {
    const checkUserStatus = async () => {
      // 从URL参数获取NFC UID
      const urlNfcUid = searchParams.get('nfc_uid')
      
      // 简单的 NFC UID 合法性校验：仅允许字母、数字、下划线、连字符，长度4-50
      const isValidNfcUid = (uid: string) => /^[A-Za-z0-9_-]{4,50}$/.test(uid)

      if (!urlNfcUid) {
        // 无参数：不允许进入注册页，提示需使用NFC卡片
        setError('请使用NFC卡片访问，缺少nfc_uid参数')
        setCurrentView('invalid')
        setIsLoading(false)
        return
      }

      if (!isValidNfcUid(urlNfcUid)) {
        // 非法参数：不允许进入注册页，给予干净提示页
        setError('NFC UID不合法，请使用正确的卡片或清空参数后重试')
        setCurrentView('invalid')
        setIsLoading(false)
        return
      }

      try {
        // 检查用户是否已注册
        const response = await fetch(`/api/users/check/${urlNfcUid}`)
        const data = await response.json()

        if (response.ok) {
          if (data.exists) {
            // 用户已注册，直接显示运势页面
            setNfcUid(urlNfcUid)
            setCurrentView('fortune')
          } else if (data.isPreGenerated) {
            // 预生成用户：允许注册
            setNfcUid(urlNfcUid)
            setCurrentView('registration')
          } else {
            // 不存在：禁止注册
            setError('NFC UID未录入系统，无法注册')
            setCurrentView('invalid')
          }
        } else {
          setError(data.error || '检查用户状态失败')
          setCurrentView('invalid')
        }
      } catch (err) {
        console.error('检查用户状态失败:', err)
        setError('网络错误，请重试')
        setCurrentView('invalid')
      } finally {
        setIsLoading(false)
      }
    }

    checkUserStatus()
  }, [searchParams])

  // 字号调整：上下限 14px ~ 22px
  useEffect(() => {
    document.documentElement.style.setProperty('--base-font-size', `${fontSize}px`)
  }, [fontSize])

  const increaseFont = () => setFontSize((s) => Math.min(22, s + 1))
  const decreaseFont = () => setFontSize((s) => Math.max(14, s - 1))

  const handleRegistrationComplete = (uid: string) => {
    setNfcUid(uid)
    setCurrentView('fortune')
    setError('')
  }



  return (
    <>
      {/* 固定悬浮的字号调整工具栏 */}
      <div className="font-controls">
        <span style={{ color: 'hsl(var(--muted-foreground))' }}>字号</span>
        <button className="btn" onClick={decreaseFont} style={{ marginLeft: '6px' }}>A-</button>
        <button className="btn" onClick={increaseFont} style={{ marginLeft: '6px' }}>A+</button>
        <span style={{ color: 'hsl(var(--muted-foreground))', marginLeft: '8px' }}>{fontSize}px</span>
      </div>

      <div className="main-container">
      {/* 移除顶部“健康运势助手”介绍卡片 */}

      <main className="main-content" style={{ width: '100%', float: 'none' }}>
        {isLoading ? (
          <div className="overlay" role="status" aria-live="polite">
            <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid hsl(var(--border))', borderTop: '3px solid hsl(var(--primary))', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <p>正在检查用户状态，请稍候…</p>
          </div>
        ) : currentView === 'invalid' ? (
          <div className="overlay" role="status" aria-live="polite">
            <p style={{ marginTop: '12px' }}>{error || 'NFC UID不合法，无法进入注册页'}</p>
          </div>
        ) : currentView === 'registration' ? (
          <UserRegistration 
            onRegistrationComplete={handleRegistrationComplete} 
            initialNfcUid={nfcUid}
          />
        ) : (
          <FortuneDisplay 
            nfcUid={nfcUid} 
            onBack={() => setCurrentView('registration')}
          />
        )}
      </main>

      {/* 移除注册页底部 NFC 身份识别提示 */}

      </div>
    </>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <HomeContent />
    </Suspense>
  )
}
