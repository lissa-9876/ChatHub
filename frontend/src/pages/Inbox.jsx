import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  Search, 
  MessageSquare, 
  Phone, 
  Users, 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  MessageSquarePlus, 
  LogOut,
  X,
  UserPlus
} from 'lucide-react';

const initialChats = [
  {
    id: '1',
    name: 'Laiba Abbas',
    avatarText: 'LA',
    lastMessage: 'Let us connect on Figma to finalize UI',
    time: '10:45 AM',
    unread: 2,
    online: true
  },
  {
    id: '2',
    name: 'Development Team',
    avatarText: 'DT',
    lastMessage: 'Backend API routes tested successfully',
    time: 'Yesterday',
    unread: 0,
    online: false
  },
  {
    id: '3',
    name: 'Zahra Mansoor',
    avatarText: 'ZM',
    lastMessage: 'Please share the repo link',
    time: 'Aug 15',
    unread: 0,
    online: true
  }
];

const mockOnlineUsers = [
  { id: '1', name: 'Adan', avatarText: 'LA' },
  { id: '2', name: 'Development Team', avatarText: 'DT' },
  { id: '3', name: 'Ayesha', avatarText: 'ZA' },
  { id: '4', name: 'Hamza', avatarText: 'HK' },
  { id: '5', name: 'Zainab', avatarText: 'ZM' }
];

const Inbox = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState(initialChats);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newContactName, setNewContactName] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('chathub_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('chathub_token');
    localStorage.removeItem('chathub_user');
    navigate('/auth');
  };

  const handleCreateNewChat = (e) => {
    e.preventDefault();
    if (!newContactName.trim()) return;

    const initials = newContactName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const newChatObj = {
      id: `${Date.now()}`,
      name: newContactName,
      avatarText: initials || 'CH',
      lastMessage: 'Conversation started',
      time: 'Just now',
      unread: 0,
      online: true
    };

    setChats([newChatObj, ...chats]);
    setNewContactName('');
    setShowNewChatModal(false);
    navigate(`/chat/${newChatObj.id}`);
  };

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        {/* Top Header */}
        <div 
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: isDarkMode ? '1px solid #1e2629' : '1px solid #e2e8f0'
          }}
        >
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
              ChatHub
            </h1>
            <span style={{ fontSize: '12px', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
              Hi, <strong>{user?.name || 'User'}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={toggleTheme}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: isDarkMode ? '#cbd5e1' : '#475569',
                padding: '6px'
              }}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button 
              onClick={handleLogout}
              title="Logout"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#ef4444',
                padding: '6px'
              }}
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '12px 20px 8px 20px' }}>
          <div 
            style={{
              backgroundColor: isDarkMode ? '#182023' : '#f1f5f9',
              borderRadius: '14px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              border: isDarkMode ? '1px solid #27353a' : '1px solid #e2e8f0'
            }}
          >
            <Search size={18} color={isDarkMode ? '#64748b' : '#94a3b8'} />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: isDarkMode ? '#ffffff' : '#0f172a',
                fontSize: '14px',
                width: '100%'
              }}
            />
          </div>
        </div>

        {/* Online Contacts Bar */}
        <div 
          style={{
            display: 'flex',
            gap: '14px',
            padding: '10px 20px 14px 20px',
            overflowX: 'auto',
            borderBottom: isDarkMode ? '1px solid #182023' : '1px solid #f8fafc'
          }}
        >
          {mockOnlineUsers.map((item) => (
            <div 
              key={item.id}
              onClick={() => navigate(`/chat/${item.id}`)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                minWidth: '52px'
              }}
            >
              <div style={{ position: 'relative' }}>
                <div 
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#22c55e',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '15px'
                  }}
                >
                  {item.avatarText}
                </div>
                <span 
                  style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    width: '11px',
                    height: '11px',
                    backgroundColor: '#22c55e',
                    border: isDarkMode ? '2px solid #12181a' : '2px solid #ffffff',
                    borderRadius: '50%'
                  }}
                />
              </div>
              <span style={{ fontSize: '11px', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                {item.name}
              </span>
            </div>
          ))}
        </div>

        {/* Chats Feed List */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '70px' }}>
          {filteredChats.map((chat) => (
            <div 
              key={chat.id}
              onClick={() => navigate(`/chat/${chat.id}`)}
              style={{
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                cursor: 'pointer',
                borderBottom: isDarkMode ? '1px solid #182023' : '1px solid #f8fafc',
                transition: 'background-color 0.15s ease'
              }}
            >
              <div style={{ position: 'relative' }}>
                <div 
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#22c55e',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {chat.avatarText}
                </div>
                {chat.online && (
                  <span 
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '2px',
                      width: '11px',
                      height: '11px',
                      backgroundColor: '#22c55e',
                      border: isDarkMode ? '2px solid #12181a' : '2px solid #ffffff',
                      borderRadius: '50%'
                    }}
                  />
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {chat.name}
                  </h3>
                  <span style={{ fontSize: '11px', color: isDarkMode ? '#64748b' : '#94a3b8' }}>
                    {chat.time}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: isDarkMode ? '#94a3b8' : '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {chat.lastMessage}
                </p>
              </div>

              {chat.unread > 0 && (
                <div 
                  style={{
                    backgroundColor: '#22c55e',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '2px 8px',
                    borderRadius: '12px'
                  }}
                >
                  {chat.unread}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Floating Button (New Conversation) */}
        <button 
          onClick={() => setShowNewChatModal(true)}
          style={{
            position: 'absolute',
            bottom: '78px',
            right: '20px',
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            backgroundColor: '#22c55e',
            color: '#ffffff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 6px 18px rgba(34,197,94,0.35)',
            zIndex: 20
          }}
        >
          <MessageSquarePlus size={24} />
        </button>

        {/* New Chat Modal Popup */}
        {showNewChatModal && (
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              zIndex: 40
            }}
          >
            <div 
              style={{
                width: '100%',
                maxWidth: '380px',
                backgroundColor: isDarkMode ? '#151c1f' : '#ffffff',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                border: isDarkMode ? '1px solid #27353a' : '1px solid #e2e8f0'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Start New Chat</h3>
                <button 
                  onClick={() => setShowNewChatModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: isDarkMode ? '#94a3b8' : '#64748b' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateNewChat} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <input 
                  type="text" 
                  placeholder="Contact Name (e.g. Bilal Ahmed)" 
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  required
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: isDarkMode ? '1px solid #27353a' : '1px solid #cbd5e1',
                    backgroundColor: isDarkMode ? '#1c2427' : '#f8fafc',
                    color: isDarkMode ? '#ffffff' : '#0f172a',
                    outline: 'none',
                    fontSize: '14px'
                  }}
                />
                <button 
                  type="submit" 
                  style={{
                    backgroundColor: '#22c55e',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <UserPlus size={18} />
                  <span>Start Messaging</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Bottom Navigation Bar */}
        <div 
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '64px',
            backgroundColor: isDarkMode ? '#12181a' : '#ffffff',
            borderTop: isDarkMode ? '1px solid #1e2629' : '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '0 8px',
            zIndex: 10
          }}
        >
          <button 
            onClick={() => setActiveTab('chats')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              color: activeTab === 'chats' ? '#22c55e' : (isDarkMode ? '#64748b' : '#94a3b8'),
              cursor: 'pointer'
            }}
          >
            <MessageSquare size={20} />
            <span style={{ fontSize: '11px', fontWeight: activeTab === 'chats' ? '700' : '500' }}>Chats</span>
          </button>

          <button 
            onClick={() => navigate('/calls')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              color: isDarkMode ? '#64748b' : '#94a3b8',
              cursor: 'pointer'
            }}
          >
            <Phone size={20} />
            <span style={{ fontSize: '11px', fontWeight: '500' }}>Calls</span>
          </button>

          <button 
            onClick={() => navigate('/teams')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              color: isDarkMode ? '#64748b' : '#94a3b8',
              cursor: 'pointer'
            }}
          >
            <Users size={20} />
            <span style={{ fontSize: '11px', fontWeight: '500' }}>Teams</span>
          </button>

          <button 
            onClick={() => navigate('/settings')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              color: isDarkMode ? '#64748b' : '#94a3b8',
              cursor: 'pointer'
            }}
          >
            <SettingsIcon size={20} />
            <span style={{ fontSize: '11px', fontWeight: '500' }}>Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Inbox;