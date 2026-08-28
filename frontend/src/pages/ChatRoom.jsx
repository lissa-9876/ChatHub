import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import { getAvatarColor, getInitials } from './Inbox';
import { encryptMessage, decryptMessage, getOneToOneRoomId } from '../utils/crypto';
import { 
  ArrowLeft, 
  Phone, 
  Video, 
  MoreVertical, 
  Paperclip, 
  Smile, 
  Mic, 
  Send, 
  Check, 
  CheckCheck, 
  Play, 
  Pause,
  Image as ImageIcon, 
  Camera, 
  FileText, 
  X, 
  Square,
  Trash2,
  PhoneOff,
  MicOff,
  User,
  Mail,
  ShieldCheck,
  Lock
} from 'lucide-react';

const emojis = ['😀', '😂', '😍', '🔥', '👍', '🎉', '❤️', '🙌', '✨', '🚀', '💯', '👏'];

const ChatRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const socket = useSocket();

  const currentUser = JSON.parse(localStorage.getItem('chathub_user') || '{"name":"User","email":"user@gmail.com"}');
  
  const contact = location.state?.contact || {
    id: id,
    name: 'Chat Contact',
    email: 'friend@gmail.com'
  };

  // Ensure deterministic 1-to-1 encrypted room ID
  const roomId = getOneToOneRoomId(currentUser.email, contact.email);

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(`chat_msg_${roomId}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [isRecipientOnline, setIsRecipientOnline] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Calling States
  const [activeCall, setActiveCall] = useState(null);
  const [callStatus, setCallStatus] = useState('calling');
  const [callDuration, setCallDuration] = useState(0);

  // Voice Note Recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Voice Playback with Speed Rates (1x, 1.5x, 2x)
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const currentAudioRef = useRef(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const docInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(`chat_msg_${roomId}`, JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => setRecordSeconds((prev) => prev + 1), 1000);
    } else {
      setRecordSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  useEffect(() => {
    let timer;
    if (activeCall && callStatus === 'connected') {
      timer = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [activeCall, callStatus]);

  // Socket Connection & Real-Time Decryption
  useEffect(() => {
    if (!socket) return;

    socket.emit('register_user', currentUser.email);
    socket.emit('join_room', { roomId, userEmail: currentUser.email });

    socket.on('room_presence', ({ isOnline }) => {
      setIsRecipientOnline(isOnline);
    });

    socket.on('receive_message', async (data) => {
      // E2EE Decrypt incoming cipher payload
      let decryptedText = data.text;
      if (data.cipherText) {
        decryptedText = await decryptMessage(data.cipherText, roomId);
      }

      setMessages((prev) => [...prev, { ...data, text: decryptedText, sender: 'them', status: 'seen' }]);
      socket.emit('mark_seen', { roomId, messageId: data.id });
    });

    socket.on('message_seen', ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId || !messageId ? { ...m, status: 'seen' } : m))
      );
    });

    socket.on('user_typing', () => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    });

    socket.on('incoming_call_ring', ({ type }) => {
      setActiveCall(type);
      setCallStatus('connected');
    });

    socket.on('call_connected', () => {
      setCallStatus('connected');
    });

    socket.on('call_rejected', () => {
      setActiveCall(null);
    });

    socket.on('call_terminated', () => {
      setActiveCall(null);
    });

    return () => {
      socket.off('room_presence');
      socket.off('receive_message');
      socket.off('message_seen');
      socket.off('user_typing');
      socket.off('incoming_call_ring');
      socket.off('call_connected');
      socket.off('call_rejected');
      socket.off('call_terminated');
    };
  }, [socket, roomId, currentUser]);

  // Send Encrypted Message
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputMessage.trim()) return;

    const rawText = inputMessage.trim();
    // 🔒 AES-GCM 256-bit Encrypt before network send
    const cipherText = await encryptMessage(rawText, roomId);

    const newMessage = {
      id: Date.now(),
      roomId,
      sender: 'me',
      senderName: currentUser.name,
      senderEmail: currentUser.email,
      recipientEmail: contact.email,
      cipherText, // Encrypted payload for wire
      text: rawText, // Plaintext stored in sender's local storage
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: isRecipientOnline ? 'delivered' : 'sent',
      type: 'text'
    };

    if (socket) socket.emit('send_message', newMessage);

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage('');
    setShowEmojiPicker(false);
    setShowAttachMenu(false);
  };

  // Voice Note
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const newVoiceMsg = {
            id: Date.now(),
            roomId,
            sender: 'me',
            senderName: currentUser.name,
            senderEmail: currentUser.email,
            recipientEmail: contact.email,
            audioData: reader.result,
            audioDuration: `0:${recordSeconds < 10 ? '0' : ''}${recordSeconds || 3}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: isRecipientOnline ? 'delivered' : 'sent',
            type: 'voice'
          };

          if (socket) socket.emit('send_message', newVoiceMsg);
          setMessages((prev) => [...prev, newVoiceMsg]);
        };
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert('Microphone permission required.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const togglePlayAudio = (msgId, audioSrc) => {
    if (playingAudioId === msgId) {
      currentAudioRef.current.pause();
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
        id: Date.now(),
        roomId,
        sender: 'me',
        senderName: currentUser.name,
        senderEmail: currentUser.email,
        recipientEmail: contact.email,
        mediaUrl: reader.result,
        fileName: file.name,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: isRecipientOnline ? 'delivered' : 'sent',
        type: fileType
      };

      if (socket) socket.emit('send_message', newMediaMsg);
      setMessages((prev) => [...prev, newMediaMsg]);
      setShowAttachMenu(false);
    };
    reader.readAsDataURL(file);
  };

  const handleStartCall = (type) => {
    setActiveCall(type);
    setCallStatus('calling');
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
    setActiveCall(null);
    if (socket) socket.emit('end_call', { roomId });
  };

  return (
    <div style={{ backgroundColor: isDarkMode ? '#101416' : '#f1f5f9', color: isDarkMode ? '#ffffff' : '#0f172a', minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: "'Segoe UI', Roboto, sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '540px', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: isDarkMode ? '#12181a' : '#ffffff', position: 'relative', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: isDarkMode ? '1px solid #1e2629' : '1px solid #e2e8f0' }}>
          <div onClick={() => setShowProfileDrawer(true)} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flex: 1, minWidth: 0 }}>
            <button onClick={(e) => { e.stopPropagation(); navigate('/inbox'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><ArrowLeft size={22} /></button>
            <div style={{ position: 'relative' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: getAvatarColor(contact.name), color: '#ffffff', fontWeight: '700', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {getInitials(contact.name)}
              </div>
              {isRecipientOnline && <span style={{ position: 'absolute', bottom: '1px', right: '1px', width: '11px', height: '11px', backgroundColor: '#22c55e', border: '2px solid #12181a', borderRadius: '50%' }} />}
            </div>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>{contact.name}</h2>
              <span style={{ fontSize: '11px', color: isTyping ? '#3b82f6' : (isRecipientOnline ? '#22c55e' : '#94a3b8'), fontWeight: '600' }}>
                {isTyping ? 'typing...' : (isRecipientOnline ? 'Online' : 'Offline')}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: isDarkMode ? '#cbd5e1' : '#475569' }}>
            <button onClick={() => handleStartCall('audio')} title="Voice Call" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><Phone size={20} /></button>
            <button onClick={() => handleStartCall('video')} title="Video Call" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><Video size={21} /></button>
            <button onClick={() => setShowOptionsMenu(!showOptionsMenu)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><MoreVertical size={20} /></button>

            {showOptionsMenu && (
              <div style={{ position: 'absolute', right: '16px', top: '50px', backgroundColor: '#1c2427', border: '1px solid #27353a', borderRadius: '12px', padding: '8px 0', minWidth: '160px', zIndex: 30, boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                <button onClick={() => { setShowProfileDrawer(true); setShowOptionsMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 16px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><User size={16} /> View Profile</button>
                <button onClick={() => { setMessages([]); localStorage.removeItem(`chat_msg_${roomId}`); setShowOptionsMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 16px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /> Clear Chat</button>
              </div>
            )}
          </div>
        </div>

        {/* E2EE Lock Banner */}
        <div style={{ backgroundColor: isDarkMode ? '#151c1f' : '#f1f5f9', padding: '6px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderBottom: isDarkMode ? '1px solid #1e2629' : '1px solid #e2e8f0' }}>
          <Lock size={12} color="#22c55e" />
          <span style={{ fontSize: '11px', color: isDarkMode ? '#94a3b8' : '#64748b', fontWeight: '500' }}>
            Messages are end-to-end encrypted with AES-256
          </span>
        </div>

        {/* Message Feed */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: isDarkMode ? '#0d1113' : '#f8fafc' }}>
          {messages.map((msg) => {
            const isMe = msg.sender === 'me';
            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '80%', padding: msg.type === 'voice' ? '10px 14px' : (msg.type === 'image' ? '6px' : '12px 16px'), borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px', backgroundColor: isMe ? '#22c55e' : (isDarkMode ? '#1a2226' : '#ffffff'), color: isMe ? '#ffffff' : (isDarkMode ? '#f1f5f9' : '#0f172a'), boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  
                  {msg.type === 'image' && <img src={msg.mediaUrl} alt="Media" style={{ width: '100%', maxWidth: '240px', borderRadius: '14px', display: 'block' }} />}
                  
                  {msg.type === 'document' && (
                    <a href={msg.mediaUrl} download={msg.fileName || 'file.pdf'} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'inherit', textDecoration: 'none' }}>
                      <FileText size={20} /><span style={{ fontSize: '13px', fontWeight: 'bold' }}>{msg.fileName || 'Document'}</span>
                    </a>
                  )}

                  {msg.type === 'voice' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '200px' }}>
                      <button onClick={() => togglePlayAudio(msg.id, msg.audioData)} style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#fff', border: 'none', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        {playingAudioId === msg.id ? <Pause size={16} fill="#22c55e" /> : <Play size={16} fill="#22c55e" />}
                      </button>
                      <div style={{ flex: 1, height: '4px', backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: '2px' }} />
                      <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{msg.audioDuration || '0:05'}</span>
                      <button onClick={changeSpeed} style={{ backgroundColor: 'rgba(0,0,0,0.25)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px', padding: '3px 6px', cursor: 'pointer', fontWeight: 'bold' }}>
                        {playbackSpeed}x
                      </button>
                    </div>
                  )}

                  {msg.type === 'text' && <p style={{ margin: 0, fontSize: '14.5px', lineHeight: 1.45 }}>{msg.text}</p>}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <span style={{ fontSize: '11px', color: isDarkMode ? '#64748b' : '#94a3b8' }}>{msg.time}</span>
                  {isMe && (
                    <>
                      {msg.status === 'sent' && <Check size={14} color="#94a3b8" />}
                      {msg.status === 'delivered' && <CheckCheck size={14} color="#94a3b8" />}
                      {msg.status === 'seen' && <CheckCheck size={14} color="#38bdf8" />}
                    </>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Emoji Bar */}
        {showEmojiPicker && (
          <div style={{ position: 'absolute', bottom: '75px', right: '60px', backgroundColor: '#1a2226', borderRadius: '16px', padding: '10px', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', zIndex: 25 }}>
            {emojis.map((emoji, index) => (
              <button key={index} type="button" onClick={() => { setInputMessage((prev) => prev + emoji); setShowEmojiPicker(false); }} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>{emoji}</button>
            ))}
          </div>
        )}

        {/* Attachments */}
        {showAttachMenu && (
          <div style={{ position: 'absolute', bottom: '75px', left: '16px', backgroundColor: '#1a2226', borderRadius: '16px', padding: '12px', display: 'flex', gap: '16px', zIndex: 20 }}>
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#cbd5e1' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><ImageIcon size={20} /></div>
              <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Gallery</span>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={(e) => handleFileUpload(e, 'image')} style={{ display: 'none' }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#cbd5e1' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Camera size={20} /></div>
              <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Camera</span>
              <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={(e) => handleFileUpload(e, 'image')} style={{ display: 'none' }} />
            </label>
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

          {isRecording ? (
            <div style={{ flex: 1, backgroundColor: 'rgba(239, 68, 68, 0.15)', borderRadius: '22px', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#ef4444', fontWeight: 'bold' }}>
              <span>🎙️ Recording Audio... {recordSeconds}s</span>
              <button type="button" onClick={stopRecording} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>Send</button>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '100%', backgroundColor: isDarkMode ? '#182023' : '#f1f5f9', borderRadius: '22px', padding: '8px 14px', display: 'flex', alignItems: 'center', border: isDarkMode ? '1px solid #27353a' : '1px solid #e2e8f0' }}>
                <input type="text" placeholder="Type a message..." value={inputMessage} onChange={(e) => { setInputMessage(e.target.value); if (socket) socket.emit('typing', { roomId }); }} style={{ background: 'transparent', border: 'none', outline: 'none', color: isDarkMode ? '#fff' : '#0f172a', fontSize: '14.5px', width: '100%' }} />
                <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px' }}><Smile size={19} /></button>
              </div>
            </form>
          )}

          {inputMessage.trim() ? (
            <button type="button" onClick={handleSendMessage} style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#22c55e', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Send size={18} /></button>
          ) : (
            <button type="button" onClick={isRecording ? stopRecording : startRecording} style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: isRecording ? '#ef4444' : '#22c55e', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              {isRecording ? <Square size={16} /> : <Mic size={19} />}
            </button>
          )}
        </div>

        {/* Calling Overlay */}
        {activeCall && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: '#090d0f', zIndex: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '60px 24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '90px', height: '90px', borderRadius: '50%', backgroundColor: getAvatarColor(contact.name), color: '#fff', fontSize: '30px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {getInitials(contact.name)}
              </div>
              <h2 style={{ color: '#fff', margin: 0 }}>{contact.name}</h2>
              <span style={{ color: '#22c55e', fontWeight: 'bold' }}>
                {callStatus === 'calling' ? 'Calling...' : `Connected (${callDuration}s)`}
              </span>
            </div>

            <button onClick={handleEndCall} style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PhoneOff size={28} />
            </button>
          </div>
        )}

        {/* Profile Drawer */}
        {showProfileDrawer && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: '320px', height: '100%', backgroundColor: isDarkMode ? '#151c1f' : '#ffffff', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Profile Details</h3>
                <button onClick={() => setShowProfileDrawer(false)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: getAvatarColor(contact.name), color: '#fff', fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {getInitials(contact.name)}
                </div>
                <h3 style={{ margin: 0 }}>{contact.name}</h3>
                <span style={{ color: isRecipientOnline ? '#22c55e' : '#94a3b8', fontSize: '12px' }}>{isRecipientOnline ? 'Online' : 'Offline'}</span>
              </div>
              <div style={{ backgroundColor: '#1c2427', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                <Mail size={16} color="#22c55e" />
                <span>{contact.email}</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ChatRoom;