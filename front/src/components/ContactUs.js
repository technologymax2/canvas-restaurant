import React, { useState } from 'react';
import './Footer.css';

function ContactUs({ user, API_BASE_URL, fetchMessages }) {
  const [formData, setFormData] = useState({
    name: user ? user.name : '',
    email: user ? user.email : '',
    message: ''
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.message.trim()) {
      return alert('እባክዎ የመልዕክትዎን ሃሳብ ይጻፉ!');
    }

    setLoading(true);
    setStatus('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok || data.success) {
        setStatus('✅ መልዕክትዎ በተሳካ ሁኔታ ተልኳል! እናመሰግናለን።');
        setFormData(prev => ({ ...prev, message: '' }));
        if (fetchMessages) fetchMessages();
      } else {
        setStatus(data.error || '❌ መልዕክቱን መላክ አልተቻለም።');
      }
    } catch (err) {
      setStatus('❌ የሰርቨር ስህተት አጋጥሟል።');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-container" style={{ padding: '30px', maxWidth: '600px', margin: '0 auto', color: '#fff' }}>
      <h2>📞 እኛን ያግኙን (Contact Us)</h2>
      <p style={{ color: '#8b949e', marginBottom: '20px' }}>
        ማንኛውም ጥያቄ፣ አስተያየት ወይም ትዕዛዝ ካለዎት ከታች ባለው ፎርም በመጠቀም ይጻፉልን።
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>ስምዎ:</label>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
            style={{ width: '100%', padding: '10px', background: '#161b22', border: '1px solid #30363d', color: '#fff', borderRadius: '5px' }} 
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>ኢሜይልዎ:</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            required 
            style={{ width: '100%', padding: '10px', background: '#161b22', border: '1px solid #30363d', color: '#fff', borderRadius: '5px' }} 
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>መልዕክትዎ:</label>
          <textarea 
            name="message" 
            rows="5" 
            value={formData.message} 
            onChange={handleChange} 
            required 
            placeholder="ሐሳብዎን እዚህ ይጻፉ..."
            style={{ width: '100%', padding: '10px', background: '#161b22', border: '1px solid #30363d', color: '#fff', borderRadius: '5px', resize: 'vertical' }} 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ background: '#238636', color: '#fff', border: 'none', padding: '12px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {loading ? 'በመላክ ላይ...' : 'መልዕክት ላክ'}
        </button>
      </form>

      {status && (
        <p style={{ marginTop: '15px', textAlign: 'center', fontWeight: 'bold' }}>
          {status}
        </p>
      )}
    </div>
  );
}

export default ContactUs;
