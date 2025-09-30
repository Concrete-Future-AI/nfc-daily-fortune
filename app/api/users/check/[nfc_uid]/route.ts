import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { nfc_uid: string } }
) {
  try {
    const { nfc_uid } = await params;
    const nfcUid = nfc_uid;

    // NFC UID验证
    if (!nfcUid) {
      return NextResponse.json(
        { error: "NFC UID不能为空" },
        { status: 400 }
      );
    }
    if (typeof nfcUid !== 'string') {
      return NextResponse.json(
        { error: "NFC UID格式不正确" },
        { status: 400 }
      );
    }
    if (nfcUid.length > 50) {
      return NextResponse.json(
        { error: "NFC UID长度不能超过50个字符" },
        { status: 400 }
      );
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { nfcUid },
      select: {
        id: true,
        nfcUid: true,
        name: true,
        gender: true,
        dateOfBirth: true,
        birthPlace: true,
        createdAt: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { 
          exists: false,
          message: "用户未注册" 
        },
        { status: 200 }
      );
    }

    // 检查是否为预生成的未注册用户
    const isPreGenerated = user.name.startsWith('待注册用户_');
    
    if (isPreGenerated) {
      return NextResponse.json(
        { 
          exists: false,
          isPreGenerated: true,
          message: "用户需要完成注册" 
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      exists: true,
      user: user,
      message: "用户已注册"
    });

  } catch (error) {
    console.error("检查用户失败:", error);
    return NextResponse.json(
      { error: "检查用户失败" },
      { status: 500 }
    );
  }
}