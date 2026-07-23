import React, { useState, useEffect, useCallback } from 'react';

function EmployeeDashboard({ user, handleLogout, API_BASE_URL }) {
  const [messages, setMessages] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [foodForm, setFoodForm] = useState({ name: '', description: '', price: '' });
  const [foodImage, setFoodImage] = useState(null);
  const [foodStatus, setFoodStatus] = useState('');
  const [editingFoodId, setEditingFoodId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [msgRes, foodRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/messages`),
        fetch(`${API_BASE_URL}/api/foods`)
      ]);
      const msgData = await msgRes.json();
      const foodData = await foodRes.json();

      if (msgData.success) setMessages(msgData.messages);
      if (foodData.success) setFoods(foodData.foods || foodData.menu || []);
    } catch (err) {
      console.error('መረጃዎችን ማምጣት አልተቻለም');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleFoodChange = (e) => {
    setFoodForm({ ...foodForm, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFoodImage(e.target.files[0]);
    }
  };

  const handleFoodSubmit = async (e) => {
    e.preventDefault();
    if (!editingFoodId && !foodImage) {
      return setFoodStatus('❌ እባክዎ የምግብ ምስል ይምረጡ!');
    }

    setFoodStatus(editingFoodId ? 'በማስተካከል ላይ...' : 'በመጨመር ላይ...');

    try {
      const formData = new FormData();
      formData.append('name', foodForm.name);
      formData.append('description', foodForm.description);
      formData.append('price', foodForm.price);
      if (foodImage) formData.append('image', foodImage);

      const url = editingFoodId 
        ? `${API_BASE_URL}/api/employee/foods/${editingFoodId}` 
        : `${API_BASE_URL}/api/foods`;
      const method = editingFoodId ? 'PUT' : 'POST';

      const res = await fetch(url, { method, body: formData });
      const data = await res.json();

      if (res.ok || data.success) {
        setFoodStatus(editingFoodId ? '✅ ምግብ ተስተካክሏል!' : '✅ ምግብ ተጨምሯል!');
        setFoodForm({ name: '', description: '', price: '' });
        setFoodImage(null);
        setEditingFoodId(null);
        fetchData();
      } else {
        setFoodStatus(data.error || '❌ አልተሳካም');
      }
    } catch (err) {
      setFoodStatus('❌ የሰርቨር ስህተት');
    }
  };

  const handleEditClick = (food) => {
    setEditingFoodId(food._id);
    setFoodForm({ name: food.name, description: food.description, price: food.price });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteFood = async (id) => {
    if (!window.confirm('ይህንን ምግብ ማጥፋት ይፈልጋሉ?')) return;
    try {
      await fetch(`${API_BASE_URL}/api/employee/foods/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      alert('ሰርቨር ስህተት አጋጥሟል');
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/messages/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: status, 
          handledBy: user?.name || 'Employee' 
        })
      });
      const data = await res.json();
      if (res.ok || data.success) {
        alert(`✅ ትዕዛዙ ተስተካክሏል: ${status}`);
        fetchData();
      } else {
        alert(data.error || 'ማስተካከል አልተቻለም');
      }
    } catch (err) {
      alert('የሰርቨር ስህተት አጋጥሟል');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-white font-sans">
      
      {/* 🌟 Header Section with Logout */}
      <div className="flex flex-wrap justify-between items-center bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl mb-8 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-blue-400">👨‍🍳 የሰራተኛ መቆጣጠሪያ ሰሌዳ (Employee Dashboard)</h2>
          <p className="text-gray-400 text-sm mt-1">እንኳን ደህና መጡ፣ <strong className="text-white">{user?.name}</strong></p>
        </div>
        <button 
          onClick={handleLogout} 
          className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl transition duration-200 shadow-lg text-sm"
        >
          🚪 ውጣ (Logout)
        </button>
      </div>

      {/* 🍲 ምግብ መመዝገቢያ ፎርም */}
      <div className="bg-gray-900 p-6 sm:p-8 rounded-2xl border border-gray-800 shadow-xl mb-8">
        <h3 className="text-lg font-semibold text-blue-400 mb-4">{editingFoodId ? '✏️ የምግብ መረጃ አስተካክል' : '➕ አዲስ የምግብ ምናሌ ጨምር'}</h3>
        <form onSubmit={handleFoodSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs text-gray-400 mb-1">የምግቡ ስም:</label>
            <input type="text" name="name" value={foodForm.name} onChange={handleFoodChange} required className="w-full p-3 bg-gray-950 border border-gray-800 rounded-xl text-white text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">መግለጫ (Description):</label>
            <input type="text" name="description" value={foodForm.description} onChange={handleFoodChange} required className="w-full p-3 bg-gray-950 border border-gray-800 rounded-xl text-white text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">ዋጋ (ብር):</label>
            <input type="number" name="price" value={foodForm.price} onChange={handleFoodChange} required className="w-full p-3 bg-gray-950 border border-gray-800 rounded-xl text-white text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">ምስል (Image):</label>
            <input type="file" accept="image/*" onChange={handleImageChange} required={!editingFoodId} className="w-full p-2 bg-gray-950 border border-gray-800 rounded-xl text-white text-xs file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white" />
          </div>
          <div className="sm:col-span-2 lg:col-span-4 flex gap-3 mt-2">
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition duration-200">
              {editingFoodId ? 'ምግቡን አስተካክል' : 'ምግቡን ጨምር'}
            </button>
            {editingFoodId && (
              <button type="button" onClick={() => { setEditingFoodId(null); setFoodForm({ name: '', description: '', price: '' }); }} className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-3 rounded-xl text-sm">
                ሰርዝ
              </button>
            )}
          </div>
        </form>
        {foodStatus && <p className="mt-4 font-semibold text-emerald-400 text-sm">{foodStatus}</p>}
      </div>

      {/* 📋 የምግቦች ዝርዝር */}
      <div className="bg-gray-900 p-6 sm:p-8 rounded-2xl border border-gray-800 shadow-xl mb-8">
        <h3 className="text-lg font-semibold text-blue-400 mb-4">📋 የምግብ ምናሌዎች ዝርዝር</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {foods.map((food) => (
            <div key={food._id} className="flex items-center justify-between bg-gray-950 p-4 rounded-xl border border-gray-800">
              <div className="flex items-center gap-3">
                {food.imageUrl && <img src={food.imageUrl} alt={food.name} className="w-12 h-12 object-cover rounded-lg border border-gray-800" />}
                <div>
                  <h4 className="font-semibold text-sm text-white">{food.name}</h4>
                  <p className="text-emerald-400 text-xs font-bold">ብር {food.price}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEditClick(food)} className="bg-amber-600 hover:bg-amber-700 text-white p-2 rounded-lg text-xs">✏️</button>
                <button onClick={() => handleDeleteFood(food._id)} className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg text-xs">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 📦 የደንበኞች ትዕዛዞች ክፍል */}
      <div className="bg-gray-900 p-6 sm:p-8 rounded-2xl border border-gray-800 shadow-xl">
        <h3 className="text-lg font-semibold text-blue-400 mb-6">📦 የደንበኞች ትዕዛዞች እና የክፍያ ማረጋገጫዎች</h3>
        {loading ? (
          <p className="text-gray-400 text-center py-8">በመጫን ላይ...</p>
        ) : messages.length === 0 ? (
          <p className="text-gray-400 text-center py-8">ምንም ትዕዛዝ የለም።</p>
        ) : (
          <div className="grid gap-6">
            {messages.map((msg, index) => {
              // 🔢 የትዕዛዝ ቁጥር (ቁጥር ብቻ እንዲሆን ከ _id ወይም ከ orderNumber በመውሰድ)
              const numericOrderNo = msg.orderNumber || `${index + 101}`;

              // 🖼️ የክፍያ ስክሪንሾት ዩአርኤል
              let extractedScreenshotUrl = msg.paymentScreenshotUrl || '';
              if (!extractedScreenshotUrl && msg.message && msg.message.includes('የክፍያ ስክሪንሾት:')) {
                const parts = msg.message.split('የክፍያ ስክሪንሾት:');
                if (parts[1]) {
                  extractedScreenshotUrl = parts[1].trim().split(' ')[0];
                }
              }

              let badgeStyle = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
              if (msg.status === 'Approved') badgeStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
              else if (msg.status === 'Completed') badgeStyle = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
              else if (msg.status === 'Cancelled') badgeStyle = 'bg-red-500/10 text-red-400 border-red-500/30';

              return (
                <div key={msg._id} className="bg-gray-950 p-6 rounded-2xl border border-gray-800 shadow-lg space-y-4">
                  
                  {/* 🔖 የትዕዛዝ ቁጥር እና ስታተስ */}
                  <div className="flex flex-wrap justify-between items-center pb-3 border-b border-gray-800 gap-2">
                    <div>
                      <span className="text-xs text-gray-400 block">የትዕዛዝ ቁጥር (Order Number):</span>
                      <span className="text-blue-400 font-extrabold text-lg">#{numericOrderNo}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badgeStyle}`}>
                      {msg.status || 'በጥበቃ ላይ'}
                    </span>
                  </div>

                  {/* 👤 የደንበኛ መረጃ */}
                  <div className="text-sm text-gray-300 flex flex-wrap justify-between gap-2">
                    <span>ደንበኛ: <strong className="text-white">{msg.name}</strong> ({msg.email})</span>
                    <span>ጠረጴዛ ቁጥር: <strong className="text-white">{msg.tableNumber || 'አልተገለጸም'}</strong></span>
                  </div>

                  {/* 🍲 የታዘዙ ምግቦች ዝርዝር እና ብዛት (በግልጽ የሚታይበት) */}
                  <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                    <strong className="text-gray-400 text-xs uppercase tracking-wider block mb-2">የታዘዙ ምግቦች እና ብዛት:</strong>
                    {msg.items ? (
                      <ul className="divide-y divide-gray-800/60">
                        {(() => {
                          try {
                            const parsedItems = typeof msg.items === 'string' ? JSON.parse(msg.items) : msg.items;
                            return parsedItems.map((item, idx) => (
                              <li key={idx} className="py-2 flex justify-between items-center text-sm">
                                <div>
                                  <span className="text-white font-bold">{item.name}</span>
                                  <span className="text-blue-400 text-xs ml-2 bg-blue-950 px-2 py-0.5 rounded-md border border-blue-800">ብዛት: {item.quantity || 1}</span>
                                </div>
                                <span className="text-emerald-400 font-semibold">ብር {item.price * (item.quantity || 1)}</span>
                              </li>
                            ));
                          } catch (e) {
                            return <p className="text-sm text-gray-300">{msg.message}</p>;
                          }
                        })()}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-300">{msg.message}</p>
                    )}
                    
                    {msg.totalAmount && (
                      <div className="mt-3 pt-2 border-t border-gray-800 flex justify-between items-center text-sm font-bold">
                        <span className="text-gray-300">አጠቃላይ የሚከፈል ዋጋ:</span>
                        <span className="text-emerald-400 text-base">ብር {msg.totalAmount}</span>
                      </div>
                    )}
                  </div>

                  {/* 🖼️ የክፍያ ስክሪንሾት ምስል ማሳያ */}
                  {extractedScreenshotUrl && (
                    <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 inline-block w-full sm:w-auto">
                      <p className="text-xs text-blue-400 font-semibold mb-2">🖼️ የክፍያ ማረጋገጫ ስክሪንሾት:</p>
                      <a href={extractedScreenshotUrl} target="_blank" rel="noopener noreferrer">
                        <img 
                          src={extractedScreenshotUrl} 
                          alt="Payment Screenshot" 
                          className="w-full sm:w-48 h-48 object-cover rounded-lg border border-gray-800 hover:opacity-95 transition-opacity" 
                        />
                      </a>
                      <a href={extractedScreenshotUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-blue-400 text-xs underline">
                        ምስሉን በትልቅ መጠን ይክፈቱ
                      </a>
                    </div>
                  )}

                  {msg.handledBy && (
                    <p className="text-xs text-gray-400 italic">
                      ማስተካከያ የሰጠበት ሰራተኛ: <span className="text-blue-400 font-semibold not-italic">{msg.handledBy}</span>
                    </p>
                  )}

                  {/* 🔘 Approve / Completed / Cancel አዝራሮች */}
                  <div className="flex gap-3 pt-2 flex-wrap">
                    <button 
                      onClick={() => handleUpdateOrderStatus(msg._id, 'Approved')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition duration-200"
                    >
                      ✅ አጽድቅ (Approve)
                    </button>
                    <button 
                      onClick={() => handleUpdateOrderStatus(msg._id, 'Completed')}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition duration-200"
                    >
                      🎉 ጨርስ (Completed)
                    </button>
                    <button 
                      onClick={() => handleUpdateOrderStatus(msg._id, 'Cancelled')}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition duration-200"
                    >
                      ❌ ሰርዝ (Cancel)
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

export default EmployeeDashboard;
