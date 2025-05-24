import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!
});

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const publicId = searchParams.get('public_id');

    if (!publicId) {
        return NextResponse.json({ error: 'public_id query param is required' }, { status: 400 });
    }

    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: 'video'
        });

        if (result.result !== 'ok') {
            return NextResponse.json({ error: 'Deletion failed', result }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: `Deleted ${publicId}` });
    } catch (err: any) {
        return NextResponse.json({
            error: 'Cloudinary deletion failed',
            message: err.message
        }, { status: 500 });
    }
}
