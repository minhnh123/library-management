import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, required: true },
  category: { type: String, default: 'Khác' },
  publishedYear: { type: Number },
  totalQuantity: { type: Number, default: 1 },
  availableQuantity: { type: Number, default: 1 },

  // 1. THÔNG TIN KIỂM TOÁN (Audit Log) - Truy vết thao tác
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  // 2. XÓA MỀM (Soft Delete) - Bảo vệ dữ liệu
  isDeleted: {
    type: Boolean,
    default: false,
  },
  
  // 3. CÁCH LY DỮ LIỆU (Multi-tenancy) - Thuộc về chi nhánh nào
  regionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Region',
    required: true,
  }
}, {
  timestamps: true, // Tự động sinh ra 2 trường: createdAt và updatedAt
});

export default mongoose.models.Book || mongoose.model('Book', BookSchema);