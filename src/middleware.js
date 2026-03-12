import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'chuoi_ky_tu_bi_mat_cua_do_an_cloud_2026');

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // CHỈ BẢO VỆ CÁC ĐƯỜNG DẪN API (Ngoại trừ API Login và Seed)
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/login') && !pathname.startsWith('/api/seed')) {
    
    // Móc token từ Cookie ẩn ra
    const token = request.cookies.get('library_token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Truy cập API bị từ chối. Lỗi 401 Unauthorized!' }, { status: 401 });
    }

    try {
      // Đưa cho lính gác (jose) kiểm tra xem thẻ có phải do hệ thống cấp không, hay bị làm giả
      await jwtVerify(token, SECRET_KEY);
      
      // Nếu hợp lệ, cho phép request đi tiếp vào API bên trong
      return NextResponse.next();
    } catch (error) {
      return NextResponse.json({ success: false, error: 'Token đã hết hạn hoặc bị can thiệp!' }, { status: 401 });
    }
  }

  // Các trang giao diện web bình thường thì cho qua
  return NextResponse.next();
}

// Cấu hình để Middleware chỉ chạy khi gọi vào /api/...
export const config = {
  matcher: ['/api/:path*'],
};