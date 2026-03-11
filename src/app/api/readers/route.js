import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Reader from '@/models/Reader';

// [GET] - Lấy danh sách Độc giả (Có lọc theo chi nhánh và tìm kiếm)
export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    
    // BẮT BUỘC: Nhận ID của chi nhánh đang đăng nhập để cách ly dữ liệu
    const regionId = searchParams.get('regionId'); 

    // Mặc định chỉ lấy độc giả chưa bị xóa mềm
    let query = { isDeleted: false };

    // ÉP BUỘC DATABASE CHỈ TÌM ĐỘC GIẢ CỦA CHI NHÁNH ĐÓ
    if (regionId) {
      query.regionId = regionId;
    }

    // Tìm kiếm tương đối theo Tên, Mã thẻ hoặc Số điện thoại
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { readerCode: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Lọc theo trạng thái thẻ
    if (status && status !== 'Tất cả trạng thái') {
      const statusMap = { 'Hoạt động': 'ACTIVE', 'Bị khóa': 'LOCKED', 'Hết hạn': 'EXPIRED' };
      if (statusMap[status]) query.status = statusMap[status];
    }

    const readers = await Reader.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: readers }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// [POST] - Thêm Độc giả mới
export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();

    // KIỂM TRA BẢO MẬT: Bắt buộc phải có ID chi nhánh
    if (!data.regionId) {
      return NextResponse.json({ success: false, error: 'Thiếu thông tin chi nhánh (regionId)' }, { status: 400 });
    }

    // Kiểm tra xem Mã thẻ đã tồn tại trên toàn hệ thống chưa
    const existingReader = await Reader.findOne({ readerCode: data.readerCode, isDeleted: false });
    if (existingReader) {
      return NextResponse.json({ success: false, error: 'Mã thẻ độc giả đã tồn tại trong hệ thống!' }, { status: 400 });
    }

    const newReader = await Reader.create(data);
    return NextResponse.json({ success: true, data: newReader }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}