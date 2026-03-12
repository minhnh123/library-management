import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// [GET] - Admin lấy danh sách tài khoản thủ thư
export async function GET() {
  try {
    await dbConnect();
    // Lấy tất cả user (trừ mật khẩu) và nối tên Cơ sở vào
    const users = await User.find({}).select('-password').populate('regionId');
    return NextResponse.json({ success: true, data: users }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// [POST] - Admin tạo tài khoản thủ thư mới
export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();

    // Kiểm tra xem username đã có người dùng chưa
    const existingUser = await User.findOne({ username: data.username });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'Tên đăng nhập đã tồn tại!' }, { status: 400 });
    }

    // Băm mật khẩu người dùng mới trước khi lưu
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const newUser = await User.create({
      username: data.username,
      password: hashedPassword,
      fullName: data.fullName,
      role: data.role || 'LIBRARIAN',
      regionId: data.regionId // ID của chi nhánh mà thủ thư này quản lý
    });

    // Xóa password khỏi kết quả trả về để bảo mật
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return NextResponse.json({ success: true, data: userResponse }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
