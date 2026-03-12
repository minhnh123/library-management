import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'chuoi_ky_tu_bi_mat_cua_do_an_cloud_2026');

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/login') && !pathname.startsWith('/api/seed')) {
    const token = request.cookies.get('library_token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Truy cập bị từ chối. Lỗi 401 Unauthorized!' }, { status: 401 });
    }

    try {
      // Đọc thông tin từ thẻ Token
      const { payload } = await jwtVerify(token, SECRET_KEY);
      
      // KIỂM TRA QUYỀN (RBAC): Bất kỳ ai vào đường dẫn /api/users đều phải là ADMIN
      if (pathname.startsWith('/api/users') && payload.role !== 'ADMIN') {
        return NextResponse.json({ success: false, error: 'Lỗi 403 Forbidden: Chỉ Giám đốc mới có quyền truy cập!' }, { status: 403 });
      }

      return NextResponse.next();
    } catch (error) {
      return NextResponse.json({ success: false, error: 'Token đã hết hạn hoặc bị can thiệp!' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};