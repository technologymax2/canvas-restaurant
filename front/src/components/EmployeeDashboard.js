import React, { useState, useEffect, useCallback } from 'react';
import './AdminDashboard.css';

function EmployeeDashboard({ user, handleLogout, API_BASE_URL }) {
  const [messages, setMessages] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🍲 የምግብ ፎርም ስቴት (ለማስገባት እና ለማስተካከል)
  const [foodForm, setFoodForm] = useState({
    name: '',
    description: '',
    price: ''
  });
  const [foodImage, setFoodImage] = useState(null);
  const [foodStatus, setFoodStatus] = useState('');
  
  // ✏️ ኤዲት የሚደረግ የምግብ ഐዲ (ካለ)
  const [editingFoodId, setEditingFoodId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      // መልዕክቶችን እና ምግቦችን በአንድ ላይ ማምጣት
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
    setFoodForm({
      ...foodForm,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFoodImage(e.target.files[0]);
    }
  };

  // ➕/✏️ ምግብ መመዝገቢያ ወይም ማስተካከያ (Create & Update)
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
      if (foodImage) {
        formData.append('image', foodImage);
      }

      const url = editingFoodId 
        ? `${API_BASE_URL}/api/employee/foods/${editingFoodId}` 
        : `${API_BASE_URL}/api/foods`;
      
      const method = editingFoodId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        body: formData
      });
      const data = await res.json();

      if (res.ok || data.success) {
        setFoodStatus(editingFoodId ? '✅ ምግብ በተሳካ ሁኔታ ተስተካክሏል!' : '✅ ምግብ በተሳካ ሁኔታ ተጨምሯል!');
        setFoodForm({ name: '', description: '', price: '' });
        setFoodImage(null);
        setEditingFoodId(null);
        const fileInput = document.getElementById('food-image-input');
        if (fileInput) fileInput.value = '';
        fetchData();
      } else {
        setFoodStatus(data.error || '❌ ክንውኑ አልተሳካም');
      }
    } catch (err) {
      setFoodStatus('❌ የሰርቨር ስህተት አጋጥሟል');
    }
  };

  // ✏️ ኤዲት ለማድረግ ፎርሙ ላይ መረጃዎችን መሙላት
  const handleEditClick = (food) => {
    setEditingFoodId(food._id);
    setFoodForm({
      name: food.name,
      description: food.description,
      price: food.price
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 🗑️ ምግብ ማጥፊያ (Delete)
  const handleDeleteFood = async (id) => {
    if (!window.confirm('ይህንን ምግብ ማጥፋት ይፈልጋሉ?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/employee/foods/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok || data.success) {
        alert('✅ ምግብ ተሰርዟል!');
        fetchData();
      } else {
        alert('❌ ማጥፋት አልተቻለም');
      }
    } catch (err) {
      alert('❌ የሰርቨር ስህተት');
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

      {/* 🍲 ምግብ መመዝገቢያ/ማስተካከያ ፎርም */}
      <div className="card" style={{ background: '#161b22', padding: '20px', borderRadius: '8px', border: '1px solid #30363d', marginBottom: '30px' }}>
        <h3>{editingFoodId ? '✏️ የምግብ መረጃ አስተካክል' : '➕ አዲስ የምግብ ምናሌ ጨምር'}</h3>
        <form onSubmit={handleFoodSubmit} style={{ display: 'grid', gap: '12px', marginTop: '15px' }}>
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
            <label style={{ display: 'block', marginBottom: '5px' }}>
              የምግብ ምስል (Image): {editingFoodId && '(አዲስ ካልመረጡ የቀድሞው ይቀጥላል)'}
            </label>
            <input 
              id="food-image-input" 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              required={!editingFoodId} 
              style={{ width: '100%', padding: '8px', background: '#21262d', border: '1px solid #30363d', color: '#fff', borderRadius: '4px' }} 
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="submit" 
              style={{ background: '#238636', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {editingFoodId ? 'ለውጦችን መዝግብ' : 'ምግብ ጨምር'}
            </button>
            {editingFoodId && (
              <button 
                type="button" 
                onClick={() => { setEditingFoodId(null); setFoodForm({ name: '', description: '', price: '' }); }} 
                style={{ background: '#666', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}
              >
                ሰርዝ (Cancel)
              </button>
            )}
          </div>
        </form>
        {foodStatus && <p style={{ marginTop: '10px', fontWeight: 'bold' }}>{foodStatus}</p>}
      </div>

      {/* 📋 የምግቦች ዝርዝር (ማስተካከያ እና ማጥፊያ ቁልፎች ያሉት) */}
      <div className="card" style={{ background: '#161b22', padding: '20px', borderRadius: '8px', border: '1px solid #30363d', marginBottom: '30px' }}>
        <h3>📋 የምግብ ምናሌዎች ዝርዝር (Manage Foods)</h3>
        <div style={{ display: 'grid', gap: '10px', marginTop: '15px' }}>
          {foods.map((food) => (
            <div key={food._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#21262d', padding: '10px 15px', borderRadius: '6px', border: '1px solid #30363d' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                {food.imageUrl && <img src={food.imageUrl} alt={food.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />}
                <div>
                  <h4>{food.name} - <span style={{ color: '#2ecc71' }}>ብር {food.price}</span></h4>
                  <p style={{ fontSize: '13px', color: '#8b949e' }}>{food.description}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => handleEditClick(food)} style={{ background: '#f39c12', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>✏️ አስተካክል</button>
                <button onClick={() => handleDeleteFood(food._id)} style={{ background: '#ff4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>🗑️ አጥፉ</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 📦 የደንበኞች ትዕዛዞች ሴክሽን */}
      <div className="card" style={{ background: '#161b22', padding: '20px', borderRadius: '8px', border: '1px solid #30363d' }}>
        <h3>📦 የደንበኞች ትዕዛዞች እና ጥያቄዎች</h3>
        {loading ? <p>በመጫን ላይ...</p> : messages.length === 0 ? <p>ምንም አዲስ መልዕክት የለም።</p> : (
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
