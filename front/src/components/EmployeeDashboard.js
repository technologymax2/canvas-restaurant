import React, { useEffect, useState } from 'react';

function EmployeeDashboard({ user, handleLogout, API_BASE_URL }) {
  const [pendingOrders, setPendingOrders] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/orders/pending`)
      .then(res => res.json())
      .then(data => setPendingOrders(data))
      .catch(err => console.error("Error fetching orders:", err));
  }, [API_BASE_URL]);

  const approveOrder = async (orderId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/approve/${orderId}`, { method: 'PUT' });
      if (res.ok) {
        setPendingOrders(prev => prev.filter(order => order._id !== orderId));
        alert("ትዕዛዙ ተፈቅዷል!");
      }
    } catch (err) {
      alert("ማጽደቅ አልተቻለም");
    }
  };

  return (
    <div className="employee-dashboard-container">
      <div className="admin-header">
        <h2>👨‍🍳 የሰራተኛ መቆጣጠሪያ (Staff Dashboard)</h2>
        <button onClick={handleLogout} className="btn-logout">ውጣ (Logout)</button>
      </div>

      <div className="card">
        <h3>📦 Pending Orders ({pendingOrders.length})</h3>
        {pendingOrders.length === 0 ? <p>ምንም አዲስ ማዘዣ የለም።</p> : (
          pendingOrders.map(order => (
            <div key={order._id} className="admin-chat-block">
              <p><strong>ደንበኛ:</strong> {order.userName}</p>
              <p><strong>ዕቃዎች:</strong> {order.items.map(i => i.title).join(', ')}</p>
              <button onClick={() => approveOrder(order._id)} className="btn-action">
                ✅ አጽድቅ
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default EmployeeDashboard;
