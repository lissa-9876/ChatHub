import React, { useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';

const JoinChat = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const inviter = searchParams.get('inviter') || 'Friend';

  useEffect(() => {
    let myUser = localStorage.getItem('chathub_user');
    if (!myUser) {
      // Auto-assign random friend guest profile if not logged in
      const guestEmail = `friend_${Math.floor(1000 + Math.random() * 9000)}@chathub.com`;
      myUser = { name: 'Friend', email: guestEmail };
      localStorage.setItem('chathub_user', JSON.stringify(myUser));
    } else {
      myUser = JSON.parse(myUser);
    }

    // Save Inviter to my contacts list
    const myContactsKey = `chathub_contacts_${myUser.email}`;
    const existing = JSON.parse(localStorage.getItem(myContactsKey) || '[]');
    if (!existing.some(c => c.id === id)) {
      existing.unshift({
        id,
        name: inviter,
        email: `${inviter.toLowerCase().replace(/\s+/g, '')}@chathub.com`,
        lastMessage: 'Connected via invitation',
        time: 'Just now',
        unread: 0,
        online: true,
        isGroup: false
      });
      localStorage.setItem(myContactsKey, JSON.stringify(existing));
    }

    // Direct navigate to private ChatRoom
    navigate(`/chat/${id}`, { state: { contact: { id, name: inviter }, currentUser: myUser } });
  }, [id, inviter, navigate]);

  return <div style={{ color: '#fff', textAlign: 'center', padding: '50px' }}>Connecting to ChatHub...</div>;
};

export default JoinChat;