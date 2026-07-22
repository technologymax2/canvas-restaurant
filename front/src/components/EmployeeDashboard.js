import React, { useState, useEffect } from 'react';
import './AdminDashboard.css'; // ከስታይል አቀማመጥ አንፃር ተመሳሳይ እንዲሆን

function EmployeeDashboard({ user, handleLogout, API_BASE_URL }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔄 የደንበኞችን መልዕክቶች እና ትዕዛዞች ከሰርቨር ማምጫ
  const fetchEmployeeMessages = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/messages`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('መልዕክቶችን ማምጣት አልተቻለም');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeMessages();
    const interval = setInterval(fetchEmployeeMessages, 5000); // በየ 5 ሰከንዱ ማደሻ
    return () => clearInterval(interval);
  }, [API_BASE_URL]);

  // ✉️ ለደንበኛ ምላሽ ለመስጠት (አስፈላጊ ሆኖ ሲገኝ)
  const handleReply = async (msgId, replyText) => {
    if (!replyText || !replyText.trim()) return alert('እባክዎ ምላሽ ይጻፉ!');

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/reply/${msgId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: replyText })
      });
      const data = await res.json();
      if (data.success) {
        alert('ምላሽ ተልኳል!');
        fetchEmployeeMessages();
      }
    } catch (err) {
      alert('ምላሽ መላክ አልተቻለም');
    }
  };

  return (
    <div className="admin-dashboard-container" style={{ padding: '20px', color: '#fff' }}>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>👨‍🍳 የሰራተኛ መቆጣጠሪያ ሰሌዳ (Employee Dashboard)</h2>
        <div>
          <span style={{ marginRight: '15px', color: '#8b949e' }}>እንኳን ደህና መጡ፣ {user?.name}</span>
          <button onClick={handleLogout} className="btn-logout" style={{ background: '#ff4444', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>
            ውጣ (Logout)
          </button>
        </div>
      </div>

      <div className="card" style={{ background: '#161b22', padding: '20px', borderRadius: '8px', border: '1px solid #30363d' }}>
        <h3>📦 የደንበኞች ትዕዛዞች እና ጥያቄዎች</h3>
        
        {loading ? (
          <p>በመጫን ላይ...</p>
        ) : messages.length === 0 ? (
          <p>ምንም አዲስ መልዕክት የለም።</p>
        ) : (
          <div style={{ display: 'grid', gap: '15px', marginTop: '15px' }}>
            {messages.map((msg) => (
              <div key={msg._id} style={{ background: '#21262d', padding: '15px', borderRadius: '6px', border: '1px solid #30363d' }}>
                <p><strong>ከ:</strong> {msg.name} ({msg.email})</p>
                <p><strong>መልዕክት:</strong> {msg.message}</p>
                <p><strong>ሁኔታ:</strong> <span style={{ color: msg.reply ? '#2ecc71' : '#f1c40f' }}>{msg.reply ? 'ምላሽ ተሰጥቷል' : 'በመጠባበቅ ላይ'}</span></p>
                
                {msg.reply && (
                  <div style={{ background: '#161b22', padding: '10px', marginTop: '10px', borderRadius: '4px' }}>
                    <p style={{ color: '#2ecc71' }}><strong>የተሰጠ ምላሽ:</strong> {msg.reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployeeDashboard;
