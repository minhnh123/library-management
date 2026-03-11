import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  // 1. LIÊN KẾT DỮ LIỆU (Foreign Keys)
  readerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reader',
    required: [true, 'Vui lòng chọn độc giả']
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Vui lòng chọn cuốn sách']
  },

  // 2. THÔNG TIN GIAO DỊCH
  borrowDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  dueDate: {
    type: Date,
    required: [true, 'Vui lòng chọn ngày hẹn trả']
  },
  returnDate: {
    type: Date, // Sẽ được cập nhật khi độc giả mang sách đến trả
  },
  
  // Trạng thái phiếu mượn
  status: {
    type: String,
    enum: ['BORROWED', 'RETURNED', 'OVERDUE'],
    default: 'BORROWED'
  },
  
  // Ghi chú thêm (VD: Sách bị rách góc khi mượn...)
  note: {
    type: String,
  },

  // 3. CÁCH LY DỮ LIỆU (Multi-tenancy)
  regionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Region',
    required: true,
  },

  // 4. THÔNG TIN KIỂM TOÁN (Audit Log)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
}, {
  timestamps: true,
});

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);