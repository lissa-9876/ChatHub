import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Save, 
  CheckCircle,
  MessageSquare,
  Phone,
  Users,
  Settings as SettingsIcon
} from 'lucide-react';
import { getAvatarColor, getInitials } from './Inbox';

const Settings = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const [savedUser, setSavedUser] = useState(() => {
    const data = localStorage.getItem('chathub_user');
    return data ? JSON.parse(data) : { name: 'My Name', email: 'user@gmail.com' };
  });

  const [name, setName] = useState(savedUser.name || '');
  const [success, setSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    const updated = { ...savedUser, name: name.trim() };
    localStorage.setItem('chathub_user', JSON.stringify(updated));
    setSavedUser(updated);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div style={{ backgroundColor: isDarkMode ? '#101416' : '#f1f5f9', color: isDarkMode ? '#ffffff' : '#0f172a', minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: "'Segoe UI', Roboto, sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '540px', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: isDarkMode ? '#12181a' : '#ffffff', position: 'relative', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', borderBottom: isDarkMode ? '1px solid #1e2629' : '1px solid #e2e8f0' }}>
          <button onClick={() => navigate('/inbox')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
            <ArrowLeft size={22} />
          </button>
          <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Profile & Settings</h2>
        </div>

        <div style={{ padding: '24px 20px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '84px', height: '84px', borderRadius: '50%', backgroundColor: getAvatarColor(name || savedUser.email), color: '#fff', fontSize: '28px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            {getInitials(name || savedUser.email)}
          </div>

          {success && (
            <div style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22c55e', padding: '10px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={16} /> Profile name updated successfully!
            </div>
          )}

          <form onSubmit={handleSave} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '6px', display: 'block' }}>Display Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '12px', border: isDarkMode ? '1px solid #27353a' : '1px solid #cbd5e1', backgroundColor: isDarkMode ? '#182023' : '#f8fafc', color: isDarkMode ? '#fff' : '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '6px', display: 'block' }}>Email Address (Verified)</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  value={savedUser.email} 
                  disabled 
                  style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '12px', border: '1px solid #27353a', backgroundColor: '#111618', color: '#64748b', outline: 'none', boxSizing: 'border-box', cursor: 'not-allowed' }}
                />
              </div>
            </div>

            <button type="submit" style={{ backgroundColor: '#22c55e', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px' }}>
              <Save size={18} /> Save Changes
            </button>
          </form>
        </div>

        {/* Bottom Navigation */}
        <div style={{ height: '64px', backgroundColor: isDarkMode ? '#12181a' : '#ffffff', borderTop: isDarkMode ? '1px solid #1e2629' : '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-around', zIndex: 10 }}>
          <button onClick={() => navigate('/inbox')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: isDarkMode ? '#64748b' : '#94a3b8', cursor: 'pointer' }}>
            <MessageSquare size={20} /><span style={{ fontSize: '11px' }}>Chats</span>
          </button>
          <button onClick={() => navigate('/calls')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: isDarkMode ? '#64748b' : '#94a3b8', cursor: 'pointer' }}>
            <Phone size={20} /><span style={{ fontSize: '11px' }}>Calls</span>
          </button>
          <button onClick={() => navigate('/teams')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: isDarkMode ? '#64748b' : '#94a3b8', cursor: 'pointer' }}>
            <Users size={20} /><span style={{ fontSize: '11px' }}>Teams</span>
          </button>
          <button onClick={() => navigate('/settings')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#22c55e', cursor: 'pointer' }}>
            <SettingsIcon size={20} /><span style={{ fontSize: '11px', fontWeight: '700' }}>Settings</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default Settings;