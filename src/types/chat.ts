export interface Model {
    id: string;
    name: string;
    description: string;
    thinking?: boolean;
    vision?: boolean;
}

export interface Attachment {
    data: string;
    mimeType: string;
    name?: string;
}

export interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    attachments?: Attachment[];
    thoughts?: string;
    isStreaming?: boolean;
    relatedQuestions?: string[];
    createdAt?: number;
    streamId?: string;
}
