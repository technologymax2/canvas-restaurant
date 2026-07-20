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

  // 🛠️ REQUIRED STATES FOR ADMIN DASHBOARD
  const [adminMessages, setAdminMessages] = useState([]);
  const [projects, setProjects] = useState([]);
  const [newAdminForm, setNewAdminForm] = useState({ name: '', email: '', password: '' });
  const [adminAddStatus, setAdminAddStatus] = useState('');

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/messages`);
      const data = await res.json();
      if (data.success) setAdminMessages(data.messages);
    } catch (err) { console.error('Failed to fetch messages'); }
  };

  const handleNewAdminChange = (e) => {
    setNewAdminForm({ ...newAdminForm, [e.target.name]: e.target.value });
  };

  const handleAddAdminSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdminForm)
      });
      const data = await res.json();
      setAdminAddStatus(data.success ? 'Admin added!' : 'Failed to add admin');
    } catch (err) { setAdminAddStatus('Error adding admin'); }
  };

  const handleDeleteMessage = async (id) => {
    await fetch(`${API_BASE_URL}/api/admin/messages/${id}`, { method: 'DELETE' });
    fetchMessages();
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
        setCurrentScreen(data.user.role === 'admin' ? 'admin-dashboard' : 'home');
      } else {
        setAuthStatus(data.error || 'Login failed');
      }
    } catch (err) { setAuthStatus('Server error.'); }
  };

  const handleLogout = () => { setUser(null); setCurrentScreen('home'); };

  const addToCart = (item) => { setCart([...cart, item]); };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white p-4 flex justify-between items-center shadow-md">
        <div className="cursor-pointer font-bold text-xl" onClick={() => setCurrentScreen('home')}>Canvas-Restaurant</div>
        <div className="flex gap-4">
          <button onClick={() => setCurrentScreen('home')}>Home</button>
          {user?.role === 'admin' && <button onClick={() => setCurrentScreen('admin-dashboard')}>Dashboard</button>}
          {!user ? <button onClick={() => setCurrentScreen('login')}>Login</button> : <button onClick={handleLogout}>Logout</button>}
        </div>
      </nav>

      <main>
        {currentScreen === 'home' && <Home />}
        {currentScreen === 'menu' && <FoodMenu addToCart={addToCart} />}
        {currentScreen === 'admin-dashboard' && user?.role === 'admin' && (
          <AdminDashboard 
            user={user}
            handleLogout={handleLogout} 
            API_BASE_URL={API_BASE_URL} 
            adminMessages={adminMessages}
            fetchMessages={fetchMessages}
            newAdminForm={newAdminForm}
            handleNewAdminChange={handleNewAdminChange}
            handleAddAdminSubmit={handleAddAdminSubmit}
            adminAddStatus={adminAddStatus}
            handleDeleteMessage={handleDeleteMessage}
            projects={projects}
            setProjects={setProjects}
          />
        )}
        {currentScreen === 'login' && (
          <Login 
            authMode={authMode} 
            setAuthMode={setAuthMode} 
            authForm={authForm}
            handleAuthChange={handleAuthChange}
            handleAuthSubmit={handleAuthSubmit}
            authStatus={authStatus}
          />
        )}
      </main>
    </div>
  );
}

export default App;
