import { Routes, Route } from 'react-router-dom';
import Splash from './pages/Splash';
import Auth from './pages/Auth';
import Inbox from './pages/Inbox';
import ChatRoom from './pages/ChatRoom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/inbox" element={<Inbox />} />
      <Route path="/chat/:id" element={<ChatRoom />} />
    </Routes>
  );
}

export default App;