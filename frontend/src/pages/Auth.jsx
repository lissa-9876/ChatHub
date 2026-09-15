import React, { useState, useEffect } from 'react';
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

  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 🔴 IMPORTANT: Agar Vercel use kar rahi hain to Cloudflare URL rakhein, local k liye localhost:5000
const API_BASE = "http://localhost:5000";

  // 1. AUTO-LOGIN CHECK: Agar user pehle se verify hai to direct andar bhej do
  useEffect(() => {
    const token = localStorage.getItem('chathub_token');
    const savedUser = JSON.parse(localStorage.getItem('chathub_user') || 'null');

    if (token && savedUser?.email) {
      if (redirectUrl) {
        navigate(redirectUrl);
      } else {
        navigate('/inbox');
      }
    }
  }, [navigate, redirectUrl]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not send OTP');
      setStep('otp');
    } catch (err) {
      setError(err.message || 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanEmail = email.toLowerCase().trim();

    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid OTP');

      // Token save karein
      localStorage.setItem('chathub_token', data.token);

      // Check karein kya is email ka profile pehle se save hai
      const allUsers = JSON.parse(localStorage.getItem('chathub_registered_profiles') || '{}');
      const existingProfile = allUsers[cleanEmail];

      if (existingProfile && existingProfile.name) {
        // Purana profile restore karein
        localStorage.setItem('chathub_user', JSON.stringify(existingProfile));
        handlePostLoginNavigation(existingProfile);
      } else {
        // Naye user ko profile setup par bhejein
        setStep('profile');
      }
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishProfile = (e) => {
    e.preventDefault();
    const cleanEmail = email.toLowerCase().trim();
    const finalName = name.trim() || cleanEmail.split('@')[0];
    const userObj = { name: finalName, email: cleanEmail };

    // Profile save karein
    localStorage.setItem('chathub_user', JSON.stringify(userObj));

    // Multiple profiles mapping update
    const allUsers = JSON.parse(localStorage.getItem('chathub_registered_profiles') || '{}');
    allUsers[cleanEmail] = userObj;
    localStorage.setItem('chathub_registered_profiles', JSON.stringify(allUsers));

    handlePostLoginNavigation(userObj);
  };

  const handlePostLoginNavigation = (currentUser) => {
    if (inviterEmail) {
      const contactsKey = `chathub_contacts_${currentUser.email}`;
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
        boxSizing: 'border-box'
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
          border: isDarkMode ? '1px solid #1e2629' : '1px solid #e2e8f0'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          <div 
            style={{
              width: '74px',
              height: '74px',
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
              boxShadow: '0 0 25px rgba(34, 197, 94, 0.45)'
            }}
          >
            <ShieldCheck size={36} color="#ffffff" />
          </div>

          <h1 style={{ fontSize: '26px', fontWeight: '800', margin: '0 0 6px 0' }}>
            Chat<span style={{ color: '#22c55e' }}>Hub</span>
          </h1>

          <p style={{ fontSize: '13.5px', color: isDarkMode ? '#94a3b8' : '#64748b', textAlign: 'center', margin: 0 }}>
            {inviterName ? `Join chat with ${inviterName}` : 'Secure End-to-End Encrypted Messenger'}
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '12px', fontSize: '13px', marginBottom: '20px', border: '1px solid rgba(239, 68, 68, 0.25)', textAlign: 'center' }}>
            {error}
          </div>
        )}

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
            <button type="submit" disabled={loading} style={{ width: '100%', backgroundColor: '#22c55e', color: '#ffffff', border: 'none', borderRadius: '14px', padding: '15px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {loading ? 'Sending OTP...' : 'Continue with Email'} <ArrowRight size={18} />
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', margin: 0 }}>
              Enter 6-digit code sent to <strong style={{ color: '#22c55e' }}>{email}</strong>
            </p>
            <input 
              type="text" 
              maxLength={6} 
              placeholder="OTP Code" 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)} 
              required 
              style={{ width: '100%', padding: '15px', borderRadius: '14px', border: '1.5px solid #22c55e', backgroundColor: isDarkMode ? '#151c1f' : '#f8fafc', color: isDarkMode ? '#ffffff' : '#0f172a', fontSize: '20px', fontWeight: 'bold', letterSpacing: '4px', textAlign: 'center', outline: 'none', boxSizing: 'border-box' }} 
            />
            <button type="submit" disabled={loading} style={{ width: '100%', backgroundColor: '#22c55e', color: '#ffffff', border: 'none', borderRadius: '14px', padding: '15px', fontSize: '15px', fontWeight: '800', cursor: 'pointer' }}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        )}

        {step === 'profile' && (
          <form onSubmit={handleFinishProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', margin: 0 }}>
              Enter your Name for ChatHub:
            </p>
            <input 
              type="text" 
              placeholder="Your Full Name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              style={{ width: '100%', padding: '15px', borderRadius: '14px', border: '1.5px solid #22c55e', backgroundColor: isDarkMode ? '#151c1f' : '#f8fafc', color: isDarkMode ? '#ffffff' : '#0f172a', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} 
            />
            <button type="submit" style={{ width: '100%', backgroundColor: '#22c55e', color: '#ffffff', border: 'none', borderRadius: '14px', padding: '15px', fontSize: '15px', fontWeight: '800', cursor: 'pointer' }}>
              Complete Setup
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;