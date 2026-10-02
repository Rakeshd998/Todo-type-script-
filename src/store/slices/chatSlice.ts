import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { clearCredentials } from './authSlice';
import { chatApi } from '../api/chatApi';
import type { Message, UnreadCounts } from '../../types/chat.types';

interface ChatState {
  conversations: Record<string, Message[]>;  // keyed by the other userId
  onlineUsers: string[];
  unreadCounts: UnreadCounts;
  typingUsers: Record<string, boolean>;       // userId -> isTyping
}

const initialState: ChatState = {
  conversations: {},
  onlineUsers: [],
  unreadCounts: {},
  typingUsers: {},
};

const byCreatedAt = (a: Message, b: Message) =>
  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // ── Incoming message from socket ──────────────────────────────────────────
    addMessage(state, action: PayloadAction<{ peerId: string; message: Message }>) {
      const { peerId, message } = action.payload;
      if (!state.conversations[peerId]) state.conversations[peerId] = [];
      const exists = state.conversations[peerId].some((m) => m._id === message._id);
      if (!exists) {
        state.conversations[peerId].push(message);
      }
    },

    // Replace optimistic message with server-confirmed one (matched by clientId)
    confirmMessage(state, action: PayloadAction<{ peerId: string; message: Message }>) {
      const { peerId, message } = action.payload;
      if (!state.conversations[peerId]) state.conversations[peerId] = [];
      const conv = state.conversations[peerId];
      const idx = conv.findIndex(
        (m) => m._id === message._id || (!!message.clientId && m._id === message.clientId),
      );
      if (idx !== -1) {
        conv[idx] = message;
      } else {
        // Sent from another tab/device of the same user
        conv.push(message);
      }
    },

    // Server rejected an optimistic message
    failMessage(state, action: PayloadAction<{ peerId: string; clientId: string }>) {
      const msg = state.conversations[action.payload.peerId]?.find(
        (m) => m._id === action.payload.clientId,
      );
      if (msg) msg.failed = true;
    },

    // ── Optimistic send ───────────────────────────────────────────────────────
    addOptimisticMessage(state, action: PayloadAction<{ peerId: string; message: Message }>) {
      const { peerId, message } = action.payload;
      if (!state.conversations[peerId]) state.conversations[peerId] = [];
      state.conversations[peerId].push(message);
    },

    // ── Load history from REST API ────────────────────────────────────────────
    // Merge instead of replace, so messages received over the socket after the
    // history was fetched (or still-pending optimistic ones) aren't lost.
    setHistory(state, action: PayloadAction<{ peerId: string; messages: Message[] }>) {
      const { peerId, messages } = action.payload;
      const merged = new Map<string, Message>();
      for (const m of messages) merged.set(m._id, m);
      for (const m of state.conversations[peerId] ?? []) {
        const fromHistory = merged.get(m._id);
        // Keep the freshest read flag (a live read receipt may be newer than the history)
        if (fromHistory) fromHistory.read = fromHistory.read || m.read;
        else merged.set(m._id, m);
      }
      state.conversations[peerId] = [...merged.values()].sort(byCreatedAt);
    },

    // Mark messages in a conversation as read. senderId selects whose messages:
    // the peer's (we opened the chat) or ours (live read receipt from the peer).
    setMessagesRead(state, action: PayloadAction<{ peerId: string; senderId: string }>) {
      for (const m of state.conversations[action.payload.peerId] ?? []) {
        if (m.senderId === action.payload.senderId) m.read = true;
      }
    },

    // ── Online presence ───────────────────────────────────────────────────────
    setOnlineUsers(state, action: PayloadAction<string[]>) {
      state.onlineUsers = action.payload;
    },

    // ── Unread counts ─────────────────────────────────────────────────────────
    setUnreadCounts(state, action: PayloadAction<UnreadCounts>) {
      state.unreadCounts = action.payload;
    },
    incrementUnread(state, action: PayloadAction<string>) {
      const userId = action.payload;
      state.unreadCounts[userId] = (state.unreadCounts[userId] ?? 0) + 1;
    },
    clearUnread(state, action: PayloadAction<string>) {
      state.unreadCounts[action.payload] = 0;
    },

    // ── Typing indicators ─────────────────────────────────────────────────────
    setTyping(state, action: PayloadAction<{ userId: string; isTyping: boolean }>) {
      state.typingUsers[action.payload.userId] = action.payload.isTyping;
    },
  },
  extraReducers: (builder) => {
    builder
      // Wipe all chat data on logout / session expiry so the next user never sees it
      .addCase(clearCredentials, () => initialState)
      // Seed unread badges from the server
      .addMatcher(chatApi.endpoints.getUnreadCounts.matchFulfilled, (state, action) => {
        state.unreadCounts = action.payload;
      });
  },
});

export const {
  addMessage,
  confirmMessage,
  failMessage,
  addOptimisticMessage,
  setHistory,
  setMessagesRead,
  setOnlineUsers,
  setUnreadCounts,
  incrementUnread,
  clearUnread,
  setTyping,
} = chatSlice.actions;

export default chatSlice.reducer;
