// app/api/scanned/route.ts
import { NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import ScannedCode from '@/lib/models/ScannedCode';

export async function GET() {
  try {
    await connectToDB();
    
    const codes = await ScannedCode.find({}).sort({ scannedAt: -1 });

    return NextResponse.json(codes, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch scanned codes' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';