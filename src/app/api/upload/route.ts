import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const path = formData.get('path') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'لم يتم تحديد ملف' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // تحديد المسار الكامل للملف
    const publicPath = join(process.cwd(), 'public');
    const filePath = join(publicPath, path);

    // حفظ الملف
    await writeFile(filePath, buffer);

    return NextResponse.json({ 
      success: true,
      path: path
    });
  } catch (error) {
    console.error('خطأ في رفع الملف:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء رفع الملف' },
      { status: 500 }
    );
  }
} 