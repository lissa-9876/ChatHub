import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Auth = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme(); // 👈 Global hook used across all pages

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
    navigate('/inbox');
  };

  return (
    <div 
      style={{
        backgroundColor: isDarkMode ? '#101416' : '#f1f5f9',
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
          maxWidth: '420px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* Top Banner Card */}
        <div 
          style={{
            width: '100%',
            backgroundColor: isDarkMode ? '#12181a' : '#ffffff',
            borderRadius: '24px',
            padding: '24px 20px',
            marginBottom: '28px',
            border: isDarkMode ? '1.5px solid #22c55e' : '1.5px solid #16a34a',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: isDarkMode ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 25px rgba(34,197,94,0.12)',
            transition: 'all 0.3s ease'
          }}
        >
          <div style={{ marginBottom: '14px' }}>
            <svg 
              style={{ width: '130px', height: '130px', filter: 'drop-shadow(0 10px 20px rgba(34, 197, 94, 0.3))' }} 
              viewBox="0 0 200 200" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M138 35 C175 52, 185 92, 172 130 C159 168, 125 182, 85 178 C45 174, 22 145, 28 105 C34 65, 68 42, 105 32 C118 28, 128 30, 138 35 Z" 
                fill="#22c55e" 
              />
              <path 
                d="M130 42 C162 58, 170 92, 158 124 C146 156, 116 168, 82 165 C48 162, 30 138, 35 104 C40 70, 70 50, 102 41 C113 38, 121 40, 130 42 Z" 
                fill="#4ade80" 
                fillOpacity="0.5" 
              />
              <circle cx="58" cy="52" r="11" fill="#14532d" />
              <text x="58" y="56" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">2</text>
              <circle cx="148" cy="62" r="12" fill="#14532d" />
              <circle cx="148" cy="59" r="4" fill="#86efac" />
              <path d="M141 68 C141 64 144 63 148 63 C152 63 155 64 155 68 Z" fill="#86efac" />
              <circle cx="100" cy="108" r="24" fill="#ffffff" />
              <circle cx="100" cy="108" r="14" fill="#15803d" />
              <circle cx="100" cy="108" r="7" fill="#ffffff" />
              <rect x="80" y="142" width="40" height="8" rx="4" fill="#ffffff" fillOpacity="0.8" />
            </svg>
          </div>

          <h2 
            style={{
              color: isDarkMode ? '#ffffff' : '#0f172a',
              fontSize: '28px',
              fontWeight: '800',
              letterSpacing: '-0.02em',
              margin: '0 0 6px 0'
            }}
          >
            Chathub
          </h2>
          <p 
            style={{
              color: isDarkMode ? '#94a3b8' : '#64748b',
              fontSize: '14px',
              fontWeight: '500',
              textAlign: 'center',
              margin: 0,
              maxWidth: '260px',
              lineHeight: '1.4'
            }}
          >
            Fast, scannable messaging for people and teams
          </p>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <input 
            type="text" 
            name="name"
            required
            placeholder="Name" 
            value={formData.name}
            onChange={handleChange}
            style={{
              width: '100%',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              padding: '14px 16px',
              borderRadius: '6px',
              border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1',
              fontSize: '15px',
              fontWeight: '500',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />

          <input 
            type="tel" 
            name="phone"
            required
            placeholder="Phone Number" 
            value={formData.phone}
            onChange={handleChange}
            style={{
              width: '100%',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              padding: '14px 16px',
              borderRadius: '6px',
              border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1',
              fontSize: '15px',
              fontWeight: '500',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />

          <input 
            type="email" 
            name="email"
            required
            placeholder="Email" 
            value={formData.email}
            onChange={handleChange}
            style={{
              width: '100%',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              padding: '14px 16px',
              borderRadius: '6px',
              border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1',
              fontSize: '15px',
              fontWeight: '500',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />

          <input 
            type="password" 
            name="password"
            required
            placeholder="Password" 
            value={formData.password}
            onChange={handleChange}
            style={{
              width: '100%',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              padding: '14px 16px',
              borderRadius: '6px',
              border: isDarkMode ? '1px solid #334155' : '1px solid #cbd5e1',
              fontSize: '15px',
              fontWeight: '500',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          
          <button 
            type="submit"
            style={{
              width: '100%',
              backgroundColor: '#94a3b8',
              color: '#0f172a',
              fontWeight: '700',
              fontSize: '16px',
              padding: '14px 0',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              marginTop: '10px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#0d863a';
              e.target.style.color = '#1ed827';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#83ed6c';
              e.target.style.color = '#0f172a';
            }}
          >
            Join
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;