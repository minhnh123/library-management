import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Region from '@/models/Region'; // Import để có thể lấy được tên chi nhánh

export async function POST(request) {
  try {
    await dbConnect();
    const { username, password } = await request.json();

    // Tìm user và "populate" (kéo theo) thông tin chi nhánh dựa vào regionId
    const user = await User.findOne({ username }).populate('regionId');

    // Kiểm tra tài khoản và mật khẩu (Lưu ý cho báo cáo: Thực tế sẽ dùng thư viện bcrypt để so sánh hash)
    if (!user || user.password !== password) {
      return NextResponse.json(
        { success: false, error: 'Tài khoản hoặc mật khẩu không chính xác!' },
        { status: 401 }
      );
    }

    // Nếu đúng, trả về thông tin người dùng (không trả về mật khẩu để bảo mật)
    return NextResponse.json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        region: user.regionId // Chứa thông tin Cơ sở Đà Nẵng
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}