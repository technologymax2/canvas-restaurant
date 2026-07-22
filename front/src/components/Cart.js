import React from 'react';
import './Footer.css'; // ወይም የራሱ የስታይል ፋይል ካለው መቀየር ይቻላል

function Cart({ cartItems, setCartItems, navigateTo }) {
  
  // 🗑️ ከአቃፊ ውስጥ አንድን ምግብ መቀነሻ/ማጥፊያ
  const handleRemoveItem = (indexToRemove) => {
    setCartItems(prevItems => prevItems.filter((_, index) => index !== indexToRemove));
  };

  // 💰 አጠቃላይ ዋጋን ማስላት
  const totalAmount = cartItems.reduce((total, item) => total + (Number(item.price) || 0) * (item.quantity || 1), 0);

  return (
    <div className="cart-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', color: '#fff' }}>
      <h2>🛒 የእርስዎ የምግብ 🛒 ካርት (Shopping Cart)</h2>

      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <p>ካርትዎ ባዶ ነው። እባክዎ ከምናሌው ምግቦችን ይምረጡ!</p>
          {navigateTo && (
            <button 
              onClick={() => navigateTo('menu')} 
              style={{ marginTop: '15px', padding: '10px 20px', background: '#e67e22', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
              ምናሌዎችን ይመልከቱ
            </button>
          )}
        </div>
      ) : (
        <div>
          <div className="cart-items-list" style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
            {cartItems.map((item, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#161b22', padding: '15px', borderRadius: '8px', border: '1px solid #30363d' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                  )}
                  <div>
                    <h4>{item.name}</h4>
                    <p style={{ color: '#8b949e' }}>ዋጋ: ብር {item.price}</p>
                    <p style={{ color: '#8b949e' }}>ብዛት: {item.quantity || 1}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleRemoveItem(index)}
                  style={{ background: '#ff4444', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}
                >
                  🗑 አስወግድ
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '30px', padding: '20px', background: '#21262d', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>አጠቃላይ የሚከፈል: ብር {totalAmount.toFixed(2)}</h3>
            <button 
              onClick={() => alert('ትዕዛዝዎ ተልኳል! እናመሰግናለን።')}
              style={{ background: '#2ecc71', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ትዕዛዝ አረጋግጥ (Checkout)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
