import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome.jsx';
import Auth from './pages/Auth.jsx';
import Inbox from './pages/Inbox.jsx';
import ChatRoom from './pages/ChatRoom.jsx';
import Settings from './pages/Settings.jsx';
import Teams from './pages/Teams.jsx';
import Calls from './pages/Calls.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/inbox" element={<Inbox />} />
      <Route path="/chat/:id" element={<ChatRoom />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/teams" element={<Teams />} />
      <Route path="/calls" element={<Calls />} />
    </Routes>
  );
}

export default App;