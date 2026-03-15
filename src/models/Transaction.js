import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  // 1. LIÊN KẾT DỮ LIỆU (Foreign Keys)
  readerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reader',
    required: [true, 'Vui lòng chọn độc giả'],
    index: true, // Index cho queries theo độc giả
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Vui lòng chọn cuốn sách'],
    index: true, // Index cho queries theo sách
  },

  // 2. THÔNG TIN GIAO DỊCH
  borrowDate: {
    type: Date,
    default: Date.now,
    required: true,
    index: true, // Index cho sorting/filter theo ngày mượn
  },
  dueDate: {
    type: Date,
    required: [true, 'Vui lòng chọn ngày hẹn trả'],
    index: true, // Index cho tìm overdue
  },
  returnDate: {
    type: Date, // Sẽ được cập nhật khi độc giả mang sách đến trả
  },
  
  // Trạng thái phiếu mượn
  status: {
    type: String,
    enum: ['BORROWED', 'RETURNED', 'OVERDUE'],
    default: 'BORROWED',
    index: true, // Index cho filter theo status
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
    index: true, // Index cho multi-tenancy
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

// Compound index cho multi-tenancy và status
TransactionSchema.index({ regionId: 1, status: 1 });

// Index cho sorting theo ngày mượn
TransactionSchema.index({ borrowDate: -1 });

// Index cho tìm overdue (dueDate < now và status = BORROWED)
TransactionSchema.index({ dueDate: 1, status: 1 });

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);