import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import Book from '@/models/Book';     // Cần import để Backend tự động liên kết dữ liệu
import Reader from '@/models/Reader'; // Cần import để Backend tự động liên kết dữ liệu

// [GET] - Lấy danh sách Phiếu mượn (Có nối dữ liệu Sách và Độc giả)
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const regionId = searchParams.get('regionId');
    const status = searchParams.get('status') || '';

    let query = {};
    if (regionId) query.regionId = regionId; // CÁCH LY DỮ LIỆU
    if (status && status !== 'Tất cả') query.status = status;

    // populate() giúp tự động kéo Tên sách và Tên độc giả từ 2 bảng kia sang
    const transactions = await Transaction.find(query)
      .populate('bookId', 'title isbn')
      .populate('readerId', 'fullName readerCode phoneNumber')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: transactions }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// [POST] - MƯỢN SÁCH (Tạo phiếu mượn mới)
export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();

    if (!data.regionId) {
      return NextResponse.json({ success: false, error: 'Thiếu thông tin chi nhánh!' }, { status: 400 });
    }

    // 1. KIỂM TRA ĐỘC GIẢ
    const reader = await Reader.findOne({ _id: data.readerId, regionId: data.regionId, isDeleted: false });
    if (!reader) return NextResponse.json({ success: false, error: 'Không tìm thấy độc giả ở chi nhánh này!' }, { status: 404 });
    if (reader.status !== 'ACTIVE') return NextResponse.json({ success: false, error: 'Thẻ độc giả đang bị khóa hoặc hết hạn!' }, { status: 400 });

    // 2. KIỂM TRA SÁCH
    const book = await Book.findOne({ _id: data.bookId, regionId: data.regionId, isDeleted: false });
    if (!book) return NextResponse.json({ success: false, error: 'Không tìm thấy sách ở chi nhánh này!' }, { status: 404 });
    if (book.availableQuantity <= 0) return NextResponse.json({ success: false, error: 'Sách này đã được mượn hết!' }, { status: 400 });

    // 3. THỰC THI GIAO DỊCH (TRANSACTION)
    // a. Tạo phiếu mượn
    const newTransaction = await Transaction.create(data);
    
    // b. Trừ đi 1 cuốn sách trong kho (Logic quan trọng nhất)
    await Book.findByIdAndUpdate(data.bookId, { $inc: { availableQuantity: -1 } });

    return NextResponse.json({ success: true, data: newTransaction }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}