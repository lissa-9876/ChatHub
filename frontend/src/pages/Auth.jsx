import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Auth = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme() || { isDarkMode: true };

  const [isLogin, setIsLogin] = useState(false);
  const [step, setStep] = useState('auth'); // 'auth' | 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  const hostname = window.location.hostname || 'localhost';
  const API_BASE = `http://${hostname}:5000/api/auth`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    const url = isLogin ? `${API_BASE}/login` : `${API_BASE}/register`;
    const payload = isLogin ? { email, password } : { name, phone, email, password };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Action could not be completed.');
      }

      if (isLogin) {
        localStorage.setItem('chathub_token', data.token);
        localStorage.setItem('chathub_user', JSON.stringify(data.user));
        navigate('/inbox');
      } else {
        setSuccessMsg(data.message || 'OTP sent! Please check your email.');
        setStep('otp');
      }
    } catch (err) {
      setError(err.message || 'Connection failed. Please check backend server.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'OTP verification failed');

      localStorage.setItem('chathub_token', data.token);
      localStorage.setItem('chathub_user', JSON.stringify(data.user));
      navigate('/inbox');
    } catch (err) {
      setError(err.message || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
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
        boxSizing: 'border-box'
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Glowing Green Top Banner */}
        <div 
          style={{
            width: '100%',
            backgroundColor: isDarkMode ? '#12181a' : '#ffffff',
            borderRadius: '24px',
            padding: '24px 20px',
            marginBottom: '24px',
            border: '1.5px solid #22c55e',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
            boxSizing: 'border-box'
          }}
        >
          <div 
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
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

          <h2 style={{ color: isDarkMode ? '#ffffff' : '#0f172a', fontSize: '28px', fontWeight: '800', margin: '0 0 6px 0' }}>
            Chathub
          </h2>
          <p style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: '14px', margin: 0, textAlign: 'center' }}>
            {isLogin ? 'Sign in to access your chats' : 'Fast, scannable messaging for people and teams'}
          </p>
        </div>

        {/* Error Feedback Message Box */}
        {error && (
          <div style={{ width: '100%', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#ef4444', padding: '12px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: '600', marginBottom: '16px', textAlign: 'center', boxSizing: 'border-box' }}>
            {error}
          </div>
        )}

        {/* Success Feedback Message Box */}
        {successMsg && (
          <div style={{ width: '100%', backgroundColor: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', color: '#22c55e', padding: '12px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: '600', marginBottom: '16px', textAlign: 'center', boxSizing: 'border-box' }}>
            {successMsg}
          </div>
        )}

        {step === 'auth' ? (
          <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {!isLogin && (
              <>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: '#94a3b8' }} />
                  <input 
                    type="text" 
                    placeholder="Name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '15px 16px 15px 46px', borderRadius: '14px', border: '1px solid #27353a', backgroundColor: '#151c1f', color: '#ffffff', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ position: 'relative' }}>
                  <Phone size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: '#94a3b8' }} />
                  <input 
                    type="tel" 
                    placeholder="Phone Number" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    style={{ width: '100%', padding: '15px 16px 15px 46px', borderRadius: '14px', border: '1px solid #27353a', backgroundColor: '#151c1f', color: '#ffffff', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </>
            )}

            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: '#94a3b8' }} />
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                style={{ width: '100%', padding: '15px 16px 15px 46px', borderRadius: '14px', border: '1px solid #27353a', backgroundColor: '#151c1f', color: '#ffffff', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: '#94a3b8' }} />
              <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                style={{ width: '100%', padding: '15px 16px 15px 46px', borderRadius: '14px', border: '1px solid #27353a', backgroundColor: '#151c1f', color: '#ffffff', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: '#22c55e',
                color: '#ffffff',
                border: 'none',
                borderRadius: '14px',
                padding: '16px',
                fontSize: '16px',
                fontWeight: '800',
                cursor: 'pointer',
                marginTop: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 6px 20px rgba(34, 197, 94, 0.35)'
              }}
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Join')} <ArrowRight size={18} />
            </button>

            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <button 
                type="button" 
                onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMsg(''); }}
                style={{ background: 'none', border: 'none', color: '#22c55e', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
              >
                {isLogin ? "Need an account? Join" : "Already have an account? Sign In"}
              </button>
            </div>
          </form>
        ) : (
          /* OTP Verification Form */
          <form onSubmit={handleVerifyOtp} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ textAlign: 'center', fontSize: '14px', color: '#94a3b8', margin: '0 0 8px 0' }}>
              Enter the 6-digit verification code sent to <strong style={{ color: '#22c55e' }}>{email}</strong>
            </p>

            <div style={{ position: 'relative' }}>
              <ShieldCheck size={20} style={{ position: 'absolute', left: '16px', top: '16px', color: '#22c55e' }} />
              <input 
                type="text" 
                maxLength={6}
                placeholder="6-Digit OTP" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                required 
                style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '14px', border: '1.5px solid #22c55e', backgroundColor: '#151c1f', color: '#ffffff', fontSize: '20px', fontWeight: '800', letterSpacing: '6px', textAlign: 'center', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: '#22c55e',
                color: '#ffffff',
                border: 'none',
                borderRadius: '14px',
                padding: '16px',
                fontSize: '16px',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(34, 197, 94, 0.35)'
              }}
            >
              {loading ? 'Verifying OTP...' : 'Verify OTP & Enter ChatHub'}
            </button>

            <button 
              type="button" 
              onClick={() => { setStep('auth'); setError(''); }}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', textAlign: 'center' }}
            >
              Back to Join
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;