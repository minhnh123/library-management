import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Region from '@/models/Region'; // <--- BẠN HÃY THÊM DÒNG NÀY VÀO
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { LoginSchema } from '@/lib/validations';
import { ZodError } from 'zod';

// Chìa khóa bí mật để ký Token (Thực tế sẽ để trong file .env)
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET environment variable. Set in .env.local');
}
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    // Validate input
    const { username, password } = LoginSchema.parse(body);

    const user = await User.findOne({ username }).populate('regionId');
    if (!user) return NextResponse.json({ success: false, error: 'Tài khoản không tồn tại!' }, { status: 401 });

    // 1. SO SÁNH MẬT KHẨU ĐÃ BĂM
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return NextResponse.json({ success: false, error: 'Mật khẩu không chính xác!' }, { status: 401 });

    // 2. TẠO THẺ THÔNG HÀNH (JWT)
    const token = await new SignJWT({ 
      userId: user._id, 
      username: user.username,
      regionId: user.regionId?._id, // Thêm dấu ? đề phòng Admin không thuộc vùng nào
      role: user.role               // <--- THÊM DÒNG NÀY ĐỂ LƯU QUYỀN HẠN
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('12h') // Hết hạn sau 12 tiếng
      .sign(SECRET_KEY);

    // 3. GÓI TOKEN VÀO HTTP-ONLY COOKIE (Chống XSS Hacker)
    const response = NextResponse.json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        region: user.regionId,
        // THÊM DÒNG NÀY ĐỂ TRẢ VỀ TÊN CHI NHÁNH DƯỚI DẠNG CHUỖI
        regionName: user.regionId?.name || 'LibraryOS'
      }
    }, { status: 200 });

    response.cookies.set('library_token', token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'strict', 
      maxAge: 12 * 60 * 60 // 12 tiếng
    });

    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ success: false, error: 'Dữ liệu đầu vào không hợp lệ', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const response = NextResponse.json({ success: true, message: 'Đã đăng xuất thành công.' }, { status: 200 });
    response.cookies.set('library_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0
    });
    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}