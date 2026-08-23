import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  ArrowLeft, 
  Camera, 
  Mail, 
  Phone, 
  Moon, 
  Sun, 
  ShieldCheck, 
  LogOut
} from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState({
    name: 'User',
    email: 'user@example.com',
    phone: '+92 300 1234567',
    avatar: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('chathub_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setNameInput(parsed.name || 'User');
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      const updatedUser = { ...user, avatar: imageUrl };
      setUser(updatedUser);
      localStorage.setItem('chathub_user', JSON.stringify(updatedUser));
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updatedUser = { ...user, name: nameInput };
    setUser(updatedUser);
    localStorage.setItem('chathub_user', JSON.stringify(updatedUser));
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleLogout = () => {
    localStorage.removeItem('chathub_token');
    localStorage.removeItem('chathub_user');
    navigate('/auth');
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
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
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
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div 
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            borderBottom: isDarkMode ? '1px solid #1e2629' : '1px solid #e2e8f0'
          }}
        >
          <button 
            onClick={() => navigate('/inbox')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: isDarkMode ? '#ffffff' : '#0f172a', padding: '4px' }}
          >
            <ArrowLeft size={22} />
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>Settings</h1>
        </div>

        {/* Profile Card */}
        <div 
          style={{
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderBottom: isDarkMode ? '1px solid #1e2629' : '1px solid #e2e8f0',
            backgroundColor: isDarkMode ? '#151c1f' : '#f8fafc'
          }}
        >
          <div style={{ position: 'relative', marginBottom: '14px' }}>
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt="Profile" 
                style={{ width: '86px', height: '86px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #22c55e' }}
              />
            ) : (
              <div 
                style={{
                  width: '86px',
                  height: '86px',
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 20px rgba(34,197,94,0.3)'
                }}
              >
                {user.name ? user.name.slice(0, 2).toUpperCase() : 'CH'}
              </div>
            )}

            <button 
              onClick={() => fileInputRef.current?.click()}
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: '#22c55e',
                color: '#ffffff',
                border: isDarkMode ? '2px solid #12181a' : '2px solid #ffffff',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Camera size={15} />
            </button>
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <input 
                type="text" 
                value={nameInput} 
                onChange={(e) => setNameInput(e.target.value)}
                style={{
                  backgroundColor: isDarkMode ? '#1e2629' : '#ffffff',
                  border: '1px solid #22c55e',
                  color: isDarkMode ? '#ffffff' : '#0f172a',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  outline: 'none'
                }}
              />
              <button 
                type="submit" 
                style={{ backgroundColor: '#22c55e', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontWeight: '600' }}
              >
                Save
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 4px 0' }}>
                {user.name || 'User'}
              </h2>
              <button 
                onClick={() => setIsEditing(true)}
                style={{ background: 'none', border: 'none', color: '#22c55e', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' }}
              >
                Edit Display Name
              </button>
            </div>
          )}

          {saveSuccess && (
            <span style={{ color: '#22c55e', fontSize: '12px', fontWeight: '600', marginTop: '6px' }}>
              Profile updated successfully!
            </span>
          )}
        </div>

        {/* Info & Options */}
        <div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px 14px',
              borderRadius: '12px',
              backgroundColor: isDarkMode ? '#182023' : '#f8fafc',
              border: isDarkMode ? '1px solid #27353a' : '1px solid #e2e8f0'
            }}
          >
            <Mail size={18} color="#22c55e" />
            <div>
              <div style={{ fontSize: '11px', color: isDarkMode ? '#64748b' : '#94a3b8' }}>Email Address</div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>{user.email || 'user@example.com'}</div>
            </div>
          </div>

          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px 14px',
              borderRadius: '12px',
              backgroundColor: isDarkMode ? '#182023' : '#f8fafc',
              border: isDarkMode ? '1px solid #27353a' : '1px solid #e2e8f0'
            }}
          >
            <Phone size={18} color="#22c55e" />
            <div>
              <div style={{ fontSize: '11px', color: isDarkMode ? '#64748b' : '#94a3b8' }}>Phone Number</div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>{user.phone || '+92 300 1234567'}</div>
            </div>
          </div>

          <div 
            onClick={toggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: '12px',
              backgroundColor: isDarkMode ? '#182023' : '#f8fafc',
              border: isDarkMode ? '1px solid #27353a' : '1px solid #e2e8f0',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {isDarkMode ? <Moon size={18} color="#3b82f6" /> : <Sun size={18} color="#f59e0b" />}
              <span style={{ fontSize: '14px', fontWeight: '600' }}>Dark Mode</span>
            </div>
            <span style={{ fontSize: '12px', color: '#22c55e', fontWeight: '700' }}>{isDarkMode ? 'ON' : 'OFF'}</span>
          </div>

          <button 
            onClick={handleLogout}
            style={{
              marginTop: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '13px 14px',
              borderRadius: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#ef4444',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <LogOut size={18} />
            <span>Log Out Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;