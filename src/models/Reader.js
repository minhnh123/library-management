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
    unique: true // Đảm bảo không có 2 mã thẻ trùng nhau trên toàn hệ thống
  },
  phoneNumber: { 
    type: String, 
    required: [true, 'Vui lòng nhập số điện thoại'] 
  },
  email: { 
    type: String 
  },
  
  // Trạng thái thẻ thư viện (Hoạt động, Bị khóa do vi phạm, Hết hạn)
  status: {
    type: String,
    enum: ['ACTIVE', 'LOCKED', 'EXPIRED'],
    default: 'ACTIVE'
  },

  // 2. CÁCH LY DỮ LIỆU (Multi-tenancy) - Thuộc về chi nhánh nào
  regionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Region',
    required: true,
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
  }
}, {
  timestamps: true, // Tự động sinh ra createdAt và updatedAt
});

export default mongoose.models.Reader || mongoose.model('Reader', ReaderSchema);