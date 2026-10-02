import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  setHistory,
  setMessagesRead,
  clearUnread,
  addOptimisticMessage,
} from '../store/slices/chatSlice';
import {
  useGetChatUsersQuery,
  useGetChatHistoryQuery,
  useMarkReadMutation,
} from '../store/api/chatApi';
import { sendMessage, emitTyping, setActivePeer } from '../hooks/useSocket';
import ChatBubble from './ChatBubble';
import AppShell from './AppShell';
import type { ChatUser } from '../types/chat.types';

const ChatPage = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const conversations = useAppSelector((s) => s.chat.conversations);
  const onlineUsers = useAppSelector((s) => s.chat.onlineUsers);
  const unreadCounts = useAppSelector((s) => s.chat.unreadCounts);
  const typingUsers = useAppSelector((s) => s.chat.typingUsers);


  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [inputText, setInputText] = useState('');
  const [search, setSearch] = useState('');
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ── REST queries ────────────────────────────────────────────────────────────
  const { data: users = [], isLoading: usersLoading } = useGetChatUsersQuery();
  const { data: historyData } = useGetChatHistoryQuery(
    { userId: selectedUser?._id ?? '' },
    // Always refetch when (re)opening a conversation — the cached copy may be stale
    { skip: !selectedUser, refetchOnMountOrArgChange: true }
  );
  const [markRead] = useMarkReadMutation();

  const peerId = selectedUser?._id;
  const messages = peerId ? (conversations[peerId] ?? []) : [];

  // ── Load history into Redux when REST data arrives ───────────────────────
  useEffect(() => {
    if (historyData && peerId) {
      dispatch(setHistory({ peerId, messages: historyData }));
    }
  }, [historyData, peerId, dispatch]);

  // ── Mark the open conversation as read (on open and as new messages arrive) ──
  const hasUnreadFromPeer = !!peerId && messages.some((m) => m.senderId === peerId && !m.read);
  useEffect(() => {
    if (!peerId || !hasUnreadFromPeer) return;
    dispatch(setMessagesRead({ peerId, senderId: peerId }));
    dispatch(clearUnread(peerId));
    markRead(peerId);
  }, [peerId, hasUnreadFromPeer, dispatch, markRead]);

  // ── Activate peer (suppress unread increments while it's open) ───────────
  const selectUser = useCallback(
    (u: ChatUser) => {
      setSelectedUser(u);
      setActivePeer(u._id);
      dispatch(clearUnread(u._id));
      setTimeout(() => inputRef.current?.focus(), 100);
    },
    [dispatch]
  );

  // ── Deactivate peer on unmount ────────────────────────────────────────────
  useEffect(() => {
    return () => setActivePeer(null);
  }, []);

  // ── Auto-scroll on new messages ───────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedUser, conversations]);

  // ── Send message ─────────────────────────────────────────────────────────
  const handleSend = useCallback(() => {
    const content = inputText.trim();
    if (!content || !selectedUser || !user) return;

    // Unique id for the optimistic copy; the server echoes it back on confirm/error
    const clientId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const sent = sendMessage(selectedUser._id, content, clientId);

    dispatch(
      addOptimisticMessage({
        peerId: selectedUser._id,
        message: {
          _id: clientId,
          senderId: user._id,
          receiverId: selectedUser._id,
          content,
          read: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          failed: !sent,
        },
      })
    );
    setInputText('');
    if (typingTimer.current) clearTimeout(typingTimer.current);
    emitTyping(selectedUser._id, false);
  }, [inputText, selectedUser, user, dispatch]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Typing indicator ──────────────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (!selectedUser) return;

    emitTyping(selectedUser._id, true);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      emitTyping(selectedUser._id, false);
    }, 2000);
  };

  // ── Filtered user list ────────────────────────────────────────────────────
  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );


  return (
    <AppShell>

      {/* ── Chat Layout ── */}
      <div className="chat-layout">
        {/* Left Panel — User List */}
        <aside className="chat-sidebar">
          <div className="chat-sidebar-header">
            <h2 className="chat-sidebar-title">Messages</h2>
          </div>
          <div className="chat-search-wrap">
            <svg className="chat-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              id="chat-search"
              className="chat-search-input"
              type="text"
              placeholder="Search users…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <ul className="chat-user-list">
            {usersLoading ? (
              <li className="chat-user-list-empty">
                <div className="loading-spinner" />
              </li>
            ) : filteredUsers.length === 0 ? (
              <li className="chat-user-list-empty">No users found</li>
            ) : (
              filteredUsers.map((u) => {
                const isOnline = onlineUsers.includes(u._id);
                const unread = unreadCounts[u._id] ?? 0;
                const isSelected = selectedUser?._id === u._id;
                const initials = u.name
                  ? u.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
                  : u.email[0].toUpperCase();

                return (
                  <li key={u._id}>
                    <button
                      id={`chat-user-${u._id}`}
                      className={`chat-user-item ${isSelected ? 'chat-user-item--active' : ''}`}
                      onClick={() => selectUser(u)}
                    >
                      <div className="chat-avatar">
                        <span className="chat-avatar-initials">{initials}</span>
                        {isOnline && <span className="online-dot" aria-label="Online" />}
                      </div>
                      <div className="chat-user-info">
                        <span className="chat-user-name">{u.name ?? u.email}</span>
                        <span className="chat-user-email">{u.email}</span>
                      </div>
                      {unread > 0 && (
                        <span className="unread-badge">{unread > 99 ? '99+' : unread}</span>
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </aside>

        {/* Right Panel — Conversation */}
        <main className="chat-main">
          {!selectedUser ? (
            <div className="chat-empty-state">
              <div className="chat-empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3>Start a conversation</h3>
              <p>Select a user from the left to start chatting</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="chat-header">
                <div className="chat-avatar">
                  <span className="chat-avatar-initials">
                    {selectedUser.name
                      ? selectedUser.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
                      : selectedUser.email[0].toUpperCase()}
                  </span>
                  {onlineUsers.includes(selectedUser._id) && (
                    <span className="online-dot" />
                  )}
                </div>
                <div className="chat-header-info">
                  <span className="chat-header-name">{selectedUser.name ?? selectedUser.email}</span>
                  <span className="chat-header-status">
                    {onlineUsers.includes(selectedUser._id) ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="chat-messages" id="chat-messages-area">
                {messages.length === 0 ? (
                  <div className="chat-no-messages">
                    <p>No messages yet. Say hi! 👋</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <ChatBubble key={msg._id} message={msg} />
                  ))
                )}

                {/* Typing indicator */}
                {typingUsers[selectedUser._id] && (
                  <div className="chat-typing-indicator">
                    <span /><span /><span />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="chat-input-area">
                <textarea
                  id="chat-message-input"
                  ref={inputRef}
                  className="chat-input"
                  placeholder={`Message ${selectedUser.name ?? selectedUser.email}…`}
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  rows={1}
                />
                <button
                  id="chat-send-btn"
                  className="chat-send-btn"
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  aria-label="Send message"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </main>
      </div>

    </AppShell>
  );
};

export default ChatPage;
