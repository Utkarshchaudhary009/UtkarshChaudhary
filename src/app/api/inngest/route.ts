// src/app/api/inngest/route.ts
import { serve } from "inngest/next";
import { inngest } from "./client";
import { ttsProcessor } from "./functions/ttsProcessor";


export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        ttsProcessor
    ],
});
