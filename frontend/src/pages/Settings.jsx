import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Camera, 
  User, 
  Mail, 
  Save, 
  Check, 
  Moon, 
  Sun, 
  LogOut, 
  ShieldCheck 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Settings = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme() || { isDarkMode: true, toggleTheme: () => {} };

  // Local storage se user data get karna
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('chathub_user');
    return saved ? JSON.parse(saved) : { name: 'User', email: 'user@gmail.com', avatar: '' };
  });

  const [name, setName] = useState(user.name || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // 1. Profile Picture Upload (Convert to Base64 String)
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedUser = { ...user, avatar: reader.result };
        setUser(updatedUser);
        localStorage.setItem('chathub_user', JSON.stringify(updatedUser));
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      };
      reader.readAsDataURL(file);
    }
  };

  // 2. Save Name Changes
  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updatedUser = { ...user, name: name.trim() };
    setUser(updatedUser);
    localStorage.setItem('chathub_user', JSON.stringify(updatedUser));
    
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // 3. Logout
  const handleLogout = () => {
    localStorage.removeItem('chathub_token');
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
        fontFamily: "'Segoe UI', Roboto, sans-serif",
        boxSizing: 'border-box'
      }}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '540px',
          minHeight: '100vh',
          backgroundColor: isDarkMode ? '#12181a' : '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          borderLeft: isDarkMode ? '1px solid #1e2629' : '1px solid #e2e8f0',
          borderRight: isDarkMode ? '1px solid #1e2629' : '1px solid #e2e8f0'
        }}
      >
        {/* Top Header */}
        <div 
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            borderBottom: isDarkMode ? '1px solid #1e2629' : '1px solid #e2e8f0'
          }}
        >
          <button 
            onClick={() => navigate('/inbox')} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex' }}
          >
            <ArrowLeft size={22} />
          </button>
          <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Profile & Settings</h2>
        </div>

        <div style={{ padding: '24px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Avatar Section */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div 
              style={{
                position: 'relative',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 25px rgba(34, 197, 94, 0.3)',
                overflow: 'hidden'
              }}
            >
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt="Profile" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <User size={48} color="#ffffff" />
              )}

              {/* Camera Upload Button Overlay */}
              <label 
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.45)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: user.avatar ? 0 : 1,
                  transition: 'opacity 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => { if (user.avatar) e.currentTarget.style.opacity = '0'; }}
              >
                <Camera size={22} color="#ffffff" />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoUpload} 
                  style={{ display: 'none' }} 
                />
              </label>
            </div>

            <label 
              style={{
                fontSize: '13px',
                color: '#22c55e',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Change Photo
              <input 
                type="file" 
                accept="image/*" 
                onChange={handlePhotoUpload} 
                style={{ display: 'none' }} 
              />
            </label>
          </div>

          {/* Success Banner */}
          {savedSuccess && (
            <div 
              style={{
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                color: '#22c55e',
                padding: '12px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                border: '1px solid rgba(34, 197, 94, 0.3)'
              }}
            >
              <Check size={16} /> Changes saved successfully!
            </div>
          )}

          {/* Edit Form */}
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Email Field (Disabled) */}
            <div>
              <label style={{ fontSize: '12.5px', color: isDarkMode ? '#94a3b8' : '#64748b', fontWeight: '600' }}>
                Account Email
              </label>
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: isDarkMode ? '#182023' : '#f8fafc',
                  padding: '14px 16px',
                  borderRadius: '14px',
                  border: isDarkMode ? '1px solid #27353a' : '1px solid #cbd5e1',
                  marginTop: '6px',
                  color: isDarkMode ? '#64748b' : '#94a3b8'
                }}
              >
                <Mail size={18} />
                <span style={{ fontSize: '14.5px' }}>{user.email}</span>
                <span style={{ marginLeft: 'auto', fontSize: '11px', backgroundColor: '#22c55e22', color: '#22c55e', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>Verified</span>
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label style={{ fontSize: '12.5px', color: isDarkMode ? '#94a3b8' : '#64748b', fontWeight: '600' }}>
                Display Name
              </label>
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: isDarkMode ? '#151c1f' : '#ffffff',
                  padding: '12px 16px',
                  borderRadius: '14px',
                  border: isDarkMode ? '1.5px solid #27353a' : '1.5px solid #cbd5e1',
                  marginTop: '6px'
                }}
              >
                <User size={18} color="#22c55e" />
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Enter your name" 
                  required
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: isDarkMode ? '#ffffff' : '#0f172a',
                    fontSize: '15px',
                    width: '100%',
                    fontWeight: '600'
                  }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              style={{
                backgroundColor: '#22c55e',
                color: '#ffffff',
                border: 'none',
                padding: '14px',
                borderRadius: '14px',
                fontSize: '15px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 6px 20px rgba(34, 197, 94, 0.35)',
                marginTop: '4px'
              }}
            >
              <Save size={18} /> Save Profile Changes
            </button>
          </form>

          {/* Preferences Box */}
          <div 
            style={{
              backgroundColor: isDarkMode ? '#182023' : '#f8fafc',
              borderRadius: '16px',
              padding: '16px',
              border: isDarkMode ? '1px solid #27353a' : '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {isDarkMode ? <Moon size={18} color="#3b82f6" /> : <Sun size={18} color="#eab308" />}
                <span style={{ fontSize: '14.5px', fontWeight: '600' }}>Dark Theme</span>
              </div>
              <button 
                onClick={toggleTheme} 
                type="button"
                style={{
                  width: '46px',
                  height: '24px',
                  borderRadius: '20px',
                  backgroundColor: isDarkMode ? '#22c55e' : '#cbd5e1',
                  border: 'none',
                  position: 'relative',
                  cursor: 'pointer'
                }}
              >
                <div 
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: '#fff',
                    position: 'absolute',
                    top: '3px',
                    left: isDarkMode ? '24px' : '4px',
                    transition: 'left 0.2s'
                  }} 
                />
              </button>
            </div>

            <div style={{ height: '1px', backgroundColor: isDarkMode ? '#27353a' : '#e2e8f0' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#94a3b8' }}>
              <ShieldCheck size={18} color="#22c55e" />
              <span>End-to-End Encryption Enabled (AES-256)</span>
            </div>
          </div>

          {/* Logout Button */}
          <button 
            onClick={handleLogout} 
            type="button"
            style={{
              marginTop: 'auto',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              padding: '14px',
              borderRadius: '14px',
              fontSize: '14.5px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <LogOut size={18} /> Sign Out of ChatHub
          </button>

        </div>
      </div>
    </div>
  );
};

export default Settings;