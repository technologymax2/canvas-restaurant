import React, { useState, useEffect } from 'react';
import './Footer.css'; // ወይም የራሱ የስታይል ፋይል ካለው መቀየር ይቻላል

function Order({ user, API_BASE_URL }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // የደንበኛውን ትዕዛዞች ከሰርቨር ማምጫ
  const fetchUserOrders = async () => {
    if (!user || !user.email) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/user/orders/${user.email}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      } else {
        setError('ማዘዣዎችዎን ማምጣት አልተቻለም');
      }
    } catch (err) {
      setError('የሰርቨር ስህተት ገጥሟል');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
    const interval = setInterval(fetchUserOrders, 5000); // በየ 5 ሰከንዱ ማደሻ
    return () => clearInterval(interval);
  }, [user, API_BASE_URL]);

  if (!user) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#fff' }}>
        <h2>⚠️ እባክዎ ትዕዛዞችዎን ለማየት መጀመሪያ ይግቡ (Login)</h2>
      </div>
    );
  }

  return (
    <div className="order-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', color: '#fff' }}>
      <h2>📦 የእርስዎ ትዕዛዞች እና ምላሾች</h2>
      
      {loading ? (
        <p>በመጫን ላይ...</p>
      ) : error ? (
        <p style={{ color: '#ff4444' }}>{error}</p>
      ) : orders.length === 0 ? (
        <p>እስካሁን ያስቀመጡት ትዕዛዝ የለም።</p>
      ) : (
        <div className="orders-list" style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
          {orders.map((ord) => (
            <div key={ord._id} style={{ background: '#161b22', padding: '15px', borderRadius: '8px', border: '1px solid #30363d' }}>
              <p><strong>መልዕክትዎ/ትዕዛዝዎ:</strong> {ord.message}</p>
              <p><strong>ሁኔታ (Status):</strong> <span style={{ color: ord.status === 'ምላሽ ተሰጥቷል' ? '#2ecc71' : '#f1c40f' }}>{ord.status}</span></p>
              {ord.reply && (
                <div style={{ background: '#21262d', padding: '10px', marginTop: '10px', borderRadius: '5px', borderLeft: '4px solid #2ecc71' }}>
                  <p><strong>👑 የባለሙያ/የአድሚን ምላሽ:</strong> {ord.reply}</p>
                </div>
              )}
              <small style={{ color: '#8b949e', display: 'block', marginTop: '8px' }}>
                ቀን: {new Date(ord.date).toLocaleString()}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Order;
