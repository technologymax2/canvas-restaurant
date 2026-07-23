import React, { useState, useEffect, useCallback } from 'react';
import './Order.css';

function Order({ user, API_BASE_URL }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUserOrders = useCallback(async () => {
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
  }, [user, API_BASE_URL]);

  useEffect(() => {
    fetchUserOrders();
    const interval = setInterval(fetchUserOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchUserOrders]);

  if (!user) {
    return (
      <div className="order-guest-container">
        <div className="order-guest-card">
          <h2>⚠️ እባክዎ ትዕዛዞችዎን ለማየት መጀመሪያ ይግቡ (Login)</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="order-container">
      <div className="order-header-box">
        <h2>📦 የእርስዎ ትዕዛዞች እና የክፍያ ታሪክ</h2>
        <p>የማዘዣዎትን ሁኔታ እና የሰራተኞችን ምላሽ እዚህ መከታተል ይችላሉ።</p>
      </div>

      {loading ? (
        <div className="order-loading">⏳ በመጫን ላይ...</div>
      ) : error ? (
        <div className="order-error">{error}</div>
      ) : orders.length === 0 ? (
        <div className="order-empty">
          <p>🛒 እስካሁን ያስቀመጡት ትዕዛዝ የለም።</p>
        </div>
      ) : (
        <div className="orders-grid">
          {orders.map((ord) => {
            // የስታተስ ቀለሞችን ለመወሰን
            let badgeClass = 'status-pending';
            if (ord.status === 'Approved') badgeClass = 'status-approved';
            else if (ord.status === 'Completed') badgeClass = 'status-completed';
            else if (ord.status === 'Cancelled') badgeClass = 'status-cancelled';
            else if (ord.status === 'ምላሽ ተሰጥቷል') badgeClass = 'status-replied';

            return (
              <div key={ord._id} className="order-card">
                <div className="order-card-header">
                  <span className="order-date">📅 {new Date(ord.date).toLocaleString()}</span>
                  <span className={`order-status-badge ${badgeClass}`}>
                    {ord.status || 'በጥበቃ ላይ'}
                  </span>
                </div>

                <div className="order-body">
                  <p className="order-message-text">
                    <strong>📝 ዝርዝር / መልዕክት:</strong> {ord.message}
                  </p>

                  {ord.reply && (
                    <div className="order-reply-box">
                      <p><strong>👑 የሰራተኛ/የአድሚን ምላሽ:</strong> {ord.reply}</p>
                    </div>
                  )}

                  {ord.handledBy && (
                    <p className="order-handled-by">
                      👨‍🍳 ያስተካከለው ሰራተኛ: <span>{ord.handledBy}</span>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Order;
