import React, { useState } from 'react';
import './Footer.css';

function Cart({ cartItems, setCartItems, navigateTo, user, API_BASE_URL }) {
  const [paymentScreenshot, setPaymentScreenshot] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRemoveItem = (indexToRemove) => {
    setCartItems(prevItems => prevItems.filter((_, index) => index !== indexToRemove));
  };

  const totalAmount = cartItems.reduce((total, item) => total + (Number(item.price) || 0) * (item.quantity || 1), 0);

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (!user) {
      alert('እባክዎ ትዕዛዝ ከማስገባትዎ በፊት መጀመሪያ ይግቡ (Login)');
      navigateTo('login');
      return;
    }

    if (cartItems.length === 0) {
      alert('ካርትዎ ባዶ ነው።');
      return;
    }

    if (!paymentScreenshot) {
      alert('እባክዎ የክፍያ ማረጋገጫ (ስክሪንሾት) ሊንክ ወይም ምስል ያያይዙ!');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        userId: user._id || user.email,
        customerName: user.name,
        customerEmail: user.email,
        items: cartItems,
        totalAmount,
        paymentScreenshot,
        status: 'Pending' // ለአድሚን/ሰራተኛ ለማሳየት
      };

      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const data = await res.json();

      if (res.ok || data.success) {
        alert('✅ ትዕዛዝዎ ተልኳል! ሰራተኛችን ክፍያውን አረጋግጦ እስኪፈቅድ ድረስ በትዕግስት ይጠብቁ።');
        setCartItems([]); // ካርቱን ባዶ እናደርጋለን
        navigateTo('order'); // ወደ ትዕዛዞች ገጽ እንወስደዋለን
      } else {
        alert(data.error || 'ትዕዛዙን መላክ አልተቻለም።');
      }
    } catch (err) {
      console.error(err);
      alert('የሰርቨር ስህተት አጋጥሟል።');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cart-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', color: '#fff' }}>
      <h2>🛒 የእርስዎ ካርት (Shopping Cart)</h2>

      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <p>ካርትዎ ባዶ ነው።</p>
          <button onClick={() => navigateTo('menu')} style={{ marginTop: '15px', padding: '10px 20px', background: '#e67e22', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            ምናሌዎችን ይመልከቱ
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
            {cartItems.map((item, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#161b22', padding: '15px', borderRadius: '8px', border: '1px solid #30363d' }}>
                <div>
                  <h4>{item.name}</h4>
                  <p style={{ color: '#8b949e' }}>ዋጋ: ብር {item.price} | ብዛት: {item.quantity || 1}</p>
                </div>
                <button onClick={() => handleRemoveItem(index)} style={{ background: '#ff4444', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>
                  🗑 አስወግድ
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '30px', padding: '20px', background: '#21262d', borderRadius: '8px' }}>
            <h3>አጠቃላይ የሚከፈል: ብር {totalAmount.toFixed(2)}</h3>
            
            {/* የክፍያ ስክሪንሾት ማስገቢያ */}
            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>የክፍያ ማረጋገጫ (ስክሪንሾት ሊንክ ወይም ምስል ዩአርኤል):</label>
              <input 
                type="text" 
                placeholder="ስክሪንሾቱ የተቀመጠበትን ሊንክ ይለጥፉ..."
                value={paymentScreenshot}
                onChange={(e) => setPaymentScreenshot(e.target.value)}
                style={{ width: '100%', padding: '10px', background: '#161b22', border: '1px solid #30363d', color: '#fff', borderRadius: '5px' }}
                required
              />
            </div>

            <button 
              onClick={handleCheckout}
              disabled={loading}
              style={{ marginTop: '20px', background: '#2ecc71', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}
            >
              {loading ? 'በመላክ ላይ...' : 'ትዕዛዝ አረጋግጥ እና ላክ (Checkout)'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
