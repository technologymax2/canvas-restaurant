import React, { useState, useEffect, useCallback } from 'react';

function Order({ user, API_BASE_URL }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUserOrders = useCallback(async () => {
    if (!user || !user.email) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/user/orders/${user.email}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      } else {
        setError('ማዘዣዎችዎን ማምጣት አልተቻለም');
      }
    } catch (err) {
      setError('የሰርቨር ስህተት ገጥሟል');
    } finally {
      setLoading(false);
    }
  }, [user, API_BASE_URL]);

  useEffect(() => {
    fetchUserOrders();
    const interval = setInterval(fetchUserOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchUserOrders]);

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] p-4">
        <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl text-center max-w-md w-full">
          <h2 className="text-amber-400 font-semibold text-lg">⚠️ እባክዎ ትዕዛዞችዎን ለማየት መጀመሪያ ይግቡ (Login)</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-white font-sans">
      {/* 🌟 Header Section */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 p-6 sm:p-8 rounded-2xl border border-gray-800 shadow-xl mb-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-400 mb-2">📦 የእርስዎ ትዕዛዞች እና የክፍያ ታሪክ</h2>
        <p className="text-gray-400 text-sm sm:text-base">የልዩ ትዕዛዝ ቁጥርዎን፣ የምግብ ዝርዝሮችን እና የክፍያ ስክሪንሾት እዚህ መከታተል ይችላሉ።</p>
      </div>

      {loading ? (
        <div className="text-center py-12 bg-gray-900 rounded-2xl border border-gray-800 text-gray-400 animate-pulse">
          ⏳ በመጫን ላይ...
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-gray-900 rounded-2xl border border-red-900/50 text-red-400 font-medium">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-900 rounded-2xl border border-gray-800 text-gray-400">
          🛒 እስካሁን ያስቀመጡት ትዕዛዝ የለም።
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map((ord, index) => {
            let badgeStyle = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
            if (ord.status === 'Approved') {
              badgeStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
            } else if (ord.status === 'Completed') {
              badgeStyle = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
            } else if (ord.status === 'Cancelled') {
              badgeStyle = 'bg-red-500/10 text-red-400 border-red-500/30';
            }

            // የክፍያ ስክሪንሾት ዩአርኤልን ማውጣት
            let extractedScreenshotUrl = ord.paymentScreenshotUrl || '';
            if (!extractedScreenshotUrl && ord.message && ord.message.includes('የክፍያ ስክሪንሾት:')) {
              const parts = ord.message.split('የክፍያ ስክሪንሾት:');
              if (parts[1]) {
                extractedScreenshotUrl = parts[1].trim().split(' ')[0];
              }
            }

            // ልዩ የትዕዛዝ ቁጥር (Unique Order Number) ከሰርቨር ወይም ርዝመት በመውሰድ ላይ
            const uniqueOrderNo = ord.orderNumber || `#${ord._id ? ord._id.slice(-6).toUpperCase() : index + 1001}`;

            return (
              <div 
                key={ord._id || index} 
                className="bg-gray-900 rounded-2xl border border-gray-800 p-6 shadow-lg hover:border-blue-500/50 transition-all duration-200"
              >
                {/* 🔖 የትዕዛዝ ቁጥር እና ስታተስ ማሳያ */}
                <div className="flex flex-wrap justify-between items-center gap-3 mb-4 pb-3 border-b border-gray-800">
                  <div>
                    <span className="text-xs text-gray-400 block">ልዩ ትዕዛዝ ቁጥር (Order No):</span>
                    <span className="text-blue-400 font-bold text-base tracking-wider">{uniqueOrderNo}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badgeStyle}`}>
                    {ord.status || 'በጥበቃ ላይ'}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>📅 ቀን: {new Date(ord.date).toLocaleString()}</span>
                    <span>ጠረጴዛ ቁጥር: <strong className="text-white">{ord.tableNumber || 'አልተገለጸም'}</strong></span>
                  </div>

                  {/* 🍲 የታዘዙ ምግቦች ዝርዝር እና ዋጋ */}
                  {ord.items && (
                    <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                      <strong className="text-gray-400 text-xs uppercase tracking-wider block mb-2">የታዘዙ ምግቦች:</strong>
                      <ul className="divide-y divide-gray-800/60">
                        {(() => {
                          try {
                            const parsedItems = typeof ord.items === 'string' ? JSON.parse(ord.items) : ord.items;
                            return parsedItems.map((item, idx) => (
                              <li key={idx} className="py-2 flex justify-between items-center text-sm">
                                <div>
                                  <span className="text-white font-medium">{item.name}</span>
                                  <span className="text-gray-400 text-xs ml-2">(ብዛት: {item.quantity || 1})</span>
                                </div>
                                <span className="text-emerald-400 font-semibold">ብር {item.price}</span>
                              </li>
                            ));
                          } catch (e) {
                            return <p className="text-sm text-gray-400">{ord.message}</p>;
                          }
                        })()}
                      </ul>
                      <div className="mt-3 pt-2 border-t border-gray-800 flex justify-between items-center text-sm font-bold">
                        <span className="text-gray-300">አጠቃላይ ዋጋ:</span>
                        <span className="text-emerald-400 text-base">ብር {ord.totalAmount || '---'}</span>
                      </div>
                    </div>
                  )}

                  {/* 🖼️ የክፍያ ስክሪንሾት ምስል ማሳያ */}
                  {extractedScreenshotUrl && (
                    <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 inline-block w-full sm:w-auto">
                      <p className="text-xs text-blue-400 font-semibold mb-2">🖼️ የክፍያ ማረጋገጫ ስክሪንሾት:</p>
                      <a href={extractedScreenshotUrl} target="_blank" rel="noopener noreferrer">
                        <img 
                          src={extractedScreenshotUrl} 
                          alt="Payment Screenshot" 
                          className="w-full sm:w-48 h-48 object-cover rounded-lg border border-gray-800 hover:opacity-95 transition-opacity" 
                        />
                      </a>
                      <a 
                        href={extractedScreenshotUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-block mt-2 text-blue-400 text-xs underline hover:text-blue-300"
                      >
                        ምስሉን በትልቅ መጠን ይክፈቱ (Open Full Image)
                      </a>
                    </div>
                  )}

                  {/* 👑 የሰራተኛ ምላሽ */}
                  {ord.reply && (
                    <div className="bg-gray-950 p-4 rounded-xl border-l-4 border-emerald-500 border border-gray-800">
                      <p className="text-emerald-400 text-sm font-medium">
                        👑 የሰራተኛ/የአድሚን ምላሽ: <span className="text-gray-200 font-normal">{ord.reply}</span>
                      </p>
                    </div>
                  )}

                  {ord.handledBy && (
                    <p className="text-xs text-gray-400 italic">
                      👨‍🍳 ያስተካከለው ሰራተኛ: <span className="text-blue-400 font-semibold not-italic">{ord.handledBy}</span>
                    </p>
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

export default Order;
