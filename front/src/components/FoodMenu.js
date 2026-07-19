import React, { useEffect, useState } from 'react';

function FoodMenu({ addToCart }) {
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    // Replace this URL with your actual backend endpoint for fetching menu items
    fetch('https://canvas-restaurant.onrender.com/api/menu')
      .then((res) => res.json())
      .then((data) => setMenuItems(data))
      .catch((err) => console.error("Error fetching menu", err));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">የእኛ ምናሌ (Menu)</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <div key={item._id} className="bg-white p-4 rounded-xl shadow-lg border">
            <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover rounded-lg" />
            <h3 className="text-xl font-bold mt-4">{item.title}</h3>
            <p className="text-gray-600">{item.description}</p>
            <p className="text-lg font-semibold text-yellow-600 mt-2">{item.price} ብር</p>
            <button 
              onClick={() => addToCart(item)}
              className="mt-4 w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800"
            >
              ወደ ካርታ ጨምር
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FoodMenu;
