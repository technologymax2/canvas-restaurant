import React, { useState, useEffect } from 'react';
// Import your new components here
import Home from './components/Home';
import FoodMenu from './components/FoodMenu';
import Order from './components/Order';
import ContactUs from './components/ContactUs';
import Cart from './components/Cart';
import OurFoods from './components/OurFoods';

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [cart, setCart] = useState([]);

  // Navigation Component to be used in all pages
  const Navbar = () => (
    <nav className="bg-white p-4 flex justify-between shadow-md">
      <div className="font-bold text-xl">Canvas-Restaurant</div>
      <div className="flex gap-4">
        <button onClick={() => setCurrentScreen('home')}>Home</button>
        <button onClick={() => setCurrentScreen('menu')}>Menu</button>
        <button onClick={() => setCurrentScreen('our-foods')}>Our Foods</button>
        <button onClick={() => setCurrentScreen('contact')}>Contact</button>
        <button onClick={() => setCurrentScreen('cart')} className="relative">
          Cart ({cart.length})
        </button>
      </div>
    </nav>
  );

  // Screen Switcher
  const renderScreen = () => {
    switch (currentScreen) {
      case 'home': return <Home setCurrentScreen={setCurrentScreen} />;
      case 'menu': return <FoodMenu />;
      case 'order': return <Order />;
      case 'contact': return <ContactUs />;
      case 'cart': return <Cart cart={cart} />;
      case 'our-foods': return <OurFoods />;
      default: return <Home />;
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      {renderScreen()}
    </div>
  );
}

export default App;
