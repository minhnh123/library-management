import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    index: true, // Đảm bảo index cho unique field
  },
  password: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  // ĐÂY LÀ CHÌA KHÓA: Trói buộc User vào 1 Region cụ thể
  regionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Region',
    required: true,
    index: true, // Index cho multi-tenancy
  },
  role: {
    type: String,
    default: 'LIBRARIAN', // Mặc định là thủ thư
    index: true, // Index cho RBAC queries
  }
}, { timestamps: true });

// Compound index cho region và role
userSchema.index({ regionId: 1, role: 1 });

export default mongoose.models.User || mongoose.model('User', userSchema);