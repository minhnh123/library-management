import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Book from '@/models/Book';

// [GET] - Lấy danh sách sách có hỗ trợ Tìm kiếm và Lọc (Server-side)
export async function GET(request) {
  try {
    await dbConnect();
    
    // 1. Lấy các tham số (query parameters) từ URL
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const year = searchParams.get('year') || '';

    // 2. Mặc định chỉ lấy sách chưa bị xóa mềm
    let query = { isDeleted: false };

    // 3. Xây dựng bộ lọc cho MongoDB Atlas
    // Tìm kiếm tương đối (regex) không phân biệt hoa thường (i)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'Tất cả thể loại' && category !== '') {
      query.category = category;
    }

    if (year && year !== 'Tất cả năm' && year !== '') {
      query.publishedYear = Number(year);
    }

    // 4. Bắn truy vấn xuống Cloud Database
    const books = await Book.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: books }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
// [POST] - Thêm một cuốn sách mới vào thư viện (Có xử lý "Hồi sinh" sách đã xóa)
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // 1. Kiểm tra xem mã ISBN này đã từng tồn tại trong database chưa
    const existingBook = await Book.findOne({ isbn: body.isbn });
    
    if (existingBook) {
      if (existingBook.isDeleted) {
        // Trường hợp A: Sách đã bị "xóa mềm" trong quá khứ
        // -> Khôi phục lại sách này, ghi đè dữ liệu mới từ Form và tắt isDeleted
        const restoredBook = await Book.findByIdAndUpdate(
          existingBook._id,
          { ...body, isDeleted: false },
          { new: true, runValidators: true }
        );
        return NextResponse.json({ success: true, data: restoredBook }, { status: 201 });
      } else {
        // Trường hợp B: Sách đang tồn tại bình thường trên kệ
        // -> Chặn lại và báo lỗi ngay lập tức
        return NextResponse.json(
          { success: false, error: 'Mã ISBN này đã tồn tại trong hệ thống!' },
          { status: 400 }
        );
      }
    }
    
    // 2. Trường hợp C: Mã ISBN hoàn toàn mới -> Tạo một cuốn sách mới tinh
    const newBook = await Book.create(body);
    return NextResponse.json({ success: true, data: newBook }, { status: 201 });
  } catch (error) {
    // Xử lý các lỗi validation khác 
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}