import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Send,
  Image as ImageIcon,
  Smile,
  BadgeCheck,
  MoreVertical,
  Phone,
  Video,
  CheckCheck,
  UserPlus,
  MessageSquare,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import Avatar from '../components/common/Avatar';

const quickChatReplies = [
  'Sounds fantastic! Let’s ship it! 🚀',
  'Totally agree with that direction ✨',
  'Checking the specs right now. 💻',
  'The glassmorphic design looks gorgeous! 💜',
];

const formatMessageTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

const MessagesPage = () => {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetUserIdParam = searchParams.get('user');

  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [messageInput, setMessageInput] = useState('');

  const messagesEndRef = useRef(null);
  const activeUserIdRef = useRef(null);

  // Keep ref synced with activeUser
  useEffect(() => {
    activeUserIdRef.current = activeUser?._id || null;
  }, [activeUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch conversations list
  const fetchConversations = useCallback(async (selectTargetId = null) => {
    try {
      const { data } = await api.get('/api/messages/conversations');
      setConversations(data);

      const targetId = selectTargetId || targetUserIdParam || activeUserIdRef.current;

      if (targetId) {
        const found = data.find((c) => c.user._id === targetId);
        if (found) {
          setActiveUser(found.user);
        } else {
          // If not in existing conversations, fetch user details
          try {
            const userRes = await api.get(`/api/users/${targetId}`);
            setActiveUser(userRes.data);
          } catch {
            if (data.length > 0 && !activeUserIdRef.current) {
              setActiveUser(data[0].user);
            }
          }
        }
      } else if (data.length > 0 && !activeUserIdRef.current) {
        setActiveUser(data[0].user);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoadingConvs(false);
    }
  }, [targetUserIdParam]);

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Handle URL param changes (e.g. clicking Message from profile)
  useEffect(() => {
    if (targetUserIdParam) {
      fetchConversations(targetUserIdParam);
    }
  }, [targetUserIdParam, fetchConversations]);

  // Fetch messages for active user
  const fetchMessages = useCallback(async (userId, isBackground = false) => {
    if (!userId) return;
    if (!isBackground) setLoadingChat(true);

    try {
      const { data } = await api.get(`/api/messages/chat/${userId}`);
      if (data.user) {
        setActiveUser(data.user);
      }
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Failed to load chat:', err);
    } finally {
      if (!isBackground) setLoadingChat(false);
    }
  }, []);

  // When activeUser changes, fetch chat messages
  useEffect(() => {
    if (activeUser?._id) {
      fetchMessages(activeUser._id);
    } else {
      setMessages([]);
    }
  }, [activeUser?._id, fetchMessages]);

  // Polling every 3 seconds for new incoming messages from other real accounts
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeUserIdRef.current) {
        fetchMessages(activeUserIdRef.current, true);
      }
      // Also silently refresh conversations to update unread counts
      api.get('/api/messages/conversations')
        .then((res) => setConversations(res.data))
        .catch(() => {});
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Live user search to start new conversations
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get(`/api/users/search?q=${encodeURIComponent(q)}`);
        setSearchResults(data);
      } catch {
        setSearchResults([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Select a user to chat with
  const handleSelectUser = (user) => {
    setActiveUser(user);
    setSearchQuery('');
    setSearchResults([]);
    // Update unread count locally for instant UI feedback
    setConversations((prev) =>
      prev.map((c) => (c.user._id === user._id ? { ...c, unreadCount: 0 } : c))
    );
  };

  // Send message to real account (NO auto reply!)
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const text = messageInput.trim();
    if (!text || !activeUser?._id || sending) return;

    setSending(true);
    setMessageInput('');

    try {
      const { data: newMsg } = await api.post('/api/messages', {
        recipientId: activeUser._id,
        text,
      });

      // Append sent message to stream
      setMessages((prev) => [...prev, newMsg]);

      // Update conversations list with latest message
      setConversations((prev) => {
        const existing = prev.find((c) => c.user._id === activeUser._id);
        const updatedLast = {
          id: newMsg.id,
          text: newMsg.text,
          createdAt: newMsg.createdAt,
          senderId: newMsg.senderId,
          isOwn: true,
        };

        if (existing) {
          return prev.map((c) =>
            c.user._id === activeUser._id
              ? { ...c, lastMessage: updatedLast }
              : c
          );
        } else {
          return [
            {
              user: activeUser,
              lastMessage: updatedLast,
              unreadCount: 0,
            },
            ...prev,
          ];
        }
      });
    } catch (err) {
      console.error('Send message failed:', err);
      addToast(err.response?.data?.message || 'Failed to send message', 'error');
      setMessageInput(text); // restore input if failed
    } finally {
      setSending(false);
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter(
    (c) =>
      c.user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="messages-page-wrapper">
      <div className="glass-card messages-container">
        {/* Left Pane: Conversations & Contacts */}
        <div className="messages-sidebar">
          {/* Header */}
          <div className="messages-sidebar-header">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-dark)', margin: 0 }}>
              Messages
            </h2>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                background: 'rgba(118, 85, 232, 0.12)',
                color: 'var(--color-primary)',
                padding: '3px 8px',
                borderRadius: '12px',
              }}
            >
              Direct Chat
            </span>
          </div>

          {/* Search Contacts or find new users */}
          <div style={{ padding: '0 1rem 0.85rem' }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={15}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-light)',
                }}
              />
              <input
                type="text"
                placeholder="Search or find people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{
                  paddingLeft: 36,
                  paddingRight: 10,
                  fontSize: '0.84rem',
                  borderRadius: 'var(--radius-pill)',
                  background: 'rgba(255, 255, 255, 0.7)',
                  height: 36,
                }}
              />
            </div>
          </div>

          {/* User Search Results Dropdown/List */}
          {searchQuery.trim() && searchResults.length > 0 && (
            <div style={{ padding: '0 0.75rem 0.5rem' }}>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  padding: '0.25rem 0.5rem',
                }}
              >
                Search People
              </div>
              {searchResults.map((u) => (
                <div
                  key={u._id}
                  onClick={() => handleSelectUser(u)}
                  className="conversation-item"
                  style={{ borderRadius: 'var(--radius-lg)', margin: '2px 0' }}
                >
                  <Avatar src={u.profilePicture} name={u.fullName} size="sm" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="conv-user-name">{u.fullName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      @{u.username}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                    Message
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Conversations list */}
          <div className="conversations-list">
            {loadingConvs ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <div className="spinner" style={{ margin: '0 auto 0.75rem' }} />
                <span style={{ fontSize: '0.82rem' }}>Loading conversations...</span>
              </div>
            ) : filteredConversations.length === 0 && !searchQuery.trim() ? (
              <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <MessageSquare size={32} style={{ opacity: 0.35, marginBottom: '0.5rem' }} />
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)' }}>
                  No messages yet
                </div>
                <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  Search for a user above or visit their profile to start chatting.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/discover')}
                  className="btn-outline-primary"
                  style={{ marginTop: '0.75rem', padding: '0.4rem 0.9rem', fontSize: '0.8rem', borderRadius: 'var(--radius-pill)' }}
                >
                  <Users size={14} style={{ marginRight: 4 }} /> Discover People
                </button>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = conv.user._id === activeUser?._id;
                const lastMsg = conv.lastMessage;

                return (
                  <div
                    key={conv.user._id}
                    onClick={() => handleSelectUser(conv.user)}
                    className={`conversation-item ${isActive ? 'active' : ''}`}
                  >
                    <div style={{ position: 'relative' }}>
                      <Avatar src={conv.user.profilePicture} name={conv.user.fullName} size="md" />
                      <span className="online-status-dot" />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3, minWidth: 0 }}>
                          <span className="conv-user-name">{conv.user.fullName}</span>
                          <BadgeCheck size={13} className="verified-badge-icon" />
                        </div>
                        <span className="conv-time">
                          {lastMsg ? formatMessageTime(lastMsg.createdAt) : ''}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p className="conv-preview-text">
                          {lastMsg ? (lastMsg.isOwn ? 'You: ' : '') + lastMsg.text : 'Click to chat'}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="badge conv-unread-badge">{conv.unreadCount}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Active Chat Window */}
        <div className="messages-chat-window">
          {activeUser ? (
            <>
              {/* Active Chat Header */}
              <div className="chat-header">
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                  onClick={() => navigate(`/profile/${activeUser._id}`)}
                  title="View Profile"
                >
                  <div style={{ position: 'relative' }}>
                    <Avatar src={activeUser.profilePicture} name={activeUser.fullName} size="md" />
                    <span className="online-status-dot" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--color-text-dark)' }}>
                        {activeUser.fullName}
                      </span>
                      <BadgeCheck size={15} className="verified-badge-icon" />
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                      @{activeUser.username}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    type="button"
                    className="btn-icon-subtle"
                    onClick={() => addToast('Audio calls launching soon in SOCIALY! 🎧', 'info')}
                    title="Start Audio Call"
                  >
                    <Phone size={17} />
                  </button>
                  <button
                    type="button"
                    className="btn-icon-subtle"
                    onClick={() => addToast('Video calls launching soon! 📹', 'info')}
                    title="Start Video Call"
                  >
                    <Video size={17} />
                  </button>
                  <button
                    type="button"
                    className="btn-icon-subtle"
                    onClick={() => navigate(`/profile/${activeUser._id}`)}
                    title="View Profile"
                  >
                    <MoreVertical size={17} />
                  </button>
                </div>
              </div>

              {/* Messages Stream */}
              <div className="chat-messages-body">
                {loadingChat ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
                    <div className="spinner" style={{ margin: '0 auto 0.75rem' }} />
                    <span style={{ fontSize: '0.85rem' }}>Loading conversation...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--color-text-muted)' }}>
                    <Avatar src={activeUser.profilePicture} name={activeUser.fullName} size="xl" style={{ margin: '0 auto 0.75rem' }} />
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-text)' }}>
                      Say hello to {activeUser.fullName}!
                    </div>
                    <p style={{ fontSize: '0.84rem', marginTop: '0.35rem', color: 'var(--color-text-muted)' }}>
                      Send your first message to connect in real time.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`chat-bubble-row ${msg.isOwn ? 'chat-bubble-own' : 'chat-bubble-peer'}`}
                    >
                      {!msg.isOwn && (
                        <Avatar src={activeUser.profilePicture} name={activeUser.fullName} size="xs" />
                      )}
                      <div className={`chat-bubble ${msg.isOwn ? 'bubble-own' : 'bubble-peer'}`}>
                        <p style={{ margin: 0, lineHeight: 1.5, wordBreak: 'break-word' }}>{msg.text}</p>
                        <div className="bubble-meta">
                          <span>{formatMessageTime(msg.createdAt)}</span>
                          {msg.isOwn && <CheckCheck size={13} style={{ marginLeft: 3, opacity: 0.8 }} />}
                        </div>
                      </div>
                    </div>
                  ))
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick reply suggestions */}
              <div className="chat-quick-replies">
                {quickChatReplies.map((qr) => (
                  <button
                    key={qr}
                    type="button"
                    onClick={() => setMessageInput(qr)}
                    className="quick-reply-pill"
                  >
                    {qr}
                  </button>
                ))}
              </div>

              {/* Composer Input Bar */}
              <form onSubmit={handleSendMessage} className="chat-input-bar">
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn-icon-subtle"
                    onClick={() => addToast('File & photo attachments ready for chat', 'info')}
                    title="Attach photo"
                  >
                    <ImageIcon size={18} color="var(--color-primary)" />
                  </button>
                  <button
                    type="button"
                    className="btn-icon-subtle"
                    onClick={() => setMessageInput((prev) => prev + ' 💜')}
                    title="Add emoji"
                  >
                    <Smile size={18} color="#ec4899" />
                  </button>
                </div>

                <input
                  type="text"
                  placeholder={`Message ${activeUser.fullName.split(' ')[0]}...`}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="chat-text-input"
                  autoFocus
                />

                <button
                  type="submit"
                  disabled={!messageInput.trim() || sending}
                  className="chat-send-btn"
                  title="Send message (Enter)"
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                padding: '2rem',
                color: 'var(--color-text-muted)',
              }}
            >
              <MessageSquare size={48} style={{ opacity: 0.3, marginBottom: '1rem', color: 'var(--color-primary)' }} />
              <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-text)' }}>
                Select a Conversation
              </div>
              <p style={{ fontSize: '0.88rem', marginTop: '0.35rem', textAlign: 'center', maxWidth: 360 }}>
                Choose a conversation from the left or discover people to start connecting.
              </p>
              <button
                type="button"
                onClick={() => navigate('/discover')}
                className="btn-primary"
                style={{ marginTop: '1rem', padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-pill)' }}
              >
                <Users size={16} style={{ marginRight: 6 }} /> Discover People
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
