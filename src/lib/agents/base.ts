import { BaseNode, Graph } from 'langraph.js';
import { AgentState, BaseAgentNode } from '../types/langraph';
import { LLMChain } from 'langchain/chains';
import { PromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';

export abstract class BaseAgent implements BaseAgentNode {
    state: AgentState;
    llmChain: LLMChain;
    
    constructor(initialState: AgentState) {
        this.state = initialState;
        this.llmChain = new LLMChain({
            llm: new ChatOpenAI({ temperature: 0 }),
            prompt: this.getPrompt()
        });
    }

    abstract getPrompt(): PromptTemplate;
    abstract run(graph: Graph): Promise<void>;
}
