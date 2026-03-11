import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
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
  },
  role: {
    type: String,
    default: 'LIBRARIAN', // Mặc định là thủ thư
  }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);