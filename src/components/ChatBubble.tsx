import type { Message } from '../types/chat.types';
import { useAppSelector } from '../store';

interface ChatBubbleProps {
  message: Message;
}

const ChatBubble = ({ message }: ChatBubbleProps) => {
  const currentUserId = useAppSelector((s) => s.auth.user?._id);
  const isMine = message.senderId === currentUserId;

  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`chat-bubble-row ${isMine ? 'chat-bubble-row--mine' : 'chat-bubble-row--theirs'}`}>
      <div className={`chat-bubble ${isMine ? 'chat-bubble--mine' : 'chat-bubble--theirs'}`}>
        <p className="chat-bubble-text">{message.content}</p>
        <div className="chat-bubble-meta">
          <span className="chat-bubble-time">{time}</span>
          {isMine && message.failed && (
            <span className="chat-bubble-failed" title="This message could not be sent">Not sent</span>
          )}
          {isMine && !message.failed && (
            <span className="chat-bubble-read" title={message.read ? 'Seen' : 'Sent'}>
              {message.read ? (
                /* Double check mark */
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                  <polyline points="20 6 9 17 4 12" style={{ transform: 'translateX(4px)' }} />
                </svg>
              ) : (
                /* Single check mark */
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
