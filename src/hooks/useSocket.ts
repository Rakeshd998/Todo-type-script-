import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { store, useAppSelector } from '../store';
import {
  addMessage,
  confirmMessage,
  failMessage,
  setMessagesRead,
  setOnlineUsers,
  incrementUnread,
  setTyping,
} from '../store/slices/chatSlice';
import type { Message, MessageErrorPayload, TypingPayload } from '../types/chat.types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:5000';

// Module-level singletons: one socket and one "open chat" for the whole app
let socketInstance: Socket | null = null;
let activePeer: string | null = null;

// Read from the store at event time, so listeners never see a stale user/token
const getCurrentUserId = () => store.getState().auth.user?._id;

const createSocket = (): Socket => {
  const socket = io(SOCKET_URL, {
    // Evaluated on every (re)connect, so reconnects use the latest access token
    auth: (cb) => cb({ token: store.getState().auth.accessToken }),
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
  const { dispatch } = store;

  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.warn('Socket connection error:', err.message);
  });

  // ── Online presence ────────────────────────────────────────────────────────
  socket.on('online-users', (userIds: string[]) => {
    dispatch(setOnlineUsers(userIds));
  });

  // ── Incoming message from another user ─────────────────────────────────────
  socket.on('new-message', (message: Message) => {
    const currentUserId = getCurrentUserId();
    const peerId = message.senderId === currentUserId ? message.receiverId : message.senderId;
    dispatch(addMessage({ peerId, message }));

    // Increment unread only when the chat with that peer is not open
    if (message.senderId !== currentUserId && activePeer !== message.senderId) {
      dispatch(incrementUnread(message.senderId));
    }
  });

  // ── Server confirms our sent message (replace optimistic copy) ─────────────
  socket.on('message-confirmed', (message: Message) => {
    dispatch(confirmMessage({ peerId: message.receiverId, message }));
  });

  // ── Server rejected our message ────────────────────────────────────────────
  socket.on('message-error', ({ clientId, to, message }: MessageErrorPayload) => {
    console.warn('Message not sent:', message);
    if (clientId && to) dispatch(failMessage({ peerId: to, clientId }));
  });

  // ── Live read receipt: peer has read our messages ──────────────────────────
  socket.on('messages-read', ({ by }: { by: string }) => {
    const currentUserId = getCurrentUserId();
    if (currentUserId) dispatch(setMessagesRead({ peerId: by, senderId: currentUserId }));
  });

  // ── Typing indicator ───────────────────────────────────────────────────────
  socket.on('user-typing', ({ from, isTyping }: TypingPayload) => {
    dispatch(setTyping({ userId: from, isTyping }));
  });

  return socket;
};

// ── Connection lifecycle — call once, at the app root ───────────────────────
export const useSocket = () => {
  const accessToken = useAppSelector((s) => s.auth.accessToken);

  useEffect(() => {
    if (!accessToken) {
      socketInstance?.disconnect();
      socketInstance = null;
      return;
    }

    if (!socketInstance) {
      socketInstance = createSocket();
    } else if (!socketInstance.connected) {
      // Token was refreshed after an auth failure — retry with the new one
      socketInstance.connect();
    }
    // Don't disconnect on unmount — keep socket alive for background notifications
  }, [accessToken]);
};

// ── Actions used by the chat UI ─────────────────────────────────────────────

// Set by ChatPage to suppress unread increments for the open conversation
export const setActivePeer = (id: string | null) => {
  activePeer = id;
};

// Returns false if there is no socket. While reconnecting, socket.io buffers the emit.
export const sendMessage = (to: string, content: string, clientId: string): boolean => {
  if (!socketInstance) return false;
  socketInstance.emit('send-message', { to, content, clientId });
  return true;
};

export const emitTyping = (to: string, isTyping: boolean) => {
  if (!socketInstance?.connected) return;
  socketInstance.emit('typing', { to, isTyping });
};
