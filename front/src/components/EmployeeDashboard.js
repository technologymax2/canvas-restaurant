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

  // 🟢 ትዕዛዝ ማጽደቂያ፣ ማጠናቀቂያ ወይም መሰረፊያ
  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/messages/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: status, // 'Approved', 'Completed', ወይም 'Cancelled'
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
    <div style={{ padding: '30px', color: '#fff', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      
      {/* 🌟 ሄደር (Header) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', background: '#161b22', padding: '20px', borderRadius: '12px', border: '1px solid #30363d', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
        <h2 style={{ margin: 0, fontSize: '22px', color: '#58a6ff' }}>👨‍🍳 የሰራተኛ መቆጣጠሪያ ሰሌዳ (Employee Dashboard)</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ color: '#8b949e', fontSize: '15px' }}>እንኳን ደህና መጡ፣ <strong style={{ color: '#fff' }}>{user?.name}</strong></span>
          <button onClick={handleLogout} style={{ background: '#da3633', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            ውጣ (Logout)
          </button>
        </div>
      </div>

      {/* 🍲 ምግብ መመዝገቢያ ፎርም */}
      <div style={{ background: '#161b22', padding: '25px', borderRadius: '12px', border: '1px solid #30363d', marginBottom: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
        <h3 style={{ marginBottom: '15px', color: '#58a6ff' }}>{editingFoodId ? '✏️ የምግብ መረጃ አስተካክል' : '➕ አዲስ የምግብ ምናሌ ጨምር'}</h3>
        <form onSubmit={handleFoodSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#8b949e' }}>የምግቡ ስም:</label>
            <input type="text" name="name" value={foodForm.name} onChange={handleFoodChange} required style={{ width: '100%', padding: '10px', background: '#0d1117', border: '1px solid #30363d', color: '#fff', borderRadius: '6px' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#8b949e' }}>መግለጫ (Description):</label>
            <input type="text" name="description" value={foodForm.description} onChange={handleFoodChange} required style={{ width: '100%', padding: '10px', background: '#0d1117', border: '1px solid #30363d', color: '#fff', borderRadius: '6px' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#8b949e' }}>ዋጋ (ብር):</label>
            <input type="number" name="price" value={foodForm.price} onChange={handleFoodChange} required style={{ width: '100%', padding: '10px', background: '#0d1117', border: '1px solid #30363d', color: '#fff', borderRadius: '6px' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#8b949e' }}>ምስል (Image):</label>
            <input type="file" accept="image/*" onChange={handleImageChange} required={!editingFoodId} style={{ width: '100%', padding: '8px', background: '#0d1117', border: '1px solid #30363d', color: '#fff', borderRadius: '6px' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" style={{ background: '#238636', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>
              {editingFoodId ? 'አስተካክል' : 'ጨምር'}
            </button>
            {editingFoodId && (
              <button type="button" onClick={() => { setEditingFoodId(null); setFoodForm({ name: '', description: '', price: '' }); }} style={{ background: '#6e7681', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer' }}>
                ሰርዝ
              </button>
            )}
          </div>
        </form>
        {foodStatus && <p style={{ marginTop: '12px', fontWeight: 'bold', color: '#2ecc71' }}>{foodStatus}</p>}
      </div>

      {/* 📋 የምግቦች ዝርዝር */}
      <div style={{ background: '#161b22', padding: '25px', borderRadius: '12px', border: '1px solid #30363d', marginBottom: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
        <h3 style={{ marginBottom: '15px', color: '#58a6ff' }}>📋 የምግብ ምናሌዎች ዝርዝር</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
          {foods.map((food) => (
            <div key={food._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0d1117', padding: '12px', borderRadius: '8px', border: '1px solid #30363d' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {food.imageUrl && <img src={food.imageUrl} alt={food.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} />}
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '15px' }}>{food.name}</h4>
                  <p style={{ margin: 0, color: '#2ecc71', fontWeight: 'bold', fontSize: '14px' }}>ብር {food.price}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => handleEditClick(food)} style={{ background: '#d29922', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✏️</button>
                <button onClick={() => handleDeleteFood(food._id)} style={{ background: '#da3633', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 📦 የደንበኞች ትዕዛዞች፣ የምግብ ዝርዝሮች እና የክፍያ ስክሪንሾት ማሳያ */}
      <div style={{ background: '#161b22', padding: '25px', borderRadius: '12px', border: '1px solid #30363d', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
        <h3 style={{ marginBottom: '20px', color: '#58a6ff' }}>📦 የደንበኞች ትዕዛዞች እና የክፍያ ማረጋገጫዎች</h3>
        {loading ? <p>በመጫን ላይ...</p> : messages.length === 0 ? <p style={{ color: '#8b949e' }}>ምንም ትዕዛዝ የለም።</p> : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {messages.map((msg) => {
              // 🖼️ ከሜሴጅ ጽሁፍ ውስጥ የክፍያ ስክሪንሾት ዩአርኤል (URL) በራስ ሰር ማውጣት
              let extractedScreenshotUrl = msg.paymentScreenshotUrl || '';
              if (!extractedScreenshotUrl && msg.message && msg.message.includes('የክፍያ ስክሪንሾት:')) {
                const parts = msg.message.split('የክፍያ ስክሪንሾት:');
                if (parts[1]) {
                  extractedScreenshotUrl = parts[1].trim().split(' ')[0];
                }
              }

              return (
                <div key={msg._id} style={{ background: '#0d1117', padding: '20px', borderRadius: '8px', border: '1px solid #30363d', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '16px', color: '#58a6ff' }}>ደንበኛ: {msg.name} ({msg.email})</p>
                    <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', background: msg.status === 'Approved' ? '#238636' : msg.status === 'Completed' ? '#1f6feb' : msg.status === 'Cancelled' ? '#da3633' : '#d29922', color: '#fff' }}>
                      {msg.status || 'በጥበቃ ላይ'}
                    </span>
                  </div>

                  <p style={{ margin: '5px 0', fontSize: '14px', color: '#8b949e' }}>ሙሉ መረጃ / መልዕክት: <strong style={{ color: '#fff' }}>{msg.message}</strong></p>

                  {/* 🖼️ የክፍያ ስክሪንሾት ምስል በቀጥታ ማሳያ */}
                  {extractedScreenshotUrl && (
                    <div style={{ margin: '15px 0', padding: '12px', background: '#161b22', borderRadius: '8px', border: '1px solid #30363d', display: 'inline-block' }}>
                      <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#58a6ff', fontWeight: 'bold' }}>🖼️ የክፍያ ማረጋገጫ ስክሪንሾት:</p>
                      <a href={extractedScreenshotUrl} target="_blank" rel="noopener noreferrer">
                        <img 
                          src={extractedScreenshotUrl} 
                          alt="Payment Screenshot" 
                          style={{ maxWidth: '220px', maxHeight: '220px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #30363d', display: 'block' }} 
                        />
                      </a>
                      <a href={extractedScreenshotUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '8px', color: '#58a6ff', fontSize: '12px', textDecoration: 'underline' }}>
                        ምስሉን በትልቅ መጠን ይክፈቱ (Open Full Image)
                      </a>
                    </div>
                  )}

                  {/* ✍️ ማን እንደገመገመው የሚያሳይ ጽሁፍ */}
                  {msg.handledBy && (
                    <p style={{ fontSize: '13px', color: '#8b949e', fontStyle: 'italic', margin: '8px 0' }}>
                      ይህንን ትዕዛዝ የገመገመው/ያስተካከለው ሰራተኛ: <strong style={{ color: '#58a6ff' }}>{msg.handledBy}</strong>
                    </p>
                  )}

                  {/* 🔘 Approve / Completed / Cancel አዝራሮች */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => handleUpdateOrderStatus(msg._id, 'Approved')}
                      style={{ background: '#238636', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                    >
                      ✅ አጽድቅ (Approve)
                    </button>
                    <button 
                      onClick={() => handleUpdateOrderStatus(msg._id, 'Completed')}
                      style={{ background: '#1f6feb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                    >
                      🎉 ጨርስ (Completed)
                    </button>
                    <button 
                      onClick={() => handleUpdateOrderStatus(msg._id, 'Cancelled')}
                      style={{ background: '#da3633', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
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
