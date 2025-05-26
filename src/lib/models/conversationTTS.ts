export interface ConversationRequest {
    prompt: string
    apiKey?: string
}

export interface GeneratedSpeaker {
    name: string
    voiceName: string
}

export interface GeneratedContent {
    speakerName: string
    text: string
}

export interface ConversationResponse {
    success: boolean
    speakers?: GeneratedSpeaker[]
    content?: GeneratedContent[]
    conversationStyle?: string
    conversationFileName?: string
    error?: string
}
