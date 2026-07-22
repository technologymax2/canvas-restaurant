import React, { useState, useEffect, useCallback } from 'react';
import './Footer.css';

function OurFoods({ API_BASE_URL, addToCart }) {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 🔄 ዋና ዋና ምግቦችን ከሰርቨር ማምጫ
  const fetchOurFoods = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/foods`);
      const data = await res.json();
      if (data.success) {
        setFoods(data.foods || data.menu || []);
      } else {
        setError('ምግቦቹን ማምጣት አልተቻለም');
      }
    } catch (err) {
      setError('የሰርቨር ስህተት አጋጥሟል');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchOurFoods();
  }, [fetchOurFoods]);

  return (
    <div className="our-foods-container" style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto', color: '#fff' }}>
      <h2>🍽️ የእኛ ልዩ ምግቦች (Our Special Foods)</h2>
      <p style={{ color: '#8b949e', marginBottom: '20px' }}>
        በሬስቶራንታችን በተለዩ ባለሙያዎች የተዘጋጁ ምርጥ ምግቦችን ይጎብኙ።
      </p>

      {loading ? (
        <p>በመጫን ላይ...</p>
      ) : error ? (
        <p style={{ color: '#ff4444' }}>{error}</p>
      ) : foods.length === 0 ? (
        <p>ምንም ምግቦች አልተገኙም።</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
          {foods.map((food) => (
            <div key={food._id || food.id} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                {food.imageUrl && (
                  <img src={food.imageUrl} alt={food.name} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '6px', marginBottom: '10px' }} />
                )}
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{food.name}</h3>
                <p style={{ color: '#8b949e', fontSize: '14px', marginBottom: '10px' }}>{food.description}</p>
                <p style={{ color: '#2ecc71', fontWeight: 'bold', fontSize: '16px' }}>ብር {food.price}</p>
              </div>

              <button 
                onClick={() => {
                  if (addToCart) {
                    addToCart(food);
                    alert(`✅ ${food.name} ወደ ካርት ተጨምሯል!`);
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

export default OurFoods;
