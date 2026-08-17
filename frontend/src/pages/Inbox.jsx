import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  Search, 
  Plus, 
  MessageSquare, 
  Phone, 
  Users, 
  Settings, 
  CheckCheck,
  Moon,
  Sun
} from 'lucide-react';

const mockPinned = [
  { id: 1, name: 'Adan', online: true, color: '#22c55e' },
  { id: 2, name: 'Sara', online: true, color: '#3b82f6' },
  { id: 3, name: 'Ali', online: false, color: '#f59e0b' },
  { id: 4, name: 'Team Dev', online: true, color: '#ec4899' },
  { id: 5, name: 'Zain', online: false, color: '#8b5cf6' },
];

const mockChats = [
  {
    id: 1,
    name: 'Adan Fatima',
    avatar: 'AF',
    message: 'Hey, I just reviewed the new UI components!',
    time: '11:42 AM',
    unread: 2,
    online: true,
    color: '#22c55e'
  },
  {
    id: 2,
    name: 'Project Chathub Core',
    avatar: 'PC',
    message: 'Ali: WebRTC audio module integrated successfully.',
    time: '10:15 AM',
    unread: 0,
    online: false,
    color: '#3b82f6',
    isGroup: true
  },
  {
    id: 3,
    name: 'Sara Ahmed',
    avatar: 'SA',
    message: 'Are we meeting at 3 PM today?',
    time: 'Yesterday',
    unread: 0,
    online: true,
    color: '#f59e0b'
  },
  {
    id: 4,
    name: 'Muarij Khan',
    avatar: 'MK',
    message: 'Check your email for the project files.',
    time: 'Yesterday',
    unread: 0,
    online: false,
    color: '#8b5cf6'
  },
  {
    id: 5,
    name: 'Design Sprint Group',
    avatar: 'DS',
    message: 'Sana: Color palette update complete.',
    time: 'Aug 14',
    unread: 0,
    online: false,
    color: '#ec4899',
    isGroup: true
  }
];

const Inbox = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' | 'calls'

  const filteredChats = mockChats.filter(chat => 
    chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div 
      style={{
        backgroundColor: isDarkMode ? '#101416' : '#f8fafc',
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
      {/* Main Container - Responsive on Mobile & Laptop */}
      <div 
        style={{
          width: '100%',
          maxWidth: '540px',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: isDarkMode ? '#12181a' : '#ffffff',
          boxShadow: isDarkMode ? '0 0 40px rgba(0,0,0,0.6)' : '0 0 30px rgba(0,0,0,0.06)',
          borderLeft: isDarkMode ? '1px solid #1e2629' : '1px solid #e2e8f0',
          borderRight: isDarkMode ? '1px solid #1e2629' : '1px solid #e2e8f0',
          paddingBottom: '80px',
          position: 'relative'
        }}
      >
        
        {/* 🔝 Header Section */}
        <div style={{ padding: '20px 20px 12px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' }}>
              Messages
            </h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Theme Toggle Button */}
              <button 
                onClick={toggleTheme}
                title="Toggle Theme"
                style={{
                  background: isDarkMode ? '#1c2427' : '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: isDarkMode ? '#facc15' : '#475569'
                }}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* New Chat / Add Button */}
              <button 
                style={{
                  background: '#22c55e',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(34,197,94,0.3)'
                }}
              >
                <Plus size={20} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* 🔍 Search Input Bar */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: isDarkMode ? '#182023' : '#f1f5f9',
              borderRadius: '12px',
              padding: '10px 14px',
              gap: '10px',
              border: isDarkMode ? '1px solid #27353a' : '1px solid #e2e8f0'
            }}
          >
            <Search size={18} color={isDarkMode ? '#64748b' : '#94a3b8'} />
            <input 
              type="text" 
              placeholder="Search conversations, teams..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: isDarkMode ? '#ffffff' : '#0f172a',
                fontSize: '14px',
                width: '100%',
                fontWeight: '500'
              }}
            />
          </div>
        </div>

        {/* ⚡ Pinned / Active Contacts Horizontal Story Row */}
        <div style={{ padding: '6px 20px 14px 20px' }}>
          <div 
            style={{
              display: 'flex',
              gap: '16px',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              paddingBottom: '4px'
            }}
          >
            {mockPinned.map((person) => (
              <div 
                key={person.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  minWidth: '54px'
                }}
              >
                <div style={{ position: 'relative', marginBottom: '6px' }}>
                  <div 
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      backgroundColor: person.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: '700',
                      fontSize: '17px',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                    }}
                  >
                    {person.name.substring(0, 2).toUpperCase()}
                  </div>
                  {person.online && (
                    <span 
                      style={{
                        position: 'absolute',
                        bottom: '2px',
                        right: '2px',
                        width: '13px',
                        height: '13px',
                        backgroundColor: '#22c55e',
                        border: isDarkMode ? '2.5px solid #12181a' : '2.5px solid #ffffff',
                        borderRadius: '50%'
                      }}
                    />
                  )}
                </div>
                <span 
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: isDarkMode ? '#94a3b8' : '#475569',
                    maxWidth: '54px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {person.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: isDarkMode ? '#1e2629' : '#f1f5f9', margin: '0 20px 10px 20px' }} />

        {/* 💬 Chat List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
          {filteredChats.map((chat) => (
            <div 
              key={chat.id}
              onClick={() => navigate(`/chat/${chat.id}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 10px',
                borderRadius: '14px',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                gap: '14px'
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = isDarkMode ? '#182023' : '#f8fafc')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              {/* Avatar with Online Indicator */}
              <div style={{ position: 'relative' }}>
                <div 
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: chat.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '16px'
                  }}
                >
                  {chat.avatar}
                </div>
                {chat.online && (
                  <span 
                    style={{
                      position: 'absolute',
                      bottom: '0',
                      right: '0',
                      width: '12px',
                      height: '12px',
                      backgroundColor: '#22c55e',
                      border: isDarkMode ? '2px solid #12181a' : '2px solid #ffffff',
                      borderRadius: '50%'
                    }}
                  />
                )}
              </div>

              {/* Chat Meta Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <h3 
                    style={{
                      fontSize: '15px',
                      fontWeight: '700',
                      margin: 0,
                      color: isDarkMode ? '#ffffff' : '#0f172a',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {chat.name}
                  </h3>
                  <span style={{ fontSize: '11px', color: isDarkMode ? '#64748b' : '#94a3b8', fontWeight: '500' }}>
                    {chat.time}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p 
                    style={{
                      fontSize: '13px',
                      color: chat.unread > 0 ? (isDarkMode ? '#e2e8f0' : '#0f172a') : (isDarkMode ? '#64748b' : '#64748b'),
                      fontWeight: chat.unread > 0 ? '700' : '400',
                      margin: 0,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '240px'
                    }}
                  >
                    {chat.message}
                  </p>

                  {chat.unread > 0 ? (
                    <span 
                      style={{
                        backgroundColor: '#22c55e',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: '800',
                        padding: '2px 7px',
                        borderRadius: '10px',
                        minWidth: '18px',
                        textAlign: 'center'
                      }}
                    >
                      {chat.unread}
                    </span>
                  ) : (
                    <CheckCheck size={16} color={isDarkMode ? '#475569' : '#94a3b8'} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 📱 Sticky Bottom Navigation Bar */}
        <div 
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '65px',
            backgroundColor: isDarkMode ? '#101416' : '#ffffff',
            borderTop: isDarkMode ? '1px solid #1e2629' : '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '0 10px',
            borderBottomLeftRadius: '24px',
            borderBottomRightRadius: '24px'
          }}
        >
          <button 
            onClick={() => setActiveTab('chats')}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              color: activeTab === 'chats' ? '#22c55e' : (isDarkMode ? '#64748b' : '#94a3b8')
            }}
          >
            <MessageSquare size={20} />
            <span style={{ fontSize: '11px', fontWeight: '600' }}>Chats</span>
          </button>

          <button 
            onClick={() => setActiveTab('calls')}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              color: activeTab === 'calls' ? '#22c55e' : (isDarkMode ? '#64748b' : '#94a3b8')
            }}
          >
            <Phone size={20} />
            <span style={{ fontSize: '11px', fontWeight: '600' }}>Calls</span>
          </button>

          <button 
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              color: isDarkMode ? '#64748b' : '#94a3b8'
            }}
          >
            <Users size={20} />
            <span style={{ fontSize: '11px', fontWeight: '600' }}>Teams</span>
          </button>

          <button 
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              color: isDarkMode ? '#64748b' : '#94a3b8'
            }}
          >
            <Settings size={20} />
            <span style={{ fontSize: '11px', fontWeight: '600' }}>Settings</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default Inbox;