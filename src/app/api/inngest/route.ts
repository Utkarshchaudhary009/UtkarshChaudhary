// src/app/api/inngest/route.ts
import { inngest } from "@/lib/inngest/client";
// import { ttsProcessor } from "@/lib/inngest/functions/ttsProcessor";
// import { conversationProcessor } from "@/lib/inngest/functions/conversationProcessor";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        // ttsProcessor,
        // conversationProcessor,
    ],
});

