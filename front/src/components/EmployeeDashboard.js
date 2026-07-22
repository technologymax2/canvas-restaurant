import React, { useState, useEffect, useCallback } from 'react';
import './AdminDashboard.css';

function EmployeeDashboard({ user, handleLogout, API_BASE_URL }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🍲 ሰራተኛው አዲስ ምግብ የሚጨምርበት ፎርም ስቴት
  const [foodForm, setFoodForm] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: ''
  });
  const [foodStatus, setFoodStatus] = useState('');

  const fetchEmployeeMessages = useCallback(async () => {
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
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchEmployeeMessages();
    const interval = setInterval(fetchEmployeeMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchEmployeeMessages]);

  const handleFoodChange = (e) => {
    setFoodForm({
      ...foodForm,
      [e.target.name]: e.target.value
    });
  };

  // 🍳 ሰራተኛው አዲስ ምግብ ወደ ምናሌው የሚጨምርበት ሎጂክ
  const handleAddFoodSubmit = async (e) => {
    e.preventDefault();
    setFoodStatus('በመጨመር ላይ...');

    try {
      const res = await fetch(`${API_BASE_URL}/api/foods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(foodForm)
      });
      const data = await res.json();

      if (res.ok || data.success) {
        setFoodStatus('✅ ምግብ በተሳካ ሁኔታ ተጨምሯል!');
        setFoodForm({ name: '', description: '', price: '', imageUrl: '' });
      } else {
        setFoodStatus(data.error || '❌ ምግብ መሙላት አልተቻለም');
      }
    } catch (err) {
      setFoodStatus('❌ የሰርቨር ስህተት አጋጥሟል');
    }
  };

  return (
    <div className="admin-dashboard-container" style={{ padding: '20px', color: '#fff', maxWidth: '900px', margin: '0 auto' }}>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>👨‍🍳 የሰራተኛ መቆጣጠሪያ ሰሌዳ (Employee Dashboard)</h2>
        <div>
          <span style={{ marginRight: '15px', color: '#8b949e' }}>እንኳን ደህና መጡ፣ {user?.name}</span>
          <button onClick={handleLogout} className="btn-logout" style={{ background: '#ff4444', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>
            ውጣ (Logout)
          </button>
        </div>
      </div>

      {/* 🍲 ሰራተኛው የምግብ ምናሌ የሚጨምርበት ሴክሽን */}
      <div className="card" style={{ background: '#161b22', padding: '20px', borderRadius: '8px', border: '1px solid #30363d', marginBottom: '30px' }}>
        <h3>➕ አዲስ የምግብ ምናሌ (Food Menu) ጨምር</h3>
        <form onSubmit={handleAddFoodSubmit} style={{ display: 'grid', gap: '12px', marginTop: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>የምግቡ ስም:</label>
            <input 
              type="text" 
              name="name" 
              value={foodForm.name} 
              onChange={handleFoodChange} 
              required 
              style={{ width: '100%', padding: '8px', background: '#21262d', border: '1px solid #30363d', color: '#fff', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>መግለጫ (Description):</label>
            <input 
              type="text" 
              name="description" 
              value={foodForm.description} 
              onChange={handleFoodChange} 
              required 
              style={{ width: '100%', padding: '8px', background: '#21262d', border: '1px solid #30363d', color: '#fff', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>ዋጋ (Price በብር):</label>
            <input 
              type="number" 
              name="price" 
              value={foodForm.price} 
              onChange={handleFoodChange} 
              required 
              style={{ width: '100%', padding: '8px', background: '#21262d', border: '1px solid #30363d', color: '#fff', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>የምስል ሊንክ (Image URL):</label>
            <input 
              type="text" 
              name="imageUrl" 
              value={foodForm.imageUrl} 
              onChange={handleFoodChange} 
              required 
              style={{ width: '100%', padding: '8px', background: '#21262d', border: '1px solid #30363d', color: '#fff', borderRadius: '4px' }}
            />
          </div>

          <button 
            type="submit" 
            style={{ background: '#238636', color: '#fff', border: 'none', padding: '10px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            ምግብ ጨምር
          </button>
        </form>
        {foodStatus && <p style={{ marginTop: '10px', fontWeight: 'bold' }}>{foodStatus}</p>}
      </div>

      {/* 📦 የደንበኞች ትዕዛዞች ሴክሽን */}
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployeeDashboard;
