import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy tài khoản.' }, { status: 404 });
    }

    if (body.username && body.username !== user.username) {
      const existingUser = await User.findOne({ username: body.username });
      if (existingUser) {
        return NextResponse.json({ success: false, error: 'Tên đăng nhập đã tồn tại!' }, { status: 400 });
      }
      user.username = body.username;
    }

    if (body.password) {
      user.password = await bcrypt.hash(body.password, 10);
    }

    if (body.fullName) {
      user.fullName = body.fullName;
    }

    if (body.role) {
      user.role = body.role;
    }

    if (body.regionId) {
      user.regionId = body.regionId;
    }

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json({ success: true, data: userResponse }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy tài khoản.' }, { status: 404 });
    }

    await User.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Xóa tài khoản thành công.' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
