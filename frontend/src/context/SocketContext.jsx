import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // 🔴 Cloudflare live URL ya local URL
    const SOCKET_URL = "https://gmc-employed-template-save.trycloudflare.com";

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    const user = JSON.parse(localStorage.getItem('chathub_user') || 'null');
    if (user?.email) {
      newSocket.emit('register_user', user.email);
    }

    // 🌟 GLOBAL LISTENER: Naye message ko room storage mein background save karna
    newSocket.on('global_unread_message', (data) => {
      if (data.roomId) {
        const roomKey = `chathub_msgs_${data.roomId}`;
        const existing = JSON.parse(localStorage.getItem(roomKey) || '[]');
        
        // Duplicate check taake message do dafa na add ho
        if (!existing.some(m => m.id === data.id)) {
          const formattedMsg = {
            id: data.id || Date.now(),
            roomId: data.roomId,
            sender: 'them',
            senderName: data.senderName,
            senderEmail: data.senderEmail,
            text: data.text,
            cipherText: data.cipherText,
            mediaUrl: data.mediaUrl,
            audioData: data.audioData,
            audioDuration: data.audioDuration,
            type: data.type || 'text',
            time: data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'delivered'
          };
          existing.push(formattedMsg);
          localStorage.setItem(roomKey, JSON.stringify(existing));
        }

        // Contact list ke last message ko update karna
        const userEmail = user?.email || '';
        const contactsKey = `chathub_contacts_${userEmail}`;
        const contacts = JSON.parse(localStorage.getItem(contactsKey) || '[]');
        const updatedContacts = contacts.map(c => {
          if (c.email === data.senderEmail || c.id === data.roomId) {
            return {
              ...c,
              lastMessage: data.type === 'voice' ? '🎙️ Voice Note' : (data.type === 'image' ? '📷 Photo' : data.text),
              time: data.time || 'Just now',
              unread: (c.unread || 0) + 1
            };
          }
          return c;
        });
        localStorage.setItem(contactsKey, JSON.stringify(updatedContacts));
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};