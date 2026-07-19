import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import OrderPage from './components/OrderPage';
import Footer from './components/Footer';
import logoImg from './CanvasLogo2.png'; 

function App() {
  const API_BASE_URL = 'https://canvas-restaurant.onrender.com';

  const [currentScreen, setCurrentScreen] = useState('home');
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authStatus, setAuthStatus] = useState('');
  const [adminMessages, setAdminMessages] = useState([]);
  const [newAdminForm, setNewAdminForm] = useState({ name: '', email: '', password: '' });
  const [adminAddStatus, setAdminAddStatus] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/projects`)
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.projects)) setProjects(data.projects);
        else if (Array.isArray(data)) setProjects(data);
        else setProjects([]);
      })
      .catch((err) => console.error("Error fetching projects", err));
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/messages`);
      const data = await res.json();
      if (data.success) setAdminMessages(data.messages);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (user && user.role === 'admin') fetchMessages();
  }, [user]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const url = currentScreen === 'login' ? '/api/auth/login' : '/api/auth/signup';
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        if (currentScreen === 'login') {
          setUser(data.user);
          setCurrentScreen(data.user.role === 'admin' ? 'admin-dashboard' : 'order-page');
        } else {
          setAuthStatus('✅ ምዝገባው ተሳክቷል! አሁን መግባት ይችላሉ።');
          setCurrentScreen('login');
        }
      } else setAuthStatus(data.error);
    } catch { setAuthStatus('የሰርቨር ስህተት!'); }
  };

  const handleAddAdminSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/add-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdminForm)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setAdminAddStatus('✅ አድሚን ተፈጥሯል!');
        setNewAdminForm({ name: '', email: '', password: '' });
      } else setAdminAddStatus(data.error);
    } catch { setAdminAddStatus('ስህተት!'); }
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setStatus('ትዕዛዝዎ ገብቷል!');
        setFormData({ name: '', email: '', message: '' });
      }
    } catch { setStatus('ስህተት!'); }
  };

  const handleDeleteMessage = async (id) => {
    if (window.confirm('ማጥፋት ይፈልጋሉ?')) {
      await fetch(`${API_BASE_URL}/api/admin/messages/${id}`, { method: 'DELETE' });
      fetchMessages();
    }
  };

  const handleLogout = () => { setUser(null); setCurrentScreen('home'); };

  // --- Render Logic ---

  if (currentScreen === 'home') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
       <nav className="bg-white shadow-md p-4 flex flex-wrap justify-between items-center px-4 md:px-8">
  {/* Logo and Brand Name */}
  <div className="flex items-center gap-2">
    <img src={logoImg} alt="Logo" className="h-10 w-10 object-contain" />
    <span className="text-lg md:text-xl font-bold text-gray-800 truncate">
      Canvas-Restaurant
    </span>
  </div>

  {/* Login and Signup Buttons */}
  <div className="flex gap-2 mt-2 md:mt-0">
    <button 
      onClick={() => { setAuthStatus(''); setCurrentScreen('login'); }} 
      className="bg-gray-800 text-white px-3 py-1.5 md:px-6 md:py-2 rounded-lg text-sm md:text-base hover:bg-black transition"
    >
      Login
    </button>
    <button 
      onClick={() => { setAuthStatus(''); setCurrentScreen('signup'); }} 
      className="bg-yellow-500 text-black px-3 py-1.5 md:px-6 md:py-2 rounded-lg text-sm md:text-base font-bold hover:bg-yellow-400 transition"
    >
      Signup
    </button>
  </div>
</nav>

  
<header 
  className="flex-grow flex flex-col justify-center items-center text-center p-6 md:p-10 text-white min-h-[60vh] relative bg-cover bg-center bg-no-repeat"
  style={{ backgroundImage: 'url(bacggroundForCanvas.jpg)' }} // Replace with your image path
>
  {/* This div creates the dark overlay for readability */}
  <div className="absolute inset-0 bg-black opacity-60"></div>

  {/* All text elements must have 'relative z-10' to appear on top of the overlay */}
  <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight relative z-10 drop-shadow-lg">
    እንኳን ወደ Canvas-Restaurant በሰላም መጡ!
  </h1>
  <p className="text-xl md:text-2xl mb-6 md:mb-8 text-gray-100 relative z-10 drop-shadow-md">
    ምን ይፈልጋሉ? ሁሉም እኛ ጋር ይገኛል
  </p>
  <button 
    onClick={() => setCurrentScreen('login')} 
    className="bg-yellow-500 text-black px-10 py-4 rounded-full text-lg font-bold hover:scale-105 transition transform relative z-10 shadow-xl"
  >
    አሁኑኑ ይዘዙን!
  </button>
</header>

        <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {projects.map((p) => (
            <div key={p._id} className="bg-white p-4 rounded-xl shadow-lg hover:shadow-2xl transition">
              <a href={p.link || "#"} target="_blank" rel="noopener noreferrer">
                <img src={p.imageUrl} alt={p.title} className="w-full h-48 object-cover rounded-lg" />
              </a>
              <h3 className="text-center mt-4 font-bold text-lg">{p.title}</h3>
            </div>
          ))}
        </div>
        <Footer />
      </div>
    );
  }

  if (currentScreen === 'login' || currentScreen === 'signup') {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <span onClick={() => setCurrentScreen('home')} className="cursor-pointer text-blue-600 font-bold hover:underline mb-4 block">⬅ ወደ ዋናው ገጽ ይመለሱ</span>
        <Login authMode={currentScreen} setAuthMode={setCurrentScreen} authForm={authForm} handleAuthChange={(e) => setAuthForm({...authForm, [e.target.name]: e.target.value})} handleAuthSubmit={handleAuthSubmit} authStatus={authStatus} logoImg={logoImg} />
      </div>
    );
  }

  if (currentScreen === 'admin-dashboard' && user?.role === 'admin') {
    return <AdminDashboard user={user} handleLogout={handleLogout} adminMessages={adminMessages} fetchMessages={fetchMessages} newAdminForm={newAdminForm} handleNewAdminChange={(e) => setNewAdminForm({...newAdminForm, [e.target.name]: e.target.value})} handleAddAdminSubmit={handleAddAdminSubmit} adminAddStatus={adminAddStatus} API_BASE_URL={API_BASE_URL} handleDeleteMessage={handleDeleteMessage} projects={projects} setProjects={setProjects} />;
  }

  if (currentScreen === 'order-page' && user) {
    return <OrderPage user={user} handleLogout={handleLogout} formData={formData} handleContactChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})} handleOrderSubmit={handleOrderSubmit} status={status} logoImg={logoImg} API_BASE_URL={API_BASE_URL} />;
  }

  return null;
}

export default App;
