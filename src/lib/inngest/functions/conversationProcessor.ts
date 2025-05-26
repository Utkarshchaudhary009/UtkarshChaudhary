import { inngest } from "@/lib/inngest/client";
import { processConversationTTS } from "@/lib/inngest/helper/conversationTTS";

// Define the Conversation TTS event interface
export interface ConversationTTSEvent {
    name: "conversation.tts.requested";
    data: {
        speakers: { name: string, voiceName: string }[];
        content: { speakerName: string, text: string }[];
        userId?: string;
    };
}

// Create the Conversation TTS processor function
export const conversationProcessor = inngest.createFunction(
    {
        id: "conversation-tts-processor",
        // Configure retries for robustness
        retries: 3
    },
    { event: "conversation.tts.requested" },
    async ({ event, step }) => {
        const { speakers, content, userId = "admin" } = event.data;

        // Log the start of Conversation TTS processing
        await step.run("log-conversation-tts-start", () => {
            console.log(`Starting Conversation TTS processing with ${speakers.length} speakers and ${content.length} lines`);
            return {
                started: true,
                timestamp: new Date().toISOString(),
                speakers: speakers.map((s: { name: string }) => s.name)
            };
        });

        // Process Conversation TTS with retries
        const result = await step.run("process-conversation-tts", async () => {
            return await processConversationTTS(speakers, content);
        });

        // If there was an error, handle it specifically
        if ('error' in result) {
            await step.run("log-conversation-tts-error", () => {
                console.error(`Conversation TTS processing error:`, result.error);
                return { error: result.error };
            });
        }

        // Log the completion and return the result
        return {
            success: !('error' in result),
            result,
            processedAt: new Date().toISOString()
        };
    }
); 