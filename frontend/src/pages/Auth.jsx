import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, ArrowRight, ShieldCheck, User, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isDarkMode } = useTheme() || { isDarkMode: true };

  const redirectUrl = searchParams.get('redirect');
  const inviterName = searchParams.get('inviter');
  const inviterEmail = searchParams.get('inviterEmail');

  const [step, setStep] = useState('email'); // 'email' | 'otp' | 'profile'
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const hostname = window.location.hostname || 'localhost';
 const API_BASE = "https://a0c7ab1e8bd767d5-154-192-215-40.serveousercontent.com";

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not send OTP');
      setStep('otp');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid OTP');

      localStorage.setItem('chathub_token', data.token);
      
      // Step to setup name & profile
      setStep('profile');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFinishProfile = (e) => {
    e.preventDefault();
    const finalName = name.trim() || email.split('@')[0];
    const userObj = { name: finalName, email: email.toLowerCase().trim() };
    
    localStorage.setItem('chathub_user', JSON.stringify(userObj));

    // If invited by a friend, save them in contacts
    if (inviterEmail) {
      const contactsKey = `chathub_contacts_${userObj.email}`;
      const existing = JSON.parse(localStorage.getItem(contactsKey) || '[]');
      const roomId = redirectUrl ? redirectUrl.split('/chat/')[1] : `room_${Date.now()}`;
      
      if (!existing.some(c => c.email === inviterEmail)) {
        existing.unshift({
          id: roomId,
          name: inviterName || inviterEmail,
          email: inviterEmail,
          lastMessage: 'Connected via invite link',
          time: 'Just now',
          unread: 0,
          online: true
        });
        localStorage.setItem(contactsKey, JSON.stringify(existing));
      }
    }

    if (redirectUrl) {
      navigate(redirectUrl);
    } else {
      navigate('/inbox');
    }
  };

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
        justifyContent: 'center',
        padding: '24px 16px',
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        boxSizing: 'border-box',
        transition: 'background-color 0.3s ease'
      }}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '430px',
          backgroundColor: isDarkMode ? '#12181a' : '#ffffff',
          borderRadius: '24px',
          padding: '36px 28px',
          boxShadow: isDarkMode ? '0 20px 50px rgba(0,0,0,0.6)' : '0 15px 35px rgba(0,0,0,0.06)',
          border: isDarkMode ? '1px solid #1e2629' : '1px solid #e2e8f0',
          position: 'relative',
          boxSizing: 'border-box'
        }}
      >
        {/* Glowing Top ChatHub Logo Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          <div 
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
              position: 'relative',
              boxShadow: '0 0 25px rgba(34, 197, 94, 0.45)'
            }}
          >
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', border: '4px solid #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffffff' }} />
            </div>
            <span style={{ position: 'absolute', top: '-4px', left: '14px', backgroundColor: '#182023', border: '2px solid #22c55e', color: '#fff', fontSize: '10px', fontWeight: '800', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              2
            </span>
          </div>

          <h1 style={{ fontSize: '26px', fontWeight: '800', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
            Chat<span style={{ color: '#22c55e' }}>Hub</span>
          </h1>

          <p style={{ fontSize: '13.5px', color: isDarkMode ? '#94a3b8' : '#64748b', textAlign: 'center', margin: 0, lineHeight: 1.4 }}>
            {inviterName 
              ? `Join conversation with ${inviterName}` 
              : (step === 'profile' ? 'Setup your profile to continue' : 'Connect seamlessly with your team & friends')}
          </p>
        </div>

        {/* Feature Badges Row */}
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '12px', 
            marginBottom: '24px',
            fontSize: '11.5px',
            color: isDarkMode ? '#cbd5e1' : '#64748b',
            fontWeight: '600'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} color="#22c55e" /> Encrypted
          </span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Zap size={14} color="#3b82f6" /> Real-time
          </span>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div 
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              padding: '12px 14px',
              borderRadius: '12px',
              fontSize: '13px',
              marginBottom: '20px',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              textAlign: 'center',
              fontWeight: '500'
            }}
          >
            {error}
          </div>
        )}

        {/* Step 1: Email Form */}
        {step === 'email' && (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: '#94a3b8' }} />
              <input 
                type="email" 
                placeholder="Enter your email address" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                style={{ width: '100%', padding: '15px 16px 15px 46px', borderRadius: '14px', border: isDarkMode ? '1px solid #27353a' : '1px solid #cbd5e1', backgroundColor: isDarkMode ? '#151c1f' : '#f8fafc', color: isDarkMode ? '#ffffff' : '#0f172a', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} 
              />
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              style={{ width: '100%', backgroundColor: '#22c55e', color: '#ffffff', border: 'none', borderRadius: '14px', padding: '15px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 6px 20px rgba(34, 197, 94, 0.35)', marginTop: '4px' }}
            >
              {loading ? 'Sending code...' : 'Continue with Email'} <ArrowRight size={18} />
            </button>
          </form>
        )}

        {/* Step 2: OTP Form */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', margin: 0 }}>
              Enter the 6-digit OTP code sent to <strong style={{ color: '#22c55e' }}>{email}</strong>
            </p>
            <div style={{ position: 'relative' }}>
              <ShieldCheck size={20} style={{ position: 'absolute', left: '16px', top: '16px', color: '#22c55e' }} />
              <input 
                type="text" 
                maxLength={6} 
                placeholder="OTP Code" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                required 
                style={{ width: '100%', padding: '15px 16px 15px 46px', borderRadius: '14px', border: '1.5px solid #22c55e', backgroundColor: isDarkMode ? '#151c1f' : '#f8fafc', color: isDarkMode ? '#ffffff' : '#0f172a', fontSize: '20px', fontWeight: 'bold', letterSpacing: '4px', textAlign: 'center', outline: 'none', boxSizing: 'border-box' }} 
              />
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              style={{ width: '100%', backgroundColor: '#22c55e', color: '#ffffff', border: 'none', borderRadius: '14px', padding: '15px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 6px 20px rgba(34, 197, 94, 0.35)', marginTop: '4px' }}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button 
              type="button" 
              onClick={() => { setStep('email'); setError(''); }} 
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '13px', textAlign: 'center', marginTop: '6px' }}
            >
              Use a different email
            </button>
          </form>
        )}

        {/* Step 3: Profile Setup */}
        {step === 'profile' && (
          <form onSubmit={handleFinishProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', margin: 0 }}>
              Choose your Display Name for ChatHub:
            </p>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: '#94a3b8' }} />
              <input 
                type="text" 
                placeholder="Your Full Name (e.g. Laiba)" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                style={{ width: '100%', padding: '15px 16px 15px 46px', borderRadius: '14px', border: '1.5px solid #22c55e', backgroundColor: isDarkMode ? '#151c1f' : '#f8fafc', color: isDarkMode ? '#ffffff' : '#0f172a', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} 
              />
            </div>
            <button 
              type="submit" 
              style={{ width: '100%', backgroundColor: '#22c55e', color: '#ffffff', border: 'none', borderRadius: '14px', padding: '15px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 6px 20px rgba(34, 197, 94, 0.35)', marginTop: '4px' }}
            >
              Complete & Enter Chats
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;