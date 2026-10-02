export interface ChatUser {
  _id: string;
  name?: string;
  email: string;
  createdAt: string;
}

export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
  clientId?: string; // id of the optimistic copy this message replaces
  failed?: boolean;  // optimistic message the server rejected
}

export interface SendMessagePayload {
  to: string;
  content: string;
  clientId: string;
}

export interface MessageErrorPayload {
  clientId?: string;
  to: string;
  message: string;
}

export interface TypingPayload {
  from: string;
  isTyping: boolean;
}

export interface UnreadCounts {
  [userId: string]: number;
}
