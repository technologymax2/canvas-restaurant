import React, { useState, useEffect, useCallback } from 'react';
import './Footer.css';

function FoodMenu({ API_BASE_URL, cart = [], addToCart, decreaseQuantity }) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // የየምግቡን ማስታወሻ (Comment/Note) ለመያዝ
  const [itemNotes, setItemNotes] = useState({});

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

  const getCartItem = (itemId) => {
    return cart.find(item => (item._id || item.id) === itemId);
  };

  const handleNoteChange = (itemId, text) => {
    setItemNotes(prev => ({ ...prev, [itemId]: text }));
  };

  return (
    <div className="food-menu-container" style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto', color: '#fff' }}>
      <h2>🍲 የሬስቶራንታችን የምግብ ምናሌ (Food Menu)</h2>
      <p style={{ color: '#8b949e', marginBottom: '20px' }}>
        የሚወዷቸውን ምግቦች በመምረጥ፣ ኢሞጂዎችን ወይም ማስታወሻዎችን (Comments) አክለው ወደ ካርት ማስተላለፍ ይችላሉ።
      </p>

      {loading ? (
        <p>በመጫን ላይ...</p>
      ) : error ? (
        <p style={{ color: '#ff4444' }}>{error}</p>
      ) : menuItems.length === 0 ? (
        <p>ምንም ምግቦች አልተገኙም።</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
          {menuItems.map((item) => {
            const itemId = item._id || item.id;
            const cartItem = getCartItem(itemId);
            const quantity = cartItem ? cartItem.quantity || 1 : 0;

            return (
              <div key={itemId} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '6px', marginBottom: '10px' }} />
                  )}
                  <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{item.name}</h3>
                  <p style={{ color: '#8b949e', fontSize: '14px', marginBottom: '10px' }}>{item.description}</p>
                  <p style={{ color: '#2ecc71', fontWeight: 'bold', fontSize: '16px' }}>ብር {item.price}</p>

                  {/* ✍️ ማስታወሻ ወይም ኢሞጂ ማስገቢያ (Comment/Note Input) */}
                  <div style={{ marginTop: '12px' }}>
                    <input 
                      type="text"
                      placeholder="ማስታወሻ ወይም ኢሞጂ ✍️ (ለምሳሌ: ሞቅ ያለ ይሁን 😋)"
                      value={itemNotes[itemId] || ''}
                      onChange={(e) => handleNoteChange(itemId, e.target.value)}
                      style={{ width: '100%', padding: '8px', background: '#0d1117', border: '1px solid #30363d', color: '#fff', borderRadius: '4px', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '15px' }}>
                  {quantity === 0 ? (
                    <button 
                      onClick={() => {
                        if (addToCart) {
                          // ማስታወሻውን ጨምሮ ወደ ካርት እንልካለን
                          const note = itemNotes[itemId] || '';
                          addToCart({ ...item, note });
                        }
                      }}
                      style={{ width: '100%', background: '#238636', color: '#fff', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      🛒 ወደ ካርት ጨምር
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#21262d', padding: '8px', borderRadius: '5px', border: '1px solid #30363d' }}>
                      <button 
                        onClick={() => {
                          if (decreaseQuantity) decreaseQuantity(itemId);
                        }}
                        style={{ background: '#da3633', color: '#fff', border: 'none', width: '32px', height: '32px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
                      >
                        -
                      </button>
                      <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
                        {quantity} በካርት ውስጥ
                      </span>
                      <button 
                        onClick={() => {
                          if (addToCart) addToCart(item);
                        }}
                        style={{ background: '#238636', color: '#fff', border: 'none', width: '32px', height: '32px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
                      >
                        +
                      </button>
                    </div>
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

export default FoodMenu;
