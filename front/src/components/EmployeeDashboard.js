import React, { useEffect, useState } from 'react';

function EmployeeDashboard() {
  const [pendingOrders, setPendingOrders] = useState([]);

  useEffect(() => {
    // Fetch only pending orders from your API
    fetch('https://canvas-restaurant.onrender.com/api/orders/pending')
      .then((res) => res.json())
      .then((data) => setPendingOrders(data))
      .catch((err) => console.error("Error fetching orders", err));
  }, []);

  const approveOrder = (orderId) => {
    fetch(`https://canvas-restaurant.onrender.com/api/orders/approve/${orderId}`, {
      method: 'PUT',
    })
    .then(() => {
      // Remove approved order from the UI
      setPendingOrders(pendingOrders.filter(order => order._id !== orderId));
      alert("ትዕዛዙ ተፈቅዷል! (Order approved!)");
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">የሰራተኛ ዳሽቦርድ (Pending Orders)</h2>
      <div className="space-y-4">
        {pendingOrders.map((order) => (
          <div key={order._id} className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
            <h3 className="font-bold text-lg">ትዕዛዝ ቁጥር: {order._id}</h3>
            <p className="text-gray-600">ዕቃዎች: {order.items.map(i => i.title).join(', ')}</p>
            <button 
              onClick={() => approveOrder(order._id)}
              className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              አጽድቅ (Approve)
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EmployeeDashboard;
