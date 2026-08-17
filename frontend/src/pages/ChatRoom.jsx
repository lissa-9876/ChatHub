import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  ArrowLeft, 
  Phone, 
  Video, 
  MoreVertical, 
  Paperclip, 
  Smile, 
  Mic, 
  Send,
  CheckCheck,
  Play,
  Volume2,
  Image as ImageIcon,
  Camera,
  FileText,
  X
} from 'lucide-react';

const mockMessagesInitial = [
  {
    id: 1,
    sender: 'them',
    text: 'Hey Sana! Did you check the latest Chathub UI screens?',
    time: '10:45 AM',
    type: 'text'
  },
  {
    id: 2,
    sender: 'me',
    text: 'Yes! The responsive layout and theme switcher are working smoothly now.',
    time: '10:46 AM',
    status: 'read',
    type: 'text'
  },
  {
    id: 3,
    sender: 'them',
    audioDuration: '0:24',
    time: '10:48 AM',
    type: 'voice'
  },
  {
    id: 4,
    sender: 'me',
    text: 'Sounds great! I will test WebRTC and media sharing next.',
    time: '10:50 AM',
    status: 'read',
    type: 'text'
  }
];

const ChatRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  const [messages, setMessages] = useState(mockMessagesInitial);
  const [inputMessage, setInputMessage] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: 'me',
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      type: 'text'
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage('');
    setShowAttachMenu(false);
  };

  // 🖼️ Gallery Image Upload Handler
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      const newMediaMessage = {
        id: Date.now(),
        sender: 'me',
        mediaUrl: imageUrl,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
        type: 'image'
      };
      setMessages((prev) => [...prev, newMediaMessage]);
      setShowAttachMenu(false);
    }
  };

  return (
    <div 
      style={{
        backgroundColor: isDarkMode ? '#101416' : '#f1f5f9',
        color: isDarkMode ? '#ffffff' : '#0f172a',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        transition: 'background-color 0.3s ease'
      }}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '540px',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: isDarkMode ? '#12181a' : '#ffffff',
          boxShadow: isDarkMode ? '0 0 40px rgba(0,0,0,0.6)' : '0 0 30px rgba(0,0,0,0.06)',
          borderLeft: isDarkMode ? '1px solid #1e2629' : '1px solid #e2e8f0',
          borderRight: isDarkMode ? '1px solid #1e2629' : '1px solid #e2e8f0',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        
        {/* 🔝 Top Header Bar */}
        <div 
          style={{
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: isDarkMode ? '1px solid #1e2629' : '1px solid #e2e8f0',
            backgroundColor: isDarkMode ? '#12181a' : '#ffffff',
            zIndex: 10
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={() => navigate('/inbox')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: isDarkMode ? '#ffffff' : '#0f172a',
                display: 'flex',
                alignItems: 'center',
                padding: '4px'
              }}
            >
              <ArrowLeft size={22} />
            </button>

            <div style={{ position: 'relative' }}>
              <div 
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                AF
              </div>
              <span 
                style={{
                  position: 'absolute',
                  bottom: '1px',
                  right: '1px',
                  width: '11px',
                  height: '11px',
                  backgroundColor: '#22c55e',
                  border: isDarkMode ? '2px solid #12181a' : '2px solid #ffffff',
                  borderRadius: '50%'
                }}
              />
            </div>

            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '700', margin: 0, lineHeight: 1.2 }}>
                Adan Fatima
              </h2>
              <span style={{ fontSize: '12px', color: '#22c55e', fontWeight: '500' }}>
                Online
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
              <Phone size={20} />
            </button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
              <Video size={21} />
            </button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
              <MoreVertical size={20} />
            </button>
          </div>
        </div>

        {/* 💬 Scrollable Message Feed */}
        <div 
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backgroundColor: isDarkMode ? '#0d1113' : '#f8fafc'
          }}
        >
          {messages.map((msg) => {
            const isMe = msg.sender === 'me';
            return (
              <div 
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start'
                }}
              >
                <div 
                  style={{
                    maxWidth: '78%',
                    padding: msg.type === 'voice' ? '10px 14px' : (msg.type === 'image' ? '6px' : '12px 16px'),
                    borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    backgroundColor: isMe 
                      ? '#22c55e' 
                      : (isDarkMode ? '#1a2226' : '#ffffff'),
                    color: isMe 
                      ? '#ffffff' 
                      : (isDarkMode ? '#f1f5f9' : '#0f172a'),
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    border: !isMe && !isDarkMode ? '1px solid #e2e8f0' : 'none',
                    position: 'relative'
                  }}
                >
                  {/* Image Message */}
                  {msg.type === 'image' ? (
                    <img 
                      src={msg.mediaUrl} 
                      alt="Shared Media" 
                      style={{ width: '100%', maxWidth: '240px', borderRadius: '14px', display: 'block' }}
                    />
                  ) : msg.type === 'voice' ? (
                    /* Voice Note */
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '180px' }}>
                      <button 
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          backgroundColor: '#22c55e',
                          border: 'none',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <Play size={16} fill="#ffffff" />
                      </button>
                      <div style={{ flex: 1, height: '4px', backgroundColor: isDarkMode ? '#334155' : '#cbd5e1', borderRadius: '2px' }} />
                      <span style={{ fontSize: '12px', fontWeight: '600' }}>{msg.audioDuration}</span>
                      <Volume2 size={16} color={isDarkMode ? '#94a3b8' : '#64748b'} />
                    </div>
                  ) : (
                    /* Regular Text */
                    <p style={{ margin: 0, fontSize: '14.5px', lineHeight: 1.45, fontWeight: '400' }}>
                      {msg.text}
                    </p>
                  )}
                </div>

                {/* Time & Read Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', padding: '0 4px' }}>
                  <span style={{ fontSize: '11px', color: isDarkMode ? '#64748b' : '#94a3b8', fontWeight: '500' }}>
                    {msg.time}
                  </span>
                  {isMe && (
                    <CheckCheck size={14} color="#22c55e" />
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* 📎 Attachment / Gallery Popup Menu */}
        {showAttachMenu && (
          <div 
            style={{
              position: 'absolute',
              bottom: '75px',
              left: '16px',
              backgroundColor: isDarkMode ? '#1a2226' : '#ffffff',
              borderRadius: '16px',
              padding: '12px',
              display: 'flex',
              gap: '16px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
              border: isDarkMode ? '1px solid #27353a' : '1px solid #e2e8f0',
              zIndex: 20
            }}
          >
            {/* Gallery Option */}
            <label 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                color: isDarkMode ? '#cbd5e1' : '#475569'
              }}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                <ImageIcon size={20} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: '600' }}>Gallery</span>
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                style={{ display: 'none' }} 
              />
            </label>

            {/* Camera Option */}
            <label 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                color: isDarkMode ? '#cbd5e1' : '#475569'
              }}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                <Camera size={20} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: '600' }}>Camera</span>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                onChange={handleImageUpload} 
                style={{ display: 'none' }} 
              />
            </label>

            {/* Document Option */}
            <div 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                color: isDarkMode ? '#cbd5e1' : '#475569'
              }}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                <FileText size={20} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: '600' }}>Document</span>
            </div>
          </div>
        )}

        {/* ⌨️ Bottom Message Input Bar */}
        <form 
          onSubmit={handleSendMessage}
          style={{
            padding: '12px 14px',
            backgroundColor: isDarkMode ? '#12181a' : '#ffffff',
            borderTop: isDarkMode ? '1px solid #1e2629' : '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          {/* Paperclip Button toggles Gallery Menu */}
          <button 
            type="button"
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            style={{
              background: showAttachMenu ? (isDarkMode ? '#27353a' : '#e2e8f0') : 'none',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              color: showAttachMenu ? '#22c55e' : (isDarkMode ? '#64748b' : '#94a3b8'),
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            {showAttachMenu ? <X size={20} /> : <Paperclip size={20} />}
          </button>

          {/* Input Box */}
          <div 
            style={{
              flex: 1,
              backgroundColor: isDarkMode ? '#182023' : '#f1f5f9',
              borderRadius: '22px',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: isDarkMode ? '1px solid #27353a' : '1px solid #e2e8f0'
            }}
          >
            <input 
              type="text" 
              placeholder="Type a message..." 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: isDarkMode ? '#ffffff' : '#0f172a',
                fontSize: '14.5px',
                width: '100%',
                fontWeight: '400'
              }}
            />
            <button 
              type="button"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: isDarkMode ? '#64748b' : '#94a3b8',
                padding: '2px'
              }}
            >
              <Smile size={19} />
            </button>
          </div>

          {/* Send or Mic Button */}
          <button 
            type="submit"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              border: 'none',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
              transition: 'transform 0.1s ease'
            }}
          >
            {inputMessage.trim() ? (
              <Send size={18} style={{ marginLeft: '2px' }} />
            ) : (
              <Mic size={19} />
            )}
          </button>
        </form>

      </div>
    </div>
  );
};

export default ChatRoom;