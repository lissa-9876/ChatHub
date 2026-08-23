import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  ArrowLeft, 
  Users, 
  Plus, 
  Hash, 
  Lock, 
  MessageSquare, 
  MoreVertical,
  CheckCircle2
} from 'lucide-react';

const mockTeams = [
  {
    id: 'team-1',
    name: 'Frontend Developers',
    description: 'React, Tailwind CSS & UI/UX discussions',
    membersCount: 8,
    isPrivate: false,
    activeRoom: 'frontend-room'
  },
  {
    id: 'team-2',
    name: 'Backend & APIs',
    description: 'Node.js, Express, WebSockets & Database architecture',
    membersCount: 5,
    isPrivate: false,
    activeRoom: 'backend-room'
  },
  {
    id: 'team-3',
    name: 'Core Project Lead',
    description: 'Sprint planning and project reviews',
    membersCount: 3,
    isPrivate: true,
    activeRoom: 'lead-room'
  }
];

const Teams = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [teams, setTeams] = useState(mockTeams);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');

  const handleCreateTeam = (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    const newTeam = {
      id: `team-${Date.now()}`,
      name: newTeamName,
      description: newTeamDesc || 'Team workspace channel',
      membersCount: 1,
      isPrivate: false,
      activeRoom: `custom-${Date.now()}`
    };

    setTeams([newTeam, ...teams]);
    setNewTeamName('');
    setNewTeamDesc('');
    setShowCreateModal(false);
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
            backgroundColor: isDarkMode ? '#12181a' : '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button 
              onClick={() => navigate('/inbox')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: isDarkMode ? '#ffffff' : '#0f172a', padding: '4px' }}
            >
              <ArrowLeft size={22} />
            </button>
            <h1 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>Teams & Channels</h1>
          </div>

          <button 
            onClick={() => setShowCreateModal(true)}
            style={{
              backgroundColor: '#22c55e',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '7px 12px',
              fontSize: '12px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Plus size={16} /> New Team
          </button>
        </div>

        {/* Teams List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {teams.map((team) => (
            <div 
              key={team.id}
              onClick={() => navigate(`/chat/${team.activeRoom}`)}
              style={{
                backgroundColor: isDarkMode ? '#182023' : '#f8fafc',
                border: isDarkMode ? '1px solid #27353a' : '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '16px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'transform 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', gap: '14px' }}>
                <div 
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(34, 197, 94, 0.15)',
                    color: '#22c55e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {team.isPrivate ? <Lock size={20} /> : <Hash size={22} />}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>{team.name}</h3>
                  </div>
                  <p style={{ margin: '4px 0 8px 0', fontSize: '13px', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                    {team.description}
                  </p>
                  <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Users size={13} /> {team.membersCount} active members
                  </span>
                </div>
              </div>

              <MessageSquare size={18} color={isDarkMode ? '#64748b' : '#94a3b8'} />
            </div>
          ))}
        </div>

        {/* Modal: Create Team */}
        {showCreateModal && (
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              zIndex: 30
            }}
          >
            <div 
              style={{
                width: '100%',
                maxWidth: '380px',
                backgroundColor: isDarkMode ? '#151c1f' : '#ffffff',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                border: isDarkMode ? '1px solid #27353a' : '1px solid #e2e8f0'
              }}
            >
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '800' }}>Create New Team</h3>
              <form onSubmit={handleCreateTeam} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <input 
                  type="text" 
                  placeholder="Team Name (e.g. Design Sync)" 
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  required
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: isDarkMode ? '1px solid #27353a' : '1px solid #cbd5e1',
                    backgroundColor: isDarkMode ? '#1c2427' : '#f8fafc',
                    color: isDarkMode ? '#ffffff' : '#0f172a',
                    outline: 'none',
                    fontSize: '14px'
                  }}
                />
                <textarea 
                  placeholder="Channel Description" 
                  value={newTeamDesc}
                  onChange={(e) => setNewTeamDesc(e.target.value)}
                  rows={3}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: isDarkMode ? '1px solid #27353a' : '1px solid #cbd5e1',
                    backgroundColor: isDarkMode ? '#1c2427' : '#f8fafc',
                    color: isDarkMode ? '#ffffff' : '#0f172a',
                    outline: 'none',
                    fontSize: '14px',
                    resize: 'none'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                  <button 
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    style={{ background: 'none', border: 'none', color: isDarkMode ? '#94a3b8' : '#64748b', cursor: 'pointer', fontWeight: '600', padding: '8px 14px' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    style={{ backgroundColor: '#22c55e', color: '#fff', border: 'none', borderRadius: '10px', padding: '8px 18px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Teams;