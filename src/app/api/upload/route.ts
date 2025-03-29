import { NextResponse, NextRequest } from 'next/server';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiOptions, UploadApiResponse } from 'cloudinary';
import streamifier from 'streamifier';

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 5;

// Configure multer with file validation
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      cb(new Error(`File type not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`));
      return;
    }
    cb(null, true);
  },
});

interface MulterRequest extends NextRequest {
  files: Express.Multer.File[];
}

interface MulterResponse extends NextResponse {
  locals: Record<string, unknown>;
}

const runMulter = (req: NextRequest, res: NextResponse) => {
  return new Promise<void>((resolve, reject) => {
    upload.array('images', MAX_FILES)(req as MulterRequest, res as MulterResponse, (result: Error | undefined) => {
      if (result instanceof Error) {
        reject(result);
      }
      resolve();
    });
  });
};

const uploadToCloudinary = async (file: Express.Multer.File) => {
  return new Promise((resolve, reject) => {
    const uploadOptions: UploadApiOptions = {
      resource_type: 'auto' as const,
      folder: 'uploads',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    };

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error: Error | undefined, result: UploadApiResponse | undefined) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(new Error('Failed to upload to Cloudinary'));
        } else {
          resolve({
            name: file.originalname,
            url: result?.secure_url,
            public_id: result?.public_id,
            size: result?.bytes,
            format: result?.format
          });
        }
      }
    );

    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

export async function POST(req: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Missing Cloudinary configuration');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Run multer and get formData
    await runMulter(req, NextResponse.next());
    const formData = await req.formData();
    const files = formData.getAll('images') as File[];

    // Validate files existence
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      );
    }

    // Convert Files to Express.Multer.File format
    const multerFiles: Express.Multer.File[] = await Promise.all(
      files.map(async (file) => {
        const buffer = await file.arrayBuffer();
        return {
          buffer: Buffer.from(buffer),
          originalname: file.name,
          mimetype: file.type,
          size: file.size,
          fieldname: 'images',
          encoding: '7bit',
          destination: '',
          filename: '',
          path: ''
        };
      })
    );

    // Upload files to Cloudinary with progress tracking
    const uploadPromises = multerFiles.map(uploadToCloudinary);
    const uploadedResults = await Promise.all(uploadPromises);

    return NextResponse.json({
      message: 'Files uploaded successfully',
      files: uploadedResults
    }, { status: 200 });

  } catch (error) {
    console.error('Upload error:', error);

    // Handle Multer errors
    if (error instanceof multer.MulterError) {
      const errorResponse = {
        error: 'File upload error',
        code: error.code,
        message: (() => {
          switch (error.code) {
            case 'LIMIT_FILE_SIZE':
              return `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
            case 'LIMIT_FILE_COUNT':
              return `Too many files. Maximum is ${MAX_FILES} files`;
            case 'LIMIT_UNEXPECTED_FILE':
              return 'Unexpected field name in upload';
            default:
              return error.message;
          }
        })()
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Handle validation errors
    if (error instanceof Error && error.message.includes('File type not allowed')) {
      return NextResponse.json({
        error: 'Invalid file type',
        message: error.message,
        allowedTypes: ALLOWED_FILE_TYPES
      }, { status: 400 });
    }

    // Handle other errors
    return NextResponse.json({
      error: 'Upload failed',
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};