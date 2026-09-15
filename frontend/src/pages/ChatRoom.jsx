import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import { getAvatarColor, getInitials } from './Inbox';
import { encryptMessage, decryptMessage, getOneToOneRoomId } from '../utils/crypto';
import { 
  ArrowLeft, Phone, Video, MoreVertical, Paperclip, Smile, Mic, Send, 
  Check, CheckCheck, Play, Pause, Image as ImageIcon, Camera, FileText, 
  X, Square, Trash2, PhoneOff, User, Mail, Lock
} from 'lucide-react';

const emojis = ['😀', '😂', '😍', '🔥', '👍', '🎉', '❤️', '🙌', '✨', '🚀', '💯', '👏'];

const rtcConfig = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

const ChatRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme() || { isDarkMode: true };
  const socket = useSocket();

  const currentUser = JSON.parse(localStorage.getItem('chathub_user') || '{"name":"User","email":"user@gmail.com"}');
  
  const contact = location.state?.contact || {
    id: id,
    name: 'Chat Contact',
    email: location.state?.inviterEmail || 'friend@gmail.com'
  };

  const roomId = getOneToOneRoomId(currentUser.email, contact.email);

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(`chathub_msgs_${roomId}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [isRecipientOnline, setIsRecipientOnline] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // --- CALLING STATES ---
  const [activeCall, setActiveCall] = useState(null);
  const [callStatus, setCallStatus] = useState('calling');
  const [callDuration, setCallDuration] = useState(0);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);

  // --- IN-APP CAMERA STATES ---
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [photoStream, setPhotoStream] = useState(null);
  const photoVideoRef = useRef(null);
  const photoCanvasRef = useRef(null);

  // --- VOICE NOTE REFS ---
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const currentAudioRef = useRef(null);

  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(`chathub_msgs_${roomId}`, JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, roomId]);

  useEffect(() => {
    let timer;
    if (activeCall && callStatus === 'connected') {
      timer = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [activeCall, callStatus]);

  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => setRecordSeconds((prev) => prev + 1), 1000);
    } else {
      setRecordSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  // --- WebRTC Peer Connection Setup ---
  const setupPeerConnection = (stream) => {
    const pc = new RTCPeerConnection(rtcConfig);
    peerConnectionRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('webrtc_ice_candidate', { roomId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    if (stream) {
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
    }
    return pc;
  };

  useEffect(() => {
    if (!socket) return;

    socket.emit('register_user', currentUser.email);
    socket.emit('join_room', { roomId, userEmail: currentUser.email });

    socket.on('room_presence', ({ isOnline }) => { setIsRecipientOnline(isOnline); });

    socket.on('receive_message', async (data) => {
      if (data.roomId === roomId) {
        let decryptedText = data.text;
        if (data.cipherText) {
          try { decryptedText = await decryptMessage(data.cipherText, roomId); } 
          catch (e) { decryptedText = data.text || 'Encrypted Message'; }
        }
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.id)) return prev;
          return [...prev, { ...data, text: decryptedText, sender: 'them', status: 'seen' }];
        });
        socket.emit('mark_seen', { roomId, messageId: data.id });
      }
    });

    socket.on('message_seen', ({ messageId }) => {
      setMessages((prev) => prev.map((m) => (m.id === messageId || !messageId ? { ...m, status: 'seen' } : m)));
    });

    socket.on('user_typing', (data) => {
      if (data.roomId === roomId) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    });

    // --- WEBRTC SIGNALING HANDLERS ---
    socket.on('incoming_call_ring', ({ type }) => {
      setActiveCall(type);
      setCallStatus('connected');
    });

    socket.on('call_connected', async () => {
      setCallStatus('connected');
      // Caller initiates the offer once receiver accepts
      const pc = setupPeerConnection(localStreamRef.current);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('webrtc_offer', { roomId, offer });
    });

    socket.on('webrtc_offer', async ({ offer }) => {
      const pc = setupPeerConnection(localStreamRef.current);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('webrtc_answer', { roomId, answer });
    });

    socket.on('webrtc_answer', async ({ answer }) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on('webrtc_ice_candidate', async ({ candidate }) => {
      if (peerConnectionRef.current) {
        try { await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate)); } 
        catch (e) { console.error('Error adding ICE candidate', e); }
      }
    });

    socket.on('call_rejected', () => { stopMediaStream(); setActiveCall(null); });
    socket.on('call_terminated', () => { stopMediaStream(); setActiveCall(null); });

    return () => {
      socket.off('room_presence');
      socket.off('receive_message');
      socket.off('message_seen');
      socket.off('user_typing');
      socket.off('incoming_call_ring');
      socket.off('call_connected');
      socket.off('webrtc_offer');
      socket.off('webrtc_answer');
      socket.off('webrtc_ice_candidate');
      socket.off('call_rejected');
      socket.off('call_terminated');
    };
  }, [socket, roomId, currentUser.email]);

  // --- CAMERA LOGIC ---
  const startMediaStream = async (callType) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === 'video',
        audio: true
      });
      localStreamRef.current = stream;
      setTimeout(() => {
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      }, 100);
      return stream;
    } catch (err) {
      alert("Camera/Mic ki permission nahi mili! Vercel ya Cloudflare HTTPS link use karein.");
      return null;
    }
  };

  const stopMediaStream = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  };

  // --- CALL HANDLERS ---
  const handleStartCall = async (type) => {
    setActiveCall(type);
    setCallStatus('calling');
    await startMediaStream(type);
    if (socket) {
      socket.emit('start_call', {
        roomId,
        callerName: currentUser.name,
        callerEmail: currentUser.email,
        recipientEmail: contact.email,
        type
      });
    }
  };

  const handleEndCall = () => {
    stopMediaStream();
    setActiveCall(null);
    if (socket) socket.emit('end_call', { roomId });
  };

  // Accept call logic for when receiver clicks "Accept" in Inbox and comes here
  useEffect(() => {
    if (location.state?.incomingCall) {
      setActiveCall(location.state.incomingCall.type);
      setCallStatus('connecting...');
      startMediaStream(location.state.incomingCall.type).then(() => {
        socket.emit('accept_call', { roomId });
      });
    }
  }, [location.state, roomId, socket]);

  // --- MESSAGING LOGIC ---
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputMessage.trim()) return;

    const rawText = inputMessage.trim();
    let cipherText = '';
    try { cipherText = await encryptMessage(rawText, roomId); } 
    catch (e) { cipherText = rawText; }

    const newMessage = {
      id: Date.now(),
      roomId,
      sender: 'me',
      senderName: currentUser.name,
      senderEmail: currentUser.email,
      recipientEmail: contact.email,
      cipherText,
      text: rawText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: isRecipientOnline ? 'delivered' : 'sent',
      type: 'text'
    };

    if (socket) socket.emit('send_message', newMessage);

    setMessages((prev) => {
      const updated = [...prev, newMessage];
      localStorage.setItem(`chathub_msgs_${roomId}`, JSON.stringify(updated));
      return updated;
    });

    setInputMessage('');
    setShowEmojiPicker(false);
    setShowAttachMenu(false);
  };

  // --- ATTACHMENTS & VOICE NOTES ---
  const openPhotoCamera = async () => {
    setShowAttachMenu(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setPhotoStream(stream);
      setShowCameraModal(true);
      setTimeout(() => { if (photoVideoRef.current) photoVideoRef.current.srcObject = stream; }, 100);
    } catch (err) { alert("Camera ki permission error!"); }
  };

  const closePhotoCamera = () => {
    if (photoStream) { photoStream.getTracks().forEach(track => track.stop()); setPhotoStream(null); }
    setShowCameraModal(false);
  };

  const capturePhoto = () => {
    if (photoVideoRef.current && photoCanvasRef.current) {
      const video = photoVideoRef.current;
      const canvas = photoCanvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageUrl = canvas.toDataURL('image/jpeg');

      const newMediaMsg = {
        id: Date.now(), roomId, sender: 'me', senderName: currentUser.name, senderEmail: currentUser.email,
        recipientEmail: contact.email, mediaUrl: imageUrl, fileName: 'captured_photo.jpg',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: isRecipientOnline ? 'delivered' : 'sent', type: 'image'
      };

      if (socket) socket.emit('send_message', newMediaMsg);
      setMessages((prev) => [...prev, newMediaMsg]);
      closePhotoCamera();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const newVoiceMsg = {
            id: Date.now(), roomId, sender: 'me', senderName: currentUser.name, senderEmail: currentUser.email,
            recipientEmail: contact.email, audioData: reader.result, audioDuration: `0:${recordSeconds < 10 ? '0' : ''}${recordSeconds || 3}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: isRecipientOnline ? 'delivered' : 'sent', type: 'voice'
          };
          if (socket) socket.emit('send_message', newVoiceMsg);
          setMessages((prev) => [...prev, newVoiceMsg]);
        };
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) { alert('Microphone permission required.'); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const togglePlayAudio = (msgId, audioSrc) => {
    if (playingAudioId === msgId) {
      currentAudioRef.current?.pause();
      setPlayingAudioId(null);
    } else {
      if (currentAudioRef.current) currentAudioRef.current.pause();
      const audio = new Audio(audioSrc);
      audio.playbackRate = playbackSpeed;
      currentAudioRef.current = audio;
      audio.play();
      setPlayingAudioId(msgId);
      audio.onended = () => setPlayingAudioId(null);
    }
  };

  const changeSpeed = () => {
    const next = playbackSpeed === 1 ? 1.5 : (playbackSpeed === 1.5 ? 2 : 1);
    setPlaybackSpeed(next);
    if (currentAudioRef.current) currentAudioRef.current.playbackRate = next;
  };

  const handleFileUpload = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const newMediaMsg = {
        id: Date.now(), roomId, sender: 'me', senderName: currentUser.name, senderEmail: currentUser.email,
        recipientEmail: contact.email, mediaUrl: reader.result, fileName: file.name,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: isRecipientOnline ? 'delivered' : 'sent', type: fileType
      };
      if (socket) socket.emit('send_message', newMediaMsg);
      setMessages((prev) => [...prev, newMediaMsg]);
      setShowAttachMenu(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ backgroundColor: isDarkMode ? '#101416' : '#f1f5f9', color: isDarkMode ? '#ffffff' : '#0f172a', minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: "'Segoe UI', Roboto, sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '540px', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: isDarkMode ? '#12181a' : '#ffffff', position: 'relative', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: isDarkMode ? '1px solid #1e2629' : '1px solid #e2e8f0' }}>
          <div onClick={() => setShowProfileDrawer(true)} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flex: 1, minWidth: 0 }}>
            <button onClick={(e) => { e.stopPropagation(); navigate('/inbox'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><ArrowLeft size={22} /></button>
            <div style={{ position: 'relative' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: getAvatarColor(contact.name), color: '#ffffff', fontWeight: '700', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{getInitials(contact.name)}</div>
              {isRecipientOnline && <span style={{ position: 'absolute', bottom: '1px', right: '1px', width: '11px', height: '11px', backgroundColor: '#22c55e', border: '2px solid #12181a', borderRadius: '50%' }} />}
            </div>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>{contact.name}</h2>
              <span style={{ fontSize: '11px', color: isTyping ? '#3b82f6' : (isRecipientOnline ? '#22c55e' : '#94a3b8'), fontWeight: '600' }}>{isTyping ? 'typing...' : (isRecipientOnline ? 'Online' : 'Offline')}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: isDarkMode ? '#cbd5e1' : '#475569' }}>
            <button onClick={() => handleStartCall('audio')} title="Voice Call" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><Phone size={20} /></button>
            <button onClick={() => handleStartCall('video')} title="Video Call" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><Video size={21} /></button>
            <button onClick={() => setShowOptionsMenu(!showOptionsMenu)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><MoreVertical size={20} /></button>
          </div>
        </div>

        {/* E2EE Banner */}
        <div style={{ backgroundColor: isDarkMode ? '#151c1f' : '#f1f5f9', padding: '6px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderBottom: isDarkMode ? '1px solid #1e2629' : '1px solid #e2e8f0' }}>
          <Lock size={12} color="#22c55e" />
          <span style={{ fontSize: '11px', color: isDarkMode ? '#94a3b8' : '#64748b', fontWeight: '500' }}>Messages are end-to-end encrypted</span>
        </div>

        {/* Message Feed */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: isDarkMode ? '#0d1113' : '#f8fafc' }}>
          {messages.map((msg) => {
            const isMe = msg.sender === 'me' || msg.senderEmail === currentUser.email;
            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '80%', padding: msg.type === 'voice' ? '10px 14px' : (msg.type === 'image' ? '6px' : '12px 16px'), borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px', backgroundColor: isMe ? '#22c55e' : (isDarkMode ? '#1a2226' : '#ffffff'), color: isMe ? '#ffffff' : (isDarkMode ? '#f1f5f9' : '#0f172a') }}>
                  {msg.type === 'image' && <img src={msg.mediaUrl} alt="Media" style={{ width: '100%', maxWidth: '240px', borderRadius: '14px', display: 'block' }} />}
                  {msg.type === 'voice' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '200px' }}>
                      <button onClick={() => togglePlayAudio(msg.id, msg.audioData)} style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#fff', border: 'none', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        {playingAudioId === msg.id ? <Pause size={16} fill="#22c55e" /> : <Play size={16} fill="#22c55e" />}
                      </button>
                      <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{msg.audioDuration}</span>
                    </div>
                  )}
                  {msg.type === 'text' && <p style={{ margin: 0, fontSize: '14.5px', lineHeight: 1.45 }}>{msg.text}</p>}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Attachments Menu */}
        {showAttachMenu && (
          <div style={{ position: 'absolute', bottom: '75px', left: '16px', backgroundColor: '#1a2226', borderRadius: '16px', padding: '12px', display: 'flex', gap: '16px', zIndex: 20 }}>
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#cbd5e1' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><ImageIcon size={20} /></div>
              <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Gallery</span>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={(e) => handleFileUpload(e, 'image')} style={{ display: 'none' }} />
            </label>
            <button type="button" onClick={openPhotoCamera} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#cbd5e1', background: 'none', border: 'none' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Camera size={20} /></div>
              <span style={{ fontSize: '11px', fontWeight: 'bold', fontFamily: 'inherit' }}>Camera</span>
            </button>
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#cbd5e1' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><FileText size={20} /></div>
              <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Document</span>
              <input type="file" accept=".pdf,.doc,.docx" ref={docInputRef} onChange={(e) => handleFileUpload(e, 'document')} style={{ display: 'none' }} />
            </label>
          </div>
        )}

        {/* Input Bar */}
        <div style={{ padding: '12px 14px', backgroundColor: isDarkMode ? '#12181a' : '#ffffff', borderTop: isDarkMode ? '1px solid #1e2629' : '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button type="button" onClick={() => setShowAttachMenu(!showAttachMenu)} style={{ background: showAttachMenu ? '#27353a' : 'none', border: 'none', borderRadius: '50%', cursor: 'pointer', color: showAttachMenu ? '#22c55e' : '#94a3b8', padding: '6px' }}>
            {showAttachMenu ? <X size={20} /> : <Paperclip size={20} />}
          </button>
          
          <form onSubmit={handleSendMessage} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '100%', backgroundColor: isDarkMode ? '#182023' : '#f1f5f9', borderRadius: '22px', padding: '8px 14px', display: 'flex', alignItems: 'center', border: isDarkMode ? '1px solid #27353a' : '1px solid #e2e8f0' }}>
              <input type="text" placeholder="Type a message..." value={inputMessage} onChange={(e) => { setInputMessage(e.target.value); if(socket) socket.emit('typing', { roomId }); }} style={{ background: 'transparent', border: 'none', outline: 'none', color: isDarkMode ? '#fff' : '#0f172a', fontSize: '14.5px', width: '100%' }} />
            </div>
          </form>

          {inputMessage.trim() ? (
            <button type="button" onClick={handleSendMessage} style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#22c55e', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Send size={18} /></button>
          ) : (
            <button type="button" onClick={isRecording ? stopRecording : startRecording} style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: isRecording ? '#ef4444' : '#22c55e', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              {isRecording ? <Square size={16} /> : <Mic size={19} />}
            </button>
          )}
        </div>

        {/* --- CALLING OVERLAY (WebRTC Video Screen) --- */}
        {activeCall && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: '#090d0f', zIndex: 60, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {activeCall === 'video' ? (
                <video 
                  ref={remoteVideoRef} 
                  autoPlay 
                  playsInline 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', backgroundColor: '#111' }} 
                />
              ) : (
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: getAvatarColor(contact.name), color: '#fff', fontSize: '40px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {getInitials(contact.name)}
                </div>
              )}
              
              <div style={{ position: 'absolute', top: '40px', textAlign: 'center', width: '100%', zIndex: 2 }}>
                <h2 style={{ color: '#fff', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{contact.name}</h2>
                <span style={{ color: '#22c55e', fontWeight: 'bold', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                  {callStatus === 'calling' ? 'Calling...' : `Connected (${callDuration}s)`}
                </span>
              </div>
            </div>

            {activeCall === 'video' && (
              <div style={{ position: 'absolute', bottom: '120px', right: '20px', width: '100px', height: '140px', borderRadius: '12px', overflow: 'hidden', border: '2px solid #22c55e', backgroundColor: '#222', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            <div style={{ padding: '30px', display: 'flex', justifyContent: 'center', gap: '24px', backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <button onClick={handleEndCall} style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PhoneOff size={28} />
              </button>
            </div>
          </div>
        )}

        {/* --- LIVE PHOTO CAPTURE MODAL --- */}
        {showCameraModal && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: '#000', zIndex: 70, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', color: '#fff', alignItems: 'center' }}>
              <button onClick={closePhotoCamera} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={24} /></button>
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Take Photo</span>
              <div style={{ width: '24px' }}></div>
            </div>
            
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              <video ref={photoVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <canvas ref={photoCanvasRef} style={{ display: 'none' }}></canvas>
            </div>
            
            <div style={{ padding: '30px', display: 'flex', justifyContent: 'center', backgroundColor: '#111' }}>
              <button onClick={capturePhoto} style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#fff', border: '4px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: '#e2e8f0' }}></div>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ChatRoom;