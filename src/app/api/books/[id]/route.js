import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Book from '@/models/Book';

// [PUT] - Cập nhật thông tin sách
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    // 1. Phải có await cho params trong Next.js 15
    const { id } = await params; 
    
    const body = await request.json();

    // 2. Xóa trường _id khỏi body để tránh lỗi MongoDB cấm sửa ID
    delete body._id;

    // Cập nhật và trả về dữ liệu mới (new: true)
    const updatedBook = await Book.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true // Đảm bảo tuân thủ Schema
    });

    if (!updatedBook) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy sách' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedBook }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// [DELETE] - Xóa mềm sách (Soft Delete)
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    // 1. Phải có await cho params trong Next.js 15
    const { id } = await params;

    // Không dùng findByIdAndDelete, chỉ đổi trạng thái isDeleted thành true
    const deletedBook = await Book.findByIdAndUpdate(id, { isDeleted: true }, { new: true });

    if (!deletedBook) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy sách' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}