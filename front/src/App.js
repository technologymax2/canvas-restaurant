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

const API_BASE_URL = 'https://canvas-restaurant.onrender.com'; 

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

  const [adminMessages, setAdminMessages] = useState([]);
  const [projects, setProjects] = useState([]);

  const [newAdminForm, setNewAdminForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [adminAddStatus, setAdminAddStatus] = useState("");
  
  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/messages`);
      const data = await res.json();

      if (data.success) {
        setAdminMessages(data.messages);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMessage = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/admin/messages/${id}`, {
        method: "DELETE"
      });

      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewAdminChange = (e) => {
    setNewAdminForm({
      ...newAdminForm,
      [e.target.name]: e.target.value
    });
  };

  const handleAddAdminSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/add-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newAdminForm)
      });

      const data = await res.json();

      if (data.success) {
        setAdminAddStatus("Admin created.");

        setNewAdminForm({
          name: "",
          email: "",
          password: ""
        });
      } else {
        setAdminAddStatus(data.error);
      }
    } catch {
      setAdminAddStatus("Server error.");
    }
  };

  const handleAuthChange = (e) => {
    setAuthForm({ ...authForm, [e.target.name]: e.target.value });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthStatus('Logging in...');

    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const data = await res.json();

      if (data.success) {
        setUser(data.user);
        if (data.user.role === 'admin') {
          setCurrentScreen('admin-dashboard');
        } else if (data.user.role === 'employee') {
          setCurrentScreen('employee-dashboard');
        } else {
          setCurrentScreen('home');
        }
        setAuthStatus('');
      } else {
        setAuthStatus(data.error || 'Login failed');
      }
    } catch (err) {
      setAuthStatus('Server error. Please try again.');
    }
  };

const addToCart = (item) => {
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(cartItem => (cartItem._id || cartItem.id) === (item._id || item.id));
      if (existingIndex > -1) {
        // ምግብ ቀድሞውኑ ካርት ውስጥ ካለ ብዛቱን (quantity) እንጨምራለን
        const updatedCart = [...prevCart];
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          quantity: (updatedCart[existingIndex].quantity || 1) + 1
        };
        return updatedCart;
      } else {
        // አዲስ ምግብ ከሆነ በ quantity: 1 እናስገባዋለን
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
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
        <button onClick={() => setCurrentScreen('order')}>Orders</button>
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
        
        {/* የምግብ ምናሌ ገጽ */}
       <FoodMenu 
  API_BASE_URL={API_BASE_URL} 
  cart={cart} 
  addToCart={addToCart} 
  decreaseQuantity={decreaseQuantity} 
/>
        
        {/* የእኛ ልዩ ምግቦች ገጽ */}
        {currentScreen === 'our-foods' && <OurFoods API_BASE_URL={API_BASE_URL} addToCart={addToCart} />}
        
        {/* የትዕዛዞች ገጽ */}
        {currentScreen === 'order' && <Order user={user} API_BASE_URL={API_BASE_URL} />}
        
        {/* እኛን ማግኛ ገጽ */}
        {currentScreen === 'contact' && <ContactUs user={user} API_BASE_URL={API_BASE_URL} fetchMessages={fetchMessages} />}
        
      {currentScreen === 'cart' && (
  <Cart 
    cartItems={cart} 
    setCartItems={setCart} 
    navigateTo={setCurrentScreen} 
    user={user} 
    API_BASE_URL={API_BASE_URL} 
  />
)}
        
        {/* ዳሽቦርዶች (በሮል የተጠበቁ) */}
        {currentScreen === 'admin-dashboard' && user?.role === 'admin' && (
         <AdminDashboard
            user={user}
            handleLogout={handleLogout}
            adminMessages={adminMessages}
            fetchMessages={fetchMessages}
            newAdminForm={newAdminForm}
            handleNewAdminChange={handleNewAdminChange}
            handleAddAdminSubmit={handleAddAdminSubmit}
            adminAddStatus={adminAddStatus}
            API_BASE_URL={API_BASE_URL}
            handleDeleteMessage={handleDeleteMessage}
            projects={projects}
            setProjects={setProjects}
          />
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
