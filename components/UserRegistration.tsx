'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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
    <div className="main-content">
      <div className="registration-clean" style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
          {/* 公司Logo */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            marginBottom: '20px', 
            paddingTop: '20px' 
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

          <div className="section-title">
            <h2>用户注册</h2>
          </div>
          {/* <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '20px' }}>
            请注册您的信息以获取个性化健康运势
          </p> */}
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 移除 NFC UID 输入框，底部仅显示纯UID */}

            <div>
              <label htmlFor="name" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                姓名
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="search-box"
                style={{ width: '100%' }}
                placeholder="请输入您的姓名"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                出生日期
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {/* 年 */}
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
                  className="search-box"
                  style={{ width: '100%' }}
                  required
                >
                  <option value="">年</option>
                  {Array.from({ length: 120 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                    <option key={y} value={y}>{y}年</option>
                  ))}
                </select>

                {/* 月 */}
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
                  className="search-box"
                  style={{ width: '100%' }}
                  required
                >
                  <option value="">月</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>{m}月</option>
                  ))}
                </select>

                {/* 日 */}
                <select
                  id="birthDay"
                  value={birthDay ?? ''}
                  onChange={(e) => {
                    const val = e.target.value ? parseInt(e.target.value, 10) : null
                    setBirthDay(val)
                  }}
                  className="search-box"
                  style={{ width: '100%' }}
                  required
                >
                  <option value="">日</option>
                  {Array.from({ length: (birthYear && birthMonth) ? new Date(birthYear, birthMonth, 0).getDate() : 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>{d}日</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="gender" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                性别
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="search-box"
                style={{ width: '100%' }}
                required
              >
                <option value="">请选择性别</option>
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
            </div>

            <div>
              <label htmlFor="birthPlace" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                出生地
              </label>
              <input
                type="text"
                id="birthPlace"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                className="search-box"
                style={{ width: '100%' }}
                placeholder="请输入出生地（可选）"
              />
            </div>

            {error && (
              <div style={{ 
                color: 'hsl(var(--destructive))', 
                fontSize: '14px', 
                backgroundColor: 'hsl(var(--destructive) / 0.1)', 
                padding: '12px', 
                borderRadius: 'var(--radius)', 
                border: '1px solid hsl(var(--destructive) / 0.2)' 
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex h-9 w-full rounded-md border border-input shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              style={{ 
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#5D6146',
                color: '#ffffff',
                fontSize: '16px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                borderColor: '#5D6146'
              }}
            >
              {isLoading ? "提交中..." : "提交注册"}
            </button>
          </form>

          {/* 底部仅展示纯UID为灰色小字 */}
          {(initialNfcUid || nfcUid) && (
            <p className="nfcuid-footer">{initialNfcUid || nfcUid}</p>
          )}
      </div>
    </div>
  )
}