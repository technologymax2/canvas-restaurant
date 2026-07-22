import React, { useState, useEffect, useCallback } from 'react';
import './Footer.css';

function FoodMenu({ API_BASE_URL, addToCart }) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 🔄 ምግቦችን ከሰርቨር ማምጫ
  const fetchMenu = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/foods`);
      const data = await res.json();
      if (data.success) {
        setMenuItems(data.foods || data.menu || []);
      } else {
        setError('ምናሌዎችን ማምጣት አልተቻለም');
      }
    } catch (err) {
      setError('የሰርቨር ስህተት አጋጥሟል');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  return (
    <div className="food-menu-container" style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto', color: '#fff' }}>
      <h2>🍲 የሬስቶራንታችን የምግብ ምናሌ (Food Menu)</h2>
      <p style={{ color: '#8b949e', marginBottom: '20px' }}>
        የሚወዷቸውን ምግቦች በመምረጥ ወደ ካርትዎ (Cart) ማከል ይችላሉ።
      </p>

      {loading ? (
        <p>በመጫን ላይ...</p>
      ) : error ? (
        <p style={{ color: '#ff4444' }}>{error}</p>
      ) : menuItems.length === 0 ? (
        <p>ምንም ምግቦች አልተገኙም።</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
          {menuItems.map((item) => (
            <div key={item._id || item.id} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '6px', marginBottom: '10px' }} />
                )}
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{item.name}</h3>
                <p style={{ color: '#8b949e', fontSize: '14px', marginBottom: '10px' }}>{item.description}</p>
                <p style={{ color: '#2ecc71', fontWeight: 'bold', fontSize: '16px' }}>ብር {item.price}</p>
              </div>

              <button 
                onClick={() => {
                  if (addToCart) {
                    addToCart(item);
                    alert(`✅ ${item.name} ወደ ካርት ተጨምሯል!`);
                  } else {
                    alert('ካርት ማከያ ፋንክሽን አልተገናኘም');
                  }
                }}
                style={{ marginTop: '15px', background: '#238636', color: '#fff', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                🛒 ወደ ካርት ጨምር
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FoodMenu;
