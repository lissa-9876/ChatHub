import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  ArrowLeft, 
  Phone, 
  PhoneIncoming, 
  PhoneMissed,
  MessageSquare,
  Users,
  Settings as SettingsIcon
} from 'lucide-react';

const Calls = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  return (
    <div style={{ backgroundColor: isDarkMode ? '#101416' : '#f1f5f9', color: isDarkMode ? '#ffffff' : '#0f172a', minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: "'Segoe UI', Roboto, sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '540px', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: isDarkMode ? '#12181a' : '#ffffff', position: 'relative', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', borderBottom: isDarkMode ? '1px solid #1e2629' : '1px solid #e2e8f0' }}>
          <button onClick={() => navigate('/inbox')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
            <ArrowLeft size={22} />
          </button>
          <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Call Logs</h2>
        </div>

        <div style={{ padding: '40px 20px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
          <Phone size={48} color="#22c55e" style={{ marginBottom: '14px' }} />
          <h3 style={{ margin: '0 0 6px 0', color: isDarkMode ? '#fff' : '#0f172a' }}>Recent Calls</h3>
          <p style={{ margin: 0, fontSize: '13px', textAlign: 'center' }}>Voice and video call history with your friends will appear here.</p>
        </div>

        {/* Bottom Navigation */}
        <div style={{ height: '64px', backgroundColor: isDarkMode ? '#12181a' : '#ffffff', borderTop: isDarkMode ? '1px solid #1e2629' : '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-around', zIndex: 10 }}>
          <button onClick={() => navigate('/inbox')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: isDarkMode ? '#64748b' : '#94a3b8', cursor: 'pointer' }}>
            <MessageSquare size={20} /><span style={{ fontSize: '11px' }}>Chats</span>
          </button>
          <button onClick={() => navigate('/calls')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#22c55e', cursor: 'pointer' }}>
            <Phone size={20} /><span style={{ fontSize: '11px', fontWeight: '700' }}>Calls</span>
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

export default Calls;