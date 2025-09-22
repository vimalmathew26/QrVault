// app/api/generated/route.ts
import { NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import GeneratedCode from '@/lib/models/GeneratedCode';

export async function GET() {
  try {
    await connectToDB();

    const codes = await GeneratedCode.find({}).sort({ createdAt: -1 });

    return NextResponse.json(codes, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch generated codes' },
      { status: 500 }
    );
  }
}

// This is required for Next.js to handle dynamic routes correctly
export const dynamic = 'force-dynamic';