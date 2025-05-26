import { inngest } from "@/lib/inngest/client";
import { TTS } from "@/lib/inngest/helper/tts";

// Define the TTS result interface


// Define the TTS event interface
export interface TTSEvent {
    name: "tts.requested";
    data: {
        text: string;
        title: string;
        userId?: string;
    };
}

// Create the TTS processor function
export const ttsProcessor = inngest.createFunction(
    {
        id: "tts-processor",
        retries: 3
    },
    { event: "tts.requested" },
    async ({ event, step }) => {
        const { text, title, userId = "admin" } = event.data;

        // Log the start of TTS processing
        await step.run("log-tts-start", () => {
            console.log(`Starting TTS processing for "${title}"`);
            return { started: true, timestamp: new Date().toISOString() };
        });

        // Process TTS with retries - pass the Inngest execution ID to track the job
        const result = await step.run("process-tts", async () => {
            return await TTS(text, title);
        });

        // If there was an error, we can handle it specifically
        if ('error' in result) {
            await step.run("log-tts-error", () => {
                console.error(`TTS processing error for "${title}":`, result.error);
                return { error: result.error };
            });
        }

        // Log the completion and return the result
        return {
            success: result.success,
            result,
            processedAt: new Date().toISOString()
        };
    }
);