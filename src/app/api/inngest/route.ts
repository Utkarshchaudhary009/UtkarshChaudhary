// src/app/api/inngest/route.ts
import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { ttsProcessor } from "@/lib/inngest/functions/ttsProcessor";


export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        ttsProcessor
    ],
});
