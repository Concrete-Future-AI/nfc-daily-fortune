'use client'

import { useState, useEffect } from 'react'

interface UserRegistrationProps {
  onRegistrationComplete: (nfcUid: string) => void
  initialNfcUid?: string
}

export default function UserRegistration({ onRegistrationComplete, initialNfcUid }: UserRegistrationProps) {
  const [nfcUid, setNfcUid] = useState('')
  const [name, setName] = useState('')
  const [birthYear, setBirthYear] = useState<number | null>(null)
  const [birthMonth, setBirthMonth] = useState<number | null>(null)
  const [birthDay, setBirthDay] = useState<number | null>(null)
  const [gender, setGender] = useState('')
  const [birthPlace, setBirthPlace] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // 当有初始NFC UID时，自动填充并禁用编辑
  useEffect(() => {
    if (initialNfcUid) {
      setNfcUid(initialNfcUid)
    }
  }, [initialNfcUid])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // 客户端验证
      if (!nfcUid.trim()) {
        throw new Error('NFC UID不能为空')
      }
      if (!name.trim()) {
        throw new Error('姓名不能为空')
      }
      if (name.length > 50) {
        throw new Error('姓名长度不能超过50个字符')
      }
      if (!birthYear || !birthMonth || !birthDay) {
        throw new Error('出生日期不能为空')
      }
      const dateOfBirth = `${birthYear}-${String(birthMonth).padStart(2,'0')}-${String(birthDay).padStart(2,'0')}`
      if (new Date(dateOfBirth) > new Date()) {
        throw new Error('出生日期不能是未来日期')
      }
      if (!gender) {
        throw new Error('请选择性别')
      }
      if (birthPlace && birthPlace.length > 100) {
        throw new Error('出生地长度不能超过100个字符')
      }

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nfcUid,
          name,
          dateOfBirth,
          gender,
          birthPlace
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '注册失败')
      }

      onRegistrationComplete(nfcUid)
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: 'transparent',
      fontFamily: 'var(--font-wenkai), system-ui, sans-serif'
    }}>
      <div className="registration-form" style={{
        width: '100%',
        maxWidth: '380px',
        padding: '40px 30px',
        boxSizing: 'border-box',
        background: 'rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        position: 'relative',
        zIndex: 1
      }}>
        <div className="header-container" style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <div className="header-logo" style={{
            width: '80px',
            height: '80px',
            background: 'url(/logo.png) center/contain no-repeat',
            marginRight: '16px',
            flexShrink: 0
          }}>
          </div>
          <div style={{ textAlign: 'left' }}>
            <h1 className="registration-title" style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#5D4037',
              margin: '0 0 8px 0',
              fontFamily: 'var(--font-wenkai), system-ui, sans-serif',
              whiteSpace: 'nowrap',
              backgroundColor: 'transparent',
              border: 'none',
              padding: '0',
              lineHeight: 'normal'
            }}>开启你的星运之旅</h1>
            <p className="registration-subtitle" style={{
              fontSize: '15px',
              color: '#795548',
              margin: '0',
              whiteSpace: 'nowrap'
            }}>输入信息，解锁今日份的专属指引</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label htmlFor="name" style={{
              display: 'block',
              fontSize: '14px',
              color: '#6D4C41',
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              姓名
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#FFFFFF',
                fontSize: '16px',
                boxSizing: 'border-box',
                color: '#333'
              }}
              placeholder="请输入你的昵称或姓名"
              required
            />
          </div>

          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label htmlFor="gender" style={{
              display: 'block',
              fontSize: '14px',
              color: '#6D4C41',
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              性别
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#FFFFFF',
                fontSize: '16px',
                boxSizing: 'border-box',
                color: '#333'
              }}
              required
            >
              <option value="">请选择性别</option>
              <option value="male">男</option>
              <option value="female">女</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              color: '#6D4C41',
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              出生日期 (身份证阳历)
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                id="birthYear"
                value={birthYear ?? ''}
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value, 10) : null
                  setBirthYear(val)
                  if (val && birthMonth && birthDay) {
                    const maxDays = new Date(val, birthMonth, 0).getDate()
                    if (birthDay > maxDays) setBirthDay(null)
                  }
                }}
                style={{
                  flex: 1,
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#FFFFFF',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  color: '#333'
                }}
                required
              >
                <option value="">年</option>
                {Array.from({ length: 120 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                  <option key={y} value={y}>{y}年</option>
                ))}
              </select>

              <select
                id="birthMonth"
                value={birthMonth ?? ''}
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value, 10) : null
                  setBirthMonth(val)
                  if (birthYear && val && birthDay) {
                    const maxDays = new Date(birthYear, val, 0).getDate()
                    if (birthDay > maxDays) setBirthDay(null)
                  }
                }}
                style={{
                  flex: 1,
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#FFFFFF',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  color: '#333'
                }}
                required
              >
                <option value="">月</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>{m}月</option>
                ))}
              </select>

              <select
                id="birthDay"
                value={birthDay ?? ''}
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value, 10) : null
                  setBirthDay(val)
                }}
                style={{
                  flex: 1,
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#FFFFFF',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  color: '#333'
                }}
                required
              >
                <option value="">日</option>
                {Array.from({ length: (birthYear && birthMonth) ? new Date(birthYear, birthMonth, 0).getDate() : 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>{d}日</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label htmlFor="birthPlace" style={{
              display: 'block',
              fontSize: '14px',
              color: '#6D4C41',
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              出生地点
            </label>
            <input
              type="text"
              id="birthPlace"
              value={birthPlace}
              onChange={(e) => setBirthPlace(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#FFFFFF',
                fontSize: '16px',
                boxSizing: 'border-box',
                color: '#333'
              }}
              placeholder="例如：广东 珠海"
            />
          </div>

          {error && (
            <div style={{
              color: '#d32f2f',
              fontSize: '14px',
              backgroundColor: 'rgba(211, 47, 47, 0.1)',
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid rgba(211, 47, 47, 0.2)',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '16px',
              border: 'none',
              backgroundColor: '#6D4C41',
              color: 'white',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '700',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s ease',
              marginTop: '10px',
              opacity: isLoading ? 0.7 : 1
            }}
            onMouseOver={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#5D4037'
              }
            }}
            onMouseOut={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#6D4C41'
              }
            }}
          >
            {isLoading ? "提交中..." : "立即查看"}
          </button>
        </form>

        {/* 底部仅展示纯UID为灰色小字 */}
        {(initialNfcUid || nfcUid) && (
          <p style={{
            textAlign: 'center',
            color: '#999',
            fontSize: '12px',
            marginTop: '20px',
            opacity: 0.7
          }}>
            {initialNfcUid || nfcUid}
          </p>
        )}
      </div>
    </div>
  )
}