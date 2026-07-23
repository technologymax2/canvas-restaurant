import React, { useState } from 'react';
import './Footer.css';

function Cart({ cartItems, setCartItems, navigateTo, user, API_BASE_URL }) {
  const [tableNumber, setTableNumber] = useState('');
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // ➕ የምግብ ብዛት መጨመሪያ በካርት ውስጥ
  const handleIncrease = (index) => {
    const updatedCart = [...cartItems];
    updatedCart[index] = {
      ...updatedCart[index],
      quantity: (updatedCart[index].quantity || 1) + 1
    };
    setCartItems(updatedCart);
  };

  // ➖ የምግብ ብዛት መቀነሻ በካርት ውስጥ
  const handleDecrease = (index) => {
    const updatedCart = [...cartItems];
    if ((updatedCart[index].quantity || 1) > 1) {
      updatedCart[index] = {
        ...updatedCart[index],
        quantity: updatedCart[index].quantity - 1
      };
      setCartItems(updatedCart);
    } else {
      handleRemoveItem(index);
    }
  };

  // 🗑 አንድን ምግብ ሙሉ በሙሉ ከካርት ማጥፊያ
  const handleRemoveItem = (indexToRemove) => {
    setCartItems(prevItems => prevItems.filter((_, index) => index !== indexToRemove));
  };

  // ❌ አጠቃላይ ካርቱን ባዶ ማድረጊያ (Cancel All)
  const handleClearCart = () => {
    if (window.confirm('ሁሉንም የካርት ትዕዛዞች መሰረዝ ይፈልጋሉ?')) {
      setCartItems([]);
    }
  };

  // አጠቃላይ ዋጋን ማስላት
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

    if (!tableNumber) {
      alert('እባክዎ የጠረጴዛ ቁጥርዎን (Table Number) ያስገቡ!');
      return;
    }

    if (!paymentScreenshotUrl && !screenshotFile) {
      alert('እባክዎ የክፍያ ማረጋገጫ ሊንክ ያስገቡ ወይም ስክሪንሾት ምስል ይምረጡ!');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('userId', user.id || user._id);
      formData.append('customerName', user.name);
      formData.append('customerEmail', user.email);
      formData.append('items', JSON.stringify(cartItems));
      formData.append('totalAmount', totalAmount);
      formData.append('tableNumber', tableNumber);
      formData.append('paymentScreenshotUrl', paymentScreenshotUrl);
      if (screenshotFile) {
        formData.append('paymentScreenshotFile', screenshotFile);
      }

      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert('✅ ትዕዛዝዎ እና የክፍያ ማረጋገጫዎ ተልኳል! ሰራተኛችን እስኪያረጋግጠው ይጠብቁ።');
        setCartItems([]); 
        navigateTo('order'); 
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
    <div className="cart-container" style={{ padding: '30px', maxWidth: '800px', margin: '0 auto', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>🛒 የእርስዎ ካርት (Shopping Cart)</h2>
        {cartItems.length > 0 && (
          <button 
            onClick={handleClearCart} 
            style={{ background: '#ff4444', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            🗑 ሁሉንም ሰርዝ (Cancel All)
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <p>ካርትዎ ባዶ ነው።</p>
          <button onClick={() => navigateTo('menu')} style={{ marginTop: '15px', padding: '10px 20px', background: '#e67e22', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            ምናሌዎችን ይመልከቱ
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'grid', gap: '15px' }}>
            {cartItems.map((item, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#161b22', padding: '15px', borderRadius: '8px', border: '1px solid #30363d', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h4 style={{ fontSize: '16px', marginBottom: '5px' }}>{item.name}</h4>
                  <p style={{ color: '#8b949e', fontSize: '14px' }}>የአንዱ ዋጋ: ብር {item.price}</p>
                  
                  {/* 📝 ደንበኛው ያስገባው ማስታወሻ ወይም ኢሞጂ ካለ እዚህ ይታያል */}
                  {item.note && (
                    <p style={{ color: '#e67e22', fontSize: '13px', fontStyle: 'italic', marginTop: '4px' }}>
                      ማስታወሻ: {item.note}
                    </p>
                  )}
                </div>

                {/* ➕ እና ➖ የብዛት መቆጣጠሪያ */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button 
                    onClick={() => handleDecrease(index)}
                    style={{ background: '#30363d', color: '#fff', border: 'none', width: '30px', height: '30px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    -
                  </button>
                  <span style={{ fontWeight: 'bold', fontSize: '16px', minWidth: '20px', textAlign: 'center' }}>
                    {item.quantity || 1}
                  </span>
                  <button 
                    onClick={() => handleIncrease(index)}
                    style={{ background: '#30363d', color: '#fff', border: 'none', width: '30px', height: '30px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    +
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>
                    ብር {(Number(item.price) || 0) * (item.quantity || 1)}
                  </span>
                  <button 
                    onClick={() => handleRemoveItem(index)} 
                    style={{ background: '#da3633', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer', fontSize: '13px' }}
                  >
                    🗑 አስወግድ
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '30px', padding: '20px', background: '#21262d', borderRadius: '8px' }}>
            <h3>አጠቃላይ የሚከፈል: ብር {totalAmount.toFixed(2)}</h3>
            
            {/* የጠረጴዛ ቁጥር ማስገቢያ */}
            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>የጠረጴዛ ቁጥር (Table Number):</label>
              <input 
                type="text" 
                placeholder="ለምሳሌ: ጠረጴዛ ቁጥር 4"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                style={{ width: '100%', padding: '10px', background: '#161b22', border: '1px solid #30363d', color: '#fff', borderRadius: '5px' }}
                required
              />
            </div>

            {/* የክፍያ ስክሪንሾት ሊንክ ማስገቢያ */}
            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>የክፍያ ስክሪንሾት ሊንክ (Image URL):</label>
              <input 
                type="text" 
                placeholder="የስክሪንሾቱን ሊንክ እዚህ ይለጥፉ..."
                value={paymentScreenshotUrl}
                onChange={(e) => setPaymentScreenshotUrl(e.target.value)}
                style={{ width: '100%', padding: '10px', background: '#161b22', border: '1px solid #30363d', color: '#fff', borderRadius: '5px' }}
              />
            </div>

            {/* የክፍያ ስክሪንሾት ፋይል መጫኛ */}
            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>ወይም የክፍያ ስክሪንሾት ፋይል ይምረጡ (Image File):</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setScreenshotFile(e.target.files[0])}
                style={{ width: '100%', padding: '10px', background: '#161b22', border: '1px solid #30363d', color: '#fff', borderRadius: '5px' }}
              />
            </div>

            <button 
              onClick={handleCheckout}
              disabled={loading}
              style={{ marginTop: '20px', background: '#2ecc71', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}
            >
              {loading ? 'በመጫን እና በመላክ ላይ...' : 'ትዕዛዝ አረጋግጥ እና ላክ (Checkout)'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
