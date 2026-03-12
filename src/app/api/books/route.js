import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Book from '@/models/Book';

// [GET] - Lấy danh sách sách có hỗ trợ Tìm kiếm, Lọc và CÁCH LY THEO CHI NHÁNH
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const year = searchParams.get('year') || '';
    const regionId = searchParams.get('regionId'); 
    
    // 1. NHẬN YÊU CẦU PHÂN TRANG TỪ GIAO DIỆN
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 5; // Giới hạn 5 cuốn/trang để dễ test
    const skip = (page - 1) * limit; // Công thức tính số bản ghi cần bỏ qua

    let query = { isDeleted: false };
    if (regionId) query.regionId = regionId;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'Tất cả thể loại' && category !== '') query.category = category;
    if (year && year !== 'Tất cả năm' && year !== '') query.publishedYear = Number(year);

    // 2. ĐẾM TỔNG SỐ LƯỢNG ĐỂ TÍNH SỐ TRANG
    const total = await Book.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // 3. THỰC THI TRUY VẤN CÓ GIỚI HẠN (Pagination Query)
    const books = await Book.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)   // Bỏ qua các sách ở trang trước
      .limit(limit); // Chỉ lấy đúng số lượng của trang hiện tại

    return NextResponse.json({ 
      success: true, 
      data: books,
      pagination: { total, page, totalPages, limit } 
    }, { status: 200 });
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