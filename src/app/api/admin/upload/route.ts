import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded.' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Only JPEG, PNG, WebP, AVIF, and GIF images are accepted.' },
        { status: 400 }
      );
    }

    // Limit size: 8MB
    const maxSize = 8 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum allowed size is 8 MB.' },
        { status: 400 }
      );
    }

    // Build safe filename
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeName = `banner_${Date.now()}_${Math.floor(Math.random() * 10000)}.${ext}`;

    // Resolve upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'banners');
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, safeName);
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const publicUrl = `/uploads/banners/${safeName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: safeName,
      size: file.size,
      type: file.type,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Upload failed' }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
