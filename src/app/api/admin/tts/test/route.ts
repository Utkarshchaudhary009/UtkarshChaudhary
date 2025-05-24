import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        console.log("Testing database connection...");
        await connectDB();

        // Check connection status
        const readyState = mongoose.connection.readyState;
        const readyStateText = [
            "disconnected",
            "connected",
            "connecting",
            "disconnecting",
            "uninitialized"
        ][readyState];

        console.log(`Database connection state: ${readyStateText} (${readyState})`);

        // Get list of all collections
        const collections = await mongoose.connection.db?.listCollections().toArray();
        const collectionNames = collections?.map(c => c.name) || [];

        console.log(`Available collections: ${collectionNames.join(', ')}`);

        // Get database name
        const dbName = mongoose.connection.db?.databaseName || 'unknown';

        return NextResponse.json({
            status: "success",
            database: {
                connection: {
                    readyState,
                    readyStateText,
                    host: mongoose.connection.host,
                    name: dbName
                },
                collections: collectionNames
            }
        });
    } catch (error: any) {
        console.error("Database connection test failed:", error);
        return NextResponse.json({
            status: "error",
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
} 