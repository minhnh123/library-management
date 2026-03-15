import mongoose from 'mongoose';

const ReaderSchema = new mongoose.Schema({
  // 1. THÔNG TIN CƠ BẢN
  fullName: { 
    type: String, 
    required: [true, 'Vui lòng nhập tên độc giả'] 
  },
  readerCode: { 
    type: String, 
    required: [true, 'Vui lòng nhập mã thẻ độc giả'],
    unique: true, // Đảm bảo không có 2 mã thẻ trùng nhau trên toàn hệ thống
    index: true,
  },
  phoneNumber: { 
    type: String, 
    required: [true, 'Vui lòng nhập số điện thoại'] 
  },
  email: { 
    type: String,
    index: true, // Index cho tìm kiếm theo email
  },
  
  // Trạng thái thẻ thư viện (Hoạt động, Bị khóa do vi phạm, Hết hạn)
  status: {
    type: String,
    enum: ['ACTIVE', 'LOCKED', 'EXPIRED'],
    default: 'ACTIVE',
    index: true, // Index cho filter theo status
  },

  // 2. CÁCH LY DỮ LIỆU (Multi-tenancy) - Thuộc về chi nhánh nào
  regionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Region',
    required: true,
    index: true, // Index cho multi-tenancy
  },

  // 3. THÔNG TIN KIỂM TOÁN (Audit Log) - Lưu ID thủ thư đã tạo/sửa
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  // 4. XÓA MỀM (Soft Delete) - Bảo vệ dữ liệu không bị xóa hẳn
  isDeleted: {
    type: Boolean,
    default: false,
    index: true, // Index cho soft delete
  }
}, {
  timestamps: true, // Tự động sinh ra createdAt và updatedAt
});

// Compound index cho multi-tenancy và soft delete
ReaderSchema.index({ regionId: 1, isDeleted: 1 });

// Index cho sorting theo thời gian tạo
ReaderSchema.index({ createdAt: -1 });

export default mongoose.models.Reader || mongoose.model('Reader', ReaderSchema);