import { connectDB } from '@/lib/db';
import { TTSRequests } from '@/lib/models/TTSRequest';
import { NextRequest, NextResponse } from 'next/server';

/**
 * TTS Status API endpoint
 * 
 * Allows clients to check the status of a TTS job
 */
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        // Get the job ID from the query parameters
        const searchParams = req.nextUrl.searchParams;
        const jobId = searchParams.get('jobId');

        if (!jobId) {
            return NextResponse.json(
                { error: 'Job ID is required' },
                { status: 400 }
            );
        }

        // Look up the job status in the database
        // Note: You'll need to store the Inngest job ID in your TTSRequests model
        const job = await TTSRequests.findOne({ inngestJobId: jobId });

        if (!job) {
            return NextResponse.json(
                { error: 'Job not found', jobId },
                { status: 404 }
            );
        }

        // Return the job status
        return NextResponse.json({
            jobId,
            status: job.status,
            audioUrl: job.cloudinaryUrl || null,
            error: job.error || null,
            createdAt: job.createdAt,
            completedAt: job.updatedAt,
        });

    } catch (error: any) {
        console.error('TTS status check error:', error);

        return NextResponse.json(
            {
                error: 'Failed to check TTS status',
                message: error.message
            },
            { status: 500 }
        );
    }
} 