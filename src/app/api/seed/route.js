import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Region from '@/models/Region';
import User from '@/models/User';
// Import thêm model Book để tránh lỗi khi Mongoose khởi tạo các bảng liên kết
import Book from '@/models/Book';
import bcrypt from 'bcryptjs'; // <-- Thêm dòng này

export async function GET() {
  try {
    // Kết nối Database Cloud
    await dbConnect();

    // 1. KHỞI TẠO CƠ SỞ (REGION)
    // Kiểm tra xem Cơ sở Đà Nẵng đã tồn tại chưa, nếu chưa thì tạo mới
    let danangRegion = await Region.findOne({ name: 'Cơ sở Đà Nẵng' });
    
    if (!danangRegion) {
      danangRegion = await Region.create({
        name: 'Cơ sở Đà Nẵng',
        address: 'Đà Nẵng, Việt Nam',
        isActive: true
      });
      console.log('Đã tạo mới Cơ sở Đà Nẵng!');
    }

    // 2. KHỞI TẠO TÀI KHOẢN THỦ THƯ (USER)
    // Tạo một tài khoản và gán chặt (ref) vào ID của Cơ sở Đà Nẵng vừa tạo
    let danangUser = await User.findOne({ username: 'thuthu_dn' });

    if (!danangUser) {
      const hashedPassword1 = await bcrypt.hash('123456', 10); // Băm mật khẩu 10 vòng
      danangUser = await User.create({
        username: 'thuthu_dn',
        password: hashedPassword1, // Lưu mật khẩu đã băm
        fullName: 'Nguyễn Văn Admin',
        regionId: danangRegion._id,
        role: 'LIBRARIAN'
      });
      console.log('Đã tạo mới tài khoản Thủ thư Đà Nẵng!');
    }

    // 3. KHỞI TẠO CƠ SỞ HÀ NỘI & THỦ THƯ HÀ NỘI (Để test cách ly dữ liệu)
    let hanoiRegion = await Region.findOne({ name: 'Cơ sở Hà Nội' });
    if (!hanoiRegion) {
      hanoiRegion = await Region.create({
        name: 'Cơ sở Hà Nội',
        address: 'Hà Nội, Việt Nam',
        isActive: true
      });
      console.log('Đã tạo mới Cơ sở Hà Nội!');
    }

    let hanoiUser = await User.findOne({ username: 'thuthu_hn' });
    if (!hanoiUser) {
      const hashedPassword2 = await bcrypt.hash('123456', 10); // Băm mật khẩu 10 vòng
      hanoiUser = await User.create({
        username: 'thuthu_hn',
        password: hashedPassword2, // Lưu mật khẩu đã băm
        fullName: 'Trần Thủ Thư HN',
        regionId: hanoiRegion._id,
        role: 'LIBRARIAN'
      });
      console.log('Đã tạo mới tài khoản Thủ thư Hà Nội!');
    }

    // TẠO TÀI KHOẢN SUPER ADMIN
    let adminUser = await User.findOne({ username: 'admin' });
    if (!adminUser) {
      const hashedAdminPass = await bcrypt.hash('123456', 10);
      adminUser = await User.create({
        username: 'admin',
        password: hashedAdminPass,
        fullName: 'Giám Đốc Hệ Thống',
        role: 'ADMIN',
        regionId: danangRegion._id // Tạm gán vào 1 vùng để không bị lỗi Schema
      });
      console.log('Đã tạo mới tài khoản Super Admin!');
    }

    // 4. Trả về kết quả
    return NextResponse.json({
      success: true,
      message: 'Khởi tạo dữ liệu mồi (Seed Data) thành công!',
      credentials: {
        da_nang: {
          chi_nhanh: danangRegion.name,
          tai_khoan: danangUser.username,
          mat_khau: '123456'
        },
        ha_noi: {
          chi_nhanh: hanoiRegion.name,
          tai_khoan: hanoiUser.username,
          mat_khau: '123456'
        },
        admin: {
          chi_nhanh: danangRegion.name,
          tai_khoan: adminUser.username,
          mat_khau: '123456'
        }
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}