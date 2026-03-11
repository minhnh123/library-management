import mongoose from 'mongoose';

const regionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên cơ sở (VD: Cơ sở Đà Nẵng)'],
    unique: true,
  },
  address: {
    type: String,
    required: [true, 'Vui lòng nhập địa chỉ'],
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

export default mongoose.models.Region || mongoose.model('Region', regionSchema);