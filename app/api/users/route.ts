import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { CreateUserRequest } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body: CreateUserRequest = await request.json()
    
    const { nfcUid, name, gender, dateOfBirth, birthPlace } = body

    // 验证必要字段
    if (!nfcUid || !name || !dateOfBirth) {
      return NextResponse.json(
        { error: '缺少必要字段' },
        { status: 422 }
      )
    }

    // 输入验证
    if (typeof nfcUid !== 'string' || nfcUid.trim().length === 0) {
      return NextResponse.json(
        { error: 'NFC UID格式不正确' },
        { status: 400 }
      )
    }
    if (nfcUid.length > 50) {
      return NextResponse.json(
        { error: 'NFC UID长度不能超过50个字符' },
        { status: 400 }
      )
    }
    if (typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: '姓名格式不正确' },
        { status: 400 }
      )
    }
    if (name.length > 50) {
      return NextResponse.json(
        { error: '姓名长度不能超过50个字符' },
        { status: 400 }
      )
    }
    if (birthPlace && typeof birthPlace !== 'string') {
      return NextResponse.json(
        { error: '出生地格式不正确' },
        { status: 400 }
      )
    }
    if (birthPlace && birthPlace.length > 100) {
      return NextResponse.json(
        { error: '出生地长度不能超过100个字符' },
        { status: 400 }
      )
    }

    // 验证日期格式
    const birthDate = new Date(dateOfBirth)
    if (isNaN(birthDate.getTime())) {
      return NextResponse.json(
        { error: '出生日期格式不正确' },
        { status: 400 }
      )
    }
    if (birthDate > new Date()) {
      return NextResponse.json(
        { error: '出生日期不能是未来日期' },
        { status: 400 }
      )
    }

    // 验证性别
    const validGenders = ['male', 'female']
    if (gender && !validGenders.includes(gender)) {
      return NextResponse.json(
        { error: '性别格式不正确' },
        { status: 400 }
      )
    }

    // 检查NFC UID是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { nfcUid }
    })

    if (existingUser) {
      // 检查是否为预生成的用户
      const isPreGenerated = existingUser.name.startsWith('待注册用户_');
      
      if (!isPreGenerated) {
        return NextResponse.json(
          { error: '该NFC已绑定用户' },
          { status: 422 }
        )
      }
      
      // 如果是预生成用户，更新用户信息而不是创建新用户
      const updatedUser = await prisma.user.update({
        where: { nfcUid },
        data: {
          name: name.trim(),
          gender,
          dateOfBirth: birthDate,
          birthPlace: birthPlace ? birthPlace.trim() : null
        }
      })

      return NextResponse.json(
        { 
          message: '用户注册成功',
          user: {
            id: updatedUser.id,
            nfcUid: updatedUser.nfcUid,
            name: updatedUser.name,
            gender: updatedUser.gender,
            dateOfBirth: updatedUser.dateOfBirth,
            birthPlace: updatedUser.birthPlace
          }
        },
        { status: 201 }
      )
    }

    // 不允许创建新用户：nfc_uid必须预存在数据库
    return NextResponse.json(
      { error: 'NFC UID未录入系统，不可注册' },
      { status: 404 }
    )

  } catch (error) {
    console.error('创建用户失败:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}