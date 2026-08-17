import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Splash = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme(); // 👈 Global Theme Hook connected

  return (
    <div 
      style={{
        backgroundColor: isDarkMode ? '#101416' : '#f8fafc',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        transition: 'background-color 0.3s ease'
      }}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '480px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        
        {/* 🟢 Large Prominent 3D Green Hub Graphic */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <svg 
            style={{ 
              width: '340px', 
              height: '340px', 
              filter: isDarkMode 
                ? 'drop-shadow(0 25px 35px rgba(34, 197, 94, 0.28))' 
                : 'drop-shadow(0 20px 30px rgba(34, 197, 94, 0.2))' 
            }} 
            viewBox="0 0 400 400" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background Green Foliage */}
            <circle cx="150" cy="170" r="75" fill="#22c55e" fillOpacity="0.85" />
            <circle cx="285" cy="155" r="58" fill="#16a34a" fillOpacity="0.9" />
            <circle cx="115" cy="220" r="48" fill="#15803d" fillOpacity="0.8" />
            
            {/* Shadow */}
            <ellipse cx="200" cy="335" rx="145" ry="22" fill={isDarkMode ? "#080c0d" : "#cbd5e1"} fillOpacity={isDarkMode ? "0.8" : "0.5"} />

            {/* 3D House */}
            <path d="M220 230 L315 175 L315 285 L220 335 Z" fill="#4ade80" />
            <path d="M155 270 L220 230 L220 335 L155 365 Z" fill="#22c55e" />
            <path d="M155 270 L250 215 L315 175 L220 230 Z" fill="#86efac" />
            
            <rect x="245" y="225" width="24" height="32" rx="3" fill="#14532d" />
            <rect x="280" y="205" width="24" height="32" rx="3" fill="#14532d" />

            {/* 3D Floating Smartphone */}
            <g transform="rotate(-6 180 200)">
              <rect x="135" y="105" width="110" height="200" rx="24" fill="#0f172a" stroke="#334155" strokeWidth="4" />
              <rect x="141" y="111" width="98" height="188" rx="19" fill="#ffffff" />
              <path d="M141 130 C141 120 149 111 159 111 L221 111 C231 111 239 120 239 130 L239 180 L141 180 Z" fill="#22c55e" />
              <circle cx="190" cy="146" r="22" stroke="#ffffff" strokeWidth="4" fill="none" />
              <circle cx="190" cy="146" r="12" stroke="#ffffff" strokeWidth="3" fill="none" />
              <circle cx="190" cy="146" r="4" fill="#ffffff" />
              <rect x="152" y="195" width="76" height="8" rx="4" fill="#e2e8f0" />
              <rect x="152" y="210" width="56" height="8" rx="4" fill="#cbd5e1" />
              <rect x="152" y="225" width="68" height="8" rx="4" fill="#e2e8f0" />
              <rect x="178" y="287" width="26" height="4" rx="2" fill="#94a3b8" />
            </g>
          </svg>
        </div>

        {/* 🔤 Title (Auto Light/Dark Text) */}
        <h1 
          style={{
            color: isDarkMode ? '#ffffff' : '#0f172a',
            fontSize: '44px',
            fontWeight: '900',
            letterSpacing: '-0.03em',
            margin: '0 0 8px 0',
            textShadow: isDarkMode ? '0 2px 10px rgba(0,0,0,0.5)' : 'none',
            transition: 'color 0.3s ease'
          }}
        >
          Chathub
        </h1>
        
        {/* Subtitle (Auto Light/Dark Subtitle) */}
        <p 
          style={{
            color: isDarkMode ? '#94a3b8' : '#64748b',
            fontSize: '16px',
            fontWeight: '500',
            lineHeight: '1.4',
            maxWidth: '320px',
            margin: '0 0 32px 0',
            transition: 'color 0.3s ease'
          }}
        >
          Fast, scannable messaging for people and teams
        </p>

        {/* 🔘 Rectangular Start Button */}
        <button 
          onClick={() => navigate('/auth')}
          style={{
            width: '280px',
            backgroundColor: isDarkMode ? '#94a3b8' : '#e2e8f0',
            color: '#0f172a',
            fontWeight: '700',
            fontSize: '17px',
            padding: '14px 0',
            borderRadius: '8px',
            border: isDarkMode ? 'none' : '1px solid #cbd5e1',
            cursor: 'pointer',
            boxShadow: isDarkMode ? '0 4px 14px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.06)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#22c55e';
            e.target.style.color = '#ffffff';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = isDarkMode ? '#94a3b8' : '#e2e8f0';
            e.target.style.color = '#0f172a';
          }}
        >
          Start
        </button>

      </div>
    </div>
  );
};

export default Splash;