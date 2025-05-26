import { connectDB } from '@/lib/db';
import { TTSRequests } from '@/lib/models/TTSRequest';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Conversation TTS Status API endpoint
 * 
 * Allows clients to check the status of a conversation TTS job
 */
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        // Get the job ID from the query parameters
        const searchParams = req.nextUrl.searchParams;
        const jobId = searchParams.get('jobId');

        if (!jobId) {
            return NextResponse.json(
                { success: false, error: 'Job ID is required' },
                { status: 400 }
            );
        }

        // Look up the job status in the database
        const job = await TTSRequests.findOne({ inngestJobId: jobId });

        if (!job) {
            return NextResponse.json(
                { success: false, error: 'Job not found', jobId },
                { status: 404 }
            );
        }

        // Return the job status
        return NextResponse.json({
            success: true,
            jobId,
            status: job.status,
            audioUrl: job.cloudinaryUrl || null,
            error: job.error || null,
            createdAt: job.createdAt,
            completedAt: job.updatedAt,
            charactersUsed: job.charactersUsed || 0
        });

    } catch (error: any) {
        console.error('Conversation TTS status check error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to check TTS status',
                message: error.message
            },
            { status: 500 }
        );
    }
} 