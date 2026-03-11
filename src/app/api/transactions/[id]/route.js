import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import Book from '@/models/Book';

// [PUT] - TRẢ SÁCH (Cập nhật trạng thái phiếu)
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const { status, note, updatedBy } = await request.json();

    // 1. Tìm phiếu mượn hiện tại
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy phiếu mượn!' }, { status: 404 });
    }

    // 2. LOGIC TRẢ SÁCH: Nếu trạng thái chuyển từ Mượn -> Trả
    if (transaction.status !== 'RETURNED' && status === 'RETURNED') {
      // a. Cập nhật phiếu mượn thành Đã Trả và ghi nhận ngày trả
      transaction.status = 'RETURNED';
      transaction.returnDate = Date.now();
      transaction.note = note || transaction.note;
      transaction.updatedBy = updatedBy;
      await transaction.save();

      // b. Cộng lại 1 cuốn sách vào kho
      await Book.findByIdAndUpdate(transaction.bookId, { $inc: { availableQuantity: 1 } });

      return NextResponse.json({ success: true, data: transaction, message: 'Đã trả sách thành công!' }, { status: 200 });
    }

    // Nếu chỉ là cập nhật ghi chú thông thường (không phải trả sách)
    transaction.note = note !== undefined ? note : transaction.note;
    transaction.status = status || transaction.status;
    transaction.updatedBy = updatedBy;
    await transaction.save();

    return NextResponse.json({ success: true, data: transaction }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}