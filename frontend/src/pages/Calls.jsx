import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  ArrowLeft, 
  Phone, 
  PhoneCall, 
  PhoneIncoming, 
  PhoneOutgoing, 
  PhoneMissed, 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  PhoneOff 
} from 'lucide-react';

const mockCalls = [
  { id: 1, name: 'Adan Fatima', avatarText: 'AF', type: 'incoming', time: 'Today, 2:15 PM', missed: false },
  { id: 2, name: 'Hamza Khan', avatarText: 'HK', type: 'missed', time: 'Today, 11:30 AM', missed: true },
  { id: 3, name: 'Ayesha Tariq', avatarText: 'AT', type: 'outgoing', time: 'Yesterday, 6:45 PM', missed: false }
];

const Calls = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const [activeCall, setActiveCall] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState('Calling...');
  const [callTimer, setCallTimer] = useState(0);

  const localVideoRef = useRef(null);
  const streamRef = useRef(null);

  // Call Duration Timer
  useEffect(() => {
    let interval;
    if (activeCall && callStatus === 'Connected') {
      interval = setInterval(() => {
        setCallTimer((prev) => prev + 1);
      }, 1000);
    } else {
      setCallTimer(0);
    }
    return () => clearInterval(interval);
  }, [activeCall, callStatus]);

  // Start Call Function
  const handleStartCall = async (userName, callType) => {
    setActiveCall({ user: userName, type: callType });
    setCallStatus('Connecting...');

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: callType === 'video',
          audio: true
        });

        streamRef.current = mediaStream;

        if (localVideoRef.current && callType === 'video') {
          localVideoRef.current.srcObject = mediaStream;
        }
      }
    } catch (err) {
      console.warn('Live hardware access skipped/blocked, continuing with virtual audio-call mode:', err);
    }

    setTimeout(() => {
      setCallStatus('Connected');
    }, 1500);
  };

  // Toggle Mute
  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMuted;
      });
    }
    setIsMuted(!isMuted);
  };

  // Toggle Video
  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = isVideoOff;
      });
    }
    setIsVideoOff(!isVideoOff);
  };

  // End Call
  const handleEndCall = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setActiveCall(null);
    setIsMuted(false);
    setIsVideoOff(false);
    setCallStatus('Calling...');
    setCallTimer(0);
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
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
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div 
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: isDarkMode ? '1px solid #1e2629' : '1px solid #e2e8f0',
            backgroundColor: isDarkMode ? '#12181a' : '#ffffff',
            zIndex: 10
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button 
              type="button"
              onClick={() => navigate('/inbox')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: isDarkMode ? '#ffffff' : '#0f172a', padding: '4px' }}
            >
              <ArrowLeft size={22} />
            </button>
            <h1 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>Call Logs</h1>
          </div>

          <button 
            type="button"
            onClick={() => handleStartCall('Adan Fatima', 'voice')}
            style={{
              backgroundColor: '#22c55e',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <PhoneCall size={15} /> Quick Call
          </button>
        </div>

        {/* Calls Log List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
          {mockCalls.map((call) => (
            <div 
              key={call.id}
              style={{
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: isDarkMode ? '1px solid #182023' : '1px solid #f8fafc'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div 
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: call.missed ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                    color: call.missed ? '#ef4444' : '#22c55e',
                    fontWeight: '700',
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {call.avatarText}
                </div>

                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 4px 0' }}>{call.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                    {call.missed ? <PhoneMissed size={14} color="#ef4444" /> : call.type === 'incoming' ? <PhoneIncoming size={14} color="#22c55e" /> : <PhoneOutgoing size={14} color="#3b82f6" />}
                    <span>{call.time}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button 
                  type="button"
                  onClick={() => handleStartCall(call.name, 'voice')} 
                  style={{
                    background: 'rgba(34, 197, 94, 0.12)',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    color: '#22c55e',
                    padding: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Phone size={18} />
                </button>
                <button 
                  type="button"
                  onClick={() => handleStartCall(call.name, 'video')} 
                  style={{
                    background: 'rgba(59, 130, 246, 0.12)',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    color: '#3b82f6',
                    padding: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Video size={19} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Live Calling Screen Modal */}
        {activeCall && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: '540px',
              height: '100vh',
              backgroundColor: '#090d0f',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '40px 20px',
              zIndex: 9999
            }}
          >
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 6px 0' }}>{activeCall.user}</h2>
              <span style={{ fontSize: '14px', color: callStatus === 'Connected' ? '#22c55e' : '#f59e0b', fontWeight: '700' }}>
                {callStatus === 'Connected' ? formatTimer(callTimer) : callStatus}
              </span>
            </div>

            {/* Video View or Avatar */}
            {activeCall.type === 'video' ? (
              <div 
                style={{ 
                  width: '100%', 
                  maxWidth: '360px', 
                  height: '280px', 
                  backgroundColor: '#182023', 
                  borderRadius: '20px', 
                  overflow: 'hidden', 
                  border: '2px solid #22c55e',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                {isVideoOff && (
                  <div style={{ position: 'absolute', inset: 0, backgroundColor: '#182023', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                    Camera Paused
                  </div>
                )}
              </div>
            ) : (
              <div 
                style={{
                  width: '110px',
                  height: '110px',
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  color: '#ffffff',
                  fontSize: '36px',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 40px rgba(34, 197, 94, 0.45)'
                }}
              >
                {activeCall.user.slice(0, 2).toUpperCase()}
              </div>
            )}

            {/* Controls */}
            <div style={{ display: 'flex', gap: '22px', alignItems: 'center', marginBottom: '24px' }}>
              <button 
                type="button"
                onClick={toggleMute}
                style={{ width: '54px', height: '54px', borderRadius: '50%', backgroundColor: isMuted ? '#ef4444' : '#1f2937', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
              </button>

              {activeCall.type === 'video' && (
                <button 
                  type="button"
                  onClick={toggleVideo}
                  style={{ width: '54px', height: '54px', borderRadius: '50%', backgroundColor: isVideoOff ? '#ef4444' : '#1f2937', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
                </button>
              )}

              <button 
                type="button"
                onClick={handleEndCall}
                style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', boxShadow: '0 6px 20px rgba(239,68,68,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <PhoneOff size={28} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calls;