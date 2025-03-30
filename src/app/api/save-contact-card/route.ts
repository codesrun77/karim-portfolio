import { writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();
    
    if (!content) {
      return NextResponse.json(
        { message: 'يجب توفير محتوى ملف بطاقة الاتصال' },
        { status: 400 }
      );
    }
    
    // تحديد مسار حفظ الملف في مجلد public
    const filePath = path.join(process.cwd(), 'public', 'karim-contact.vcf');
    
    // كتابة محتوى ملف بطاقة الاتصال
    await writeFile(filePath, content, 'utf-8');
    
    return NextResponse.json(
      { message: 'تم حفظ بطاقة الاتصال بنجاح' },
      { status: 200 }
    );
  } catch (error) {
    console.error('خطأ في حفظ بطاقة الاتصال:', error);
    
    return NextResponse.json(
      { message: 'حدث خطأ أثناء حفظ بطاقة الاتصال' },
      { status: 500 }
    );
  }
} 