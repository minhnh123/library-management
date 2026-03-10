import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema(
  {
    // 1. THÔNG TIN CƠ BẢN CỦA SÁCH
    title: {
      type: String,
      required: [true, 'Tên sách là bắt buộc'],
      trim: true,
      maxlength: [200, 'Tên sách không được vượt quá 200 ký tự'],
    },
    author: {
      type: String,
      required: [true, 'Tên tác giả là bắt buộc'],
      trim: true,
    },
    isbn: {
      type: String,
      required: [true, 'Mã ISBN là bắt buộc'],
      unique: true, // Đảm bảo không có 2 cuốn sách trùng mã vạch/ISBN
      trim: true,
    },
    category: {
      type: String,
      enum: ['Công nghệ thông tin', 'An ninh mạng', 'Văn học', 'Khoa học', 'Lịch sử', 'Khác'],
      default: 'Khác',
    },
    publishedYear: {
      type: Number,
      max: [new Date().getFullYear(), 'Năm xuất bản không thể lớn hơn năm hiện tại'],
    },

    // 2. QUẢN LÝ TỒN KHO VÀ MƯỢN TRẢ
    totalQuantity: {
      type: Number,
      required: true,
      min: [0, 'Tổng số lượng không thể âm'],
      default: 1,
    },
    availableQuantity: {
      type: Number,
      required: true,
      min: [0, 'Số lượng sẵn có không thể âm'],
      default: 1,
    },

    // 3. THÔNG TIN KIỂM TOÁN (Audit Log) - Truy vết thao tác
    // Lưu lại ID của người (Admin/Thủ thư) đã tạo hoặc cập nhật bản ghi
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // 4. XÓA MỀM (Soft Delete) - Bảo vệ dữ liệu
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Tự động sinh ra 2 trường: createdAt và updatedAt
  }
);

// Tránh lỗi overwrite model khi Next.js recompile liên tục trong môi trường dev
export default mongoose.models.Book || mongoose.model('Book', BookSchema);