import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Region from '@/models/Region';

// [GET] - Lấy danh sách các cơ sở/chi nhánh
export async function GET() {
  try {
    await dbConnect();
    const regions = await Region.find({ isActive: true });
    return NextResponse.json({ success: true, data: regions }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
