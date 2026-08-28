import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import { getOneToOneRoomId } from '../utils/crypto';
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
  UserPlus, 
  Bell, 
  ShieldCheck
} from 'lucide-react';

const avatarColors = ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#06b6d4', '#6366f1', '#f43f5e'];

export const getAvatarColor = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

export const getInitials = (name = '') => {
  return name.trim().split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'CH';
};

const Inbox = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const socket = useSocket();

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('chathub_user');
    return saved ? JSON.parse(saved) : { name: 'My Profile', email: 'user@chathub.com' };
  });

  const [activeTab, setActiveTab] = useState('chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem(`chathub_contacts_${user?.email || 'guest'}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);

  // Incoming Call & Notification States
  const [incomingCall, setIncomingCall] = useState(null);
  const [inAppAlert, setInAppAlert] = useState(null);

  // 1. Request Native Browser Push Notification Permission (Once on Load)
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  // 2. Trigger Native System Push Notification (When Tab is Inactive / Switched)
  const triggerBrowserNotification = (title, body, roomId) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notification = new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: roomId
        });
        notification.onclick = () => {
          window.focus();
          navigate(`/chat/${roomId}`);
        };
      } catch (e) {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification(title, { body, icon: '/favicon.ico' });
          });
        }
      }
    }
  };

  // 3. Play Chime Sound
  const playAlertSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  };

  // Socket setup
  useEffect(() => {
    if (!socket || !user?.email) return;

    socket.emit('register_user', user.email);

    // Global Incoming Message Alert
    socket.on('global_unread_message', (data) => {
      playAlertSound();
      setInAppAlert(data);
      setTimeout(() => setInAppAlert(null), 5000);

      // Trigger Background Push if Tab is hidden/switched
      if (document.hidden) {
        triggerBrowserNotification(`ChatHub: ${data.senderName}`, data.text || 'New message received', data.roomId);
      }

      // Update Contact List & Badge
      setChats((prev) => {
        const index = prev.findIndex((c) => c.id === data.roomId || c.email === data.senderEmail);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            lastMessage: data.text,
            time: data.time,
            unread: (updated[index].unread || 0) + 1
          };
          const [moved] = updated.splice(index, 1);
          return [moved, ...updated];
        } else {
          const newContact = {
            id: data.roomId,
            name: data.senderName || data.senderEmail.split('@')[0],
            email: data.senderEmail,
            lastMessage: data.text,
            time: data.time,
            unread: 1,
            online: true
          };
          return [newContact, ...prev];
        }
      });
    });

    socket.on('incoming_call_ring', (data) => {
      playAlertSound();
      setIncomingCall(data);
      if (document.hidden) {
        triggerBrowserNotification('📞 Incoming Call', `${data.callerName} is calling you on ChatHub...`, data.roomId);
      }
    });

    socket.on('call_terminated', () => {
      setIncomingCall(null);
    });

    return () => {
      socket.off('global_unread_message');
      socket.off('incoming_call_ring');
      socket.off('call_terminated');
    };
  }, [socket, user]);

  useEffect(() => {
    if (user?.email) {
      localStorage.setItem(`chathub_contacts_${user.email}`, JSON.stringify(chats));
    }
  }, [chats, user]);

  const handleLogout = () => {
    localStorage.removeItem('chathub_token');
    localStorage.removeItem('chathub_user');
    navigate('/auth');
  };

  const handleOpenChat = (chat) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chat.id ? { ...c, unread: 0 } : c))
    );
    navigate(`/chat/${chat.id}`, { state: { contact: chat } });
  };

  const handleCreateNewChat = async (e) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactEmail.trim()) return;

    setSendingInvite(true);
    // WhatsApp style 1-to-1 deterministic roomId
    const roomId = getOneToOneRoomId(user.email, newContactEmail.trim());

    const newChatObj = {
      id: roomId,
      name: newContactName.trim(),
      email: newContactEmail.trim().toLowerCase(),
      lastMessage: '🔒 End-to-End Encrypted Chat',
      time: 'Just now',
      unread: 0,
      online: true
    };

    try {
      const hostname = window.location.hostname || 'localhost';
      await fetch(`http://${hostname}:5000/api/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: user?.name,
          senderEmail: user?.email,
          recipientEmail: newContactEmail.trim(),
          roomId
        })
      });
    } catch (err) {
      console.warn('Invite email error:', err);
    }

    const updated = [newChatObj, ...chats.filter(c => c.id !== roomId)];
    setChats(updated);
    setNewContactName('');
    setNewContactEmail('');
    setSendingInvite(false);
    setShowNewChatModal(false);
    navigate(`/chat/${newChatObj.id}`, { state: { contact: newChatObj } });
  };

  const filteredChats = chats.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: isDarkMode ? '#101416' : '#f1f5f9', color: isDarkMode ? '#ffffff' : '#0f172a', minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: "'Segoe UI', Roboto, sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '540px', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: isDarkMode ? '#12181a' : '#ffffff', position: 'relative', overflow: 'hidden' }}>
        
        {/* Incoming Call Ringing Modal */}
        {incomingCall && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: '#22c55e', color: '#fff', padding: '16px 20px', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 25px rgba(0,0,0,0.5)' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold' }}>📞 Incoming {incomingCall.type === 'video' ? 'Video' : 'Voice'} Call</h4>
              <p style={{ margin: 0, fontSize: '12px' }}>{incomingCall.callerName} is calling you...</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => {
                  const call = incomingCall;
                  setIncomingCall(null);
                  navigate(`/chat/${call.roomId}`, { state: { contact: { id: call.roomId, name: call.callerName, email: call.callerEmail } } });
                }} 
                style={{ backgroundColor: '#ffffff', color: '#16a34a', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Accept
              </button>
              <button 
                onClick={() => {
                  socket.emit('reject_call', { roomId: incomingCall.roomId });
                  setIncomingCall(null);
                }} 
                style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Decline
              </button>
            </div>
          </div>
        )}

        {/* In-App Toast Notification */}
        {inAppAlert && (
          <div 
            onClick={() => handleOpenChat({ id: inAppAlert.roomId, name: inAppAlert.senderName, email: inAppAlert.senderEmail })}
            style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', backgroundColor: '#182023', border: '1px solid #22c55e', borderRadius: '14px', padding: '12px 16px', zIndex: 50, display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
          >
            <Bell size={20} color="#22c55e" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{ margin: 0, fontSize: '14px', color: '#fff' }}>{inAppAlert.senderName}</h4>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{inAppAlert.text}</p>
            </div>
            <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: 'bold' }}>Open</span>
          </div>
        )}

        {/* Top Header */}
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: isDarkMode ? '1px solid #1e2629' : '1px solid #e2e8f0' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>ChatHub</h1>
            <span style={{ fontSize: '12px', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
              Account: <strong style={{ color: '#22c55e' }}>{user?.name || user?.email}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isDarkMode ? '#cbd5e1' : '#475569', padding: '6px' }}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={handleLogout} title="Logout" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '6px' }}>
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: '12px 20px 8px 20px' }}>
          <div style={{ backgroundColor: isDarkMode ? '#182023' : '#f1f5f9', borderRadius: '14px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', border: isDarkMode ? '1px solid #27353a' : '1px solid #e2e8f0' }}>
            <Search size={18} color={isDarkMode ? '#64748b' : '#94a3b8'} />
            <input type="text" placeholder="Search conversations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ background: 'transparent', border: 'none', outline: 'none', color: isDarkMode ? '#ffffff' : '#0f172a', fontSize: '14px', width: '100%' }} />
          </div>
        </div>

        {/* Chats Feed List */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '70px' }}>
          {filteredChats.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
              No private conversations yet. Tap <strong>+</strong> to start an Encrypted 1-to-1 Chat!
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div 
                key={chat.id} 
                onClick={() => handleOpenChat(chat)} 
                style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', borderBottom: isDarkMode ? '1px solid #182023' : '1px solid #f8fafc' }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: getAvatarColor(chat.name), color: '#ffffff', fontWeight: '700', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {getInitials(chat.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>{chat.name}</h3>
                    <span style={{ fontSize: '11px', color: isDarkMode ? '#64748b' : '#94a3b8' }}>{chat.time}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: isDarkMode ? '#94a3b8' : '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chat.lastMessage}</p>
                </div>

                {chat.unread > 0 && (
                  <div style={{ backgroundColor: '#22c55e', color: '#ffffff', fontSize: '12px', fontWeight: '800', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(34, 197, 94, 0.4)' }}>
                    {chat.unread}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add Friend Floating Button */}
        <button onClick={() => setShowNewChatModal(true)} style={{ position: 'absolute', bottom: '78px', right: '20px', width: '52px', height: '52px', borderRadius: '50%', backgroundColor: '#22c55e', color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 6px 18px rgba(34,197,94,0.35)', zIndex: 20 }}>
          <MessageSquarePlus size={24} />
        </button>

        {/* 1-to-1 Add Friend Modal */}
        {showNewChatModal && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 40 }}>
            <div style={{ width: '100%', maxWidth: '380px', backgroundColor: isDarkMode ? '#151c1f' : '#ffffff', borderRadius: '20px', padding: '24px', border: isDarkMode ? '1px solid #27353a' : '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>New 1-to-1 Chat</h3>
                <button onClick={() => setShowNewChatModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isDarkMode ? '#94a3b8' : '#64748b' }}><X size={20} /></button>
              </div>

              <form onSubmit={handleCreateNewChat} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <input type="text" placeholder="Friend Name (e.g. Laiba)" value={newContactName} onChange={(e) => setNewContactName(e.target.value)} required style={{ padding: '12px', borderRadius: '10px', border: isDarkMode ? '1px solid #27353a' : '1px solid #cbd5e1', backgroundColor: isDarkMode ? '#1c2427' : '#f8fafc', color: isDarkMode ? '#ffffff' : '#0f172a', outline: 'none' }} />
                <input type="email" placeholder="Friend's Gmail (Must be different email)" value={newContactEmail} onChange={(e) => setNewContactEmail(e.target.value)} required style={{ padding: '12px', borderRadius: '10px', border: isDarkMode ? '1px solid #27353a' : '1px solid #cbd5e1', backgroundColor: isDarkMode ? '#1c2427' : '#f8fafc', color: isDarkMode ? '#ffffff' : '#0f172a', outline: 'none' }} />
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#22c55e', fontWeight: '600' }}>
                  <ShieldCheck size={16} /> <span>End-to-End Encrypted Private Session</span>
                </div>

                <button type="submit" disabled={sendingInvite} style={{ backgroundColor: '#22c55e', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <UserPlus size={18} />
                  <span>{sendingInvite ? 'Sending Encrypted Invite...' : 'Start 1-to-1 Chat'}</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Bottom Nav */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '64px', backgroundColor: isDarkMode ? '#12181a' : '#ffffff', borderTop: isDarkMode ? '1px solid #1e2629' : '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-around', zIndex: 10 }}>
          <button onClick={() => setActiveTab('chats')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: activeTab === 'chats' ? '#22c55e' : (isDarkMode ? '#64748b' : '#94a3b8'), cursor: 'pointer' }}>
            <MessageSquare size={20} /><span style={{ fontSize: '11px', fontWeight: '700' }}>Chats</span>
          </button>
          <button onClick={() => navigate('/calls')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: isDarkMode ? '#64748b' : '#94a3b8', cursor: 'pointer' }}>
            <Phone size={20} /><span style={{ fontSize: '11px' }}>Calls</span>
          </button>
          <button onClick={() => navigate('/teams')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: isDarkMode ? '#64748b' : '#94a3b8', cursor: 'pointer' }}>
            <Users size={20} /><span style={{ fontSize: '11px' }}>Teams</span>
          </button>
          <button onClick={() => navigate('/settings')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: isDarkMode ? '#64748b' : '#94a3b8', cursor: 'pointer' }}>
            <SettingsIcon size={20} /><span style={{ fontSize: '11px' }}>Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Inbox;