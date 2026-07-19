import React, { useState } from 'react';
import Home from './components/Home';
import FoodMenu from './components/FoodMenu';
import Order from './components/Order';
import ContactUs from './components/ContactUs';
import Cart from './components/Cart';
import OurFoods from './components/OurFoods';
import Login from './components/Login'; // 1. Import Login
import logoImg from './CanvasLogo2.png';

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [cart, setCart] = useState([]);

  const addToCart = (item) => {
    setCart([...cart, item]);
    alert(`${item.title} ወደ ካርታ ተጨምሯል!`);
  };

  const Navbar = () => (
    <nav className="bg-white p-4 flex flex-wrap justify-between items-center shadow-md sticky top-0 z-50">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentScreen('home')}>
        <img src={logoImg} alt="Logo" className="h-10 w-10 object-contain" />
        <span className="font-bold text-xl">Canvas-Restaurant</span>
      </div>
      
      <div className="flex gap-4 text-sm md:text-base items-center">
        <button onClick={() => setCurrentScreen('home')}>Home</button>
        <button onClick={() => setCurrentScreen('menu')}>Menu</button>
        <button onClick={() => setCurrentScreen('our-foods')}>Our Foods</button>
        <button onClick={() => setCurrentScreen('contact')}>Contact</button>
        {/* 2. Added Login link to Navbar */}
        <button onClick={() => setCurrentScreen('login')} className="font-bold text-blue-600">Login</button>
        <button onClick={() => setCurrentScreen('cart')} className="bg-yellow-500 px-4 py-1 rounded-full font-bold">
          Cart ({cart.length})
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        {currentScreen === 'home' && <Home setCurrentScreen={setCurrentScreen} />}
        {currentScreen === 'menu' && <FoodMenu addToCart={addToCart} />}
        {currentScreen === 'our-foods' && <OurFoods addToCart={addToCart} />}
        {currentScreen === 'order' && <Order />}
        {currentScreen === 'contact' && <ContactUs />}
        {currentScreen === 'cart' && <Cart cart={cart} />}
        {/* 3. Added Login screen render logic */}
        {currentScreen === 'login' && (
          <Login 
            authMode="login" 
            setAuthMode={setCurrentScreen} 
            logoImg={logoImg}
            // You will need to pass your auth handlers here from App.js state
          />
        )}
      </main>
    </div>
  );
}

export default App;
