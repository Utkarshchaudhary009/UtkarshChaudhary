import { z } from 'zod';
import { BaseNode } from 'langraph.js';

export const AgentStateSchema = z.object({
    query: z.string(),
    context: z.array(z.string()).optional(),
    thought: z.string().optional(),
    action: z.string().optional(),
    result: z.unknown().optional(),
});

export type AgentState = z.infer<typeof AgentStateSchema>;

export interface BaseAgentNode extends BaseNode {
    state: AgentState;
}

export const ContentNodeSchema = z.object({
    content: z.string(),
    metadata: z.record(z.string(), z.unknown()).optional(),
    type: z.enum(['blog', 'project']),
});

export type ContentNode = z.infer<typeof ContentNodeSchema>;
