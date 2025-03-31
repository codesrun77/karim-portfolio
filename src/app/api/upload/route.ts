import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const path = formData.get('path') as string;

    if (!file) {
      console.error('خطأ: لم يتم تحديد ملف');
      return NextResponse.json(
        { error: 'لم يتم تحديد ملف' },
        { status: 400 }
      );
    }

    if (!path) {
      console.error('خطأ: لم يتم تحديد المسار');
      return NextResponse.json(
        { error: 'لم يتم تحديد المسار' },
        { status: 400 }
      );
    }

    console.log(`جاري معالجة ملف: ${file.name}, نوع: ${file.type}, حجم: ${file.size} بايت`);
    console.log(`المسار المستهدف: ${path}`);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // تحديد المسار الكامل للملف
    const publicPath = join(process.cwd(), 'public');
    const filePath = join(publicPath, path);

    console.log(`المسار الكامل للملف: ${filePath}`);

    // حفظ الملف
    await writeFile(filePath, buffer);
    console.log(`تم حفظ الملف بنجاح في: ${filePath}`);

    return NextResponse.json({ 
      success: true,
      path: path,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('خطأ في رفع الملف:', errorMessage);
    console.error('تفاصيل الخطأ:', errorStack);
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء رفع الملف', details: errorMessage },
      { status: 500 }
    );
  }
} 