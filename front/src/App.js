import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import FoodMenu from './components/FoodMenu';
import Order from './components/Order';
import ContactUs from './components/ContactUs';
import Cart from './components/Cart';
import OurFoods from './components/OurFoods';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import logoImg from './CanvasLogo2.png';

// Change this to your actual backend URL
const API_BASE_URL = 'http://localhost:5000'; 

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null); 
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authStatus, setAuthStatus] = useState('');

  // 🛡️ Security Guard: Redirect if user tries to access unauthorized dashboard
  useEffect(() => {
    if (currentScreen === 'admin-dashboard' && user?.role !== 'admin') {
      setCurrentScreen(user ? 'employee-dashboard' : 'login');
    }
    if (currentScreen === 'employee-dashboard' && user?.role !== 'employee') {
      setCurrentScreen(user ? 'admin-dashboard' : 'login');
    }
  }, [currentScreen, user]);

  const handleAuthChange = (e) => {
    setAuthForm({ ...authForm, [e.target.name]: e.target.value });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthStatus('Logging in...');

    try {
      const endpoint = authMode === 'login' ? '/api/login' : '/api/signup';
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const data = await res.json();

      if (data.success) {
        setUser(data.user);
        // Redirection based on role
        if (data.user.role === 'admin') {
          setCurrentScreen('admin-dashboard');
        } else if (data.user.role === 'employee') {
          setCurrentScreen('employee-dashboard');
        } else {
          setCurrentScreen('home');
        }
        setAuthStatus('');
      } else {
        setAuthStatus(data.message || 'Login failed');
      }
    } catch (err) {
      setAuthStatus('Server error. Please try again.');
    }
  };

  const addToCart = (item) => {
    setCart([...cart, item]);
    alert(`${item.title} ወደ ካርታ ተጨምሯል!`);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('home');
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
        
        {user ? (
          <button 
            onClick={() => setCurrentScreen(user.role === 'admin' ? 'admin-dashboard' : 'employee-dashboard')} 
            className="font-bold text-green-600"
          >
            Dashboard
          </button>
        ) : (
          <button onClick={() => setCurrentScreen('login')} className="font-bold text-blue-600">Login</button>
        )}
        
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
        
        {/* Dashboards - Secured by Role */}
        {currentScreen === 'admin-dashboard' && user?.role === 'admin' && (
          <AdminDashboard handleLogout={handleLogout} API_BASE_URL={API_BASE_URL} />
        )}
        {currentScreen === 'employee-dashboard' && user?.role === 'employee' && (
          <EmployeeDashboard handleLogout={handleLogout} API_BASE_URL={API_BASE_URL} />
        )}

        {currentScreen === 'login' && (
          <Login 
            authMode={authMode} 
            setAuthMode={setAuthMode} 
            authForm={authForm}
            handleAuthChange={handleAuthChange}
            handleAuthSubmit={handleAuthSubmit}
            authStatus={authStatus}
            logoImg={logoImg}
          />
        )}
      </main>
    </div>
  );
}

export default App;
