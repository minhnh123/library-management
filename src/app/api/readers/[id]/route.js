import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Reader from '@/models/Reader';

// [PUT] - Cập nhật thông tin Độc giả
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const data = await request.json();

    // Nếu người dùng đổi mã thẻ, kiểm tra xem mã mới có bị trùng với người khác không
    if (data.readerCode) {
      const duplicateCode = await Reader.findOne({ 
        readerCode: data.readerCode, 
        _id: { $ne: id }, // Bỏ qua chính bản thân nó
        isDeleted: false 
      });
      if (duplicateCode) {
        return NextResponse.json({ success: false, error: 'Mã thẻ này đã được cấp cho người khác!' }, { status: 400 });
      }
    }

    const updatedReader = await Reader.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    
    if (!updatedReader) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy độc giả!' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedReader }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// [DELETE] - Xóa mềm Độc giả
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;

    const deletedReader = await Reader.findByIdAndUpdate(
      id, 
      { isDeleted: true }, // Áp dụng cơ chế Xóa mềm (Soft Delete)
      { new: true }
    );

    if (!deletedReader) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy độc giả!' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: deletedReader }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}