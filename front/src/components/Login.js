import React from 'react';
import Footer from './Footer';

function Login({ authMode, setAuthMode, authForm, handleAuthChange, handleAuthSubmit, authStatus, logoImg }) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md animate-fade-in">
          <img src={logoImg} alt="Logo" className="w-20 h-20 mx-auto mb-6 object-contain" />
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            {authMode === 'login' ? 'ወደ Canvas-Restaurant ይግቡ' : 'የደንበኛ አካውንት ይክፈቱ'}
          </h2>
          
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'signup' && (
              <input 
                type="text" 
                name="name" 
                placeholder="ሙሉ ስም" 
                onChange={handleAuthChange} 
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
              />
            )}
            <input 
              type="text" 
              name="email" 
              placeholder="ኢሜይል ወይም የተጠቃሚ ስም" 
              onChange={handleAuthChange} 
              required 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
            />
            <input 
              type="password" 
              name="password" 
              placeholder="ፓስወርድ" 
              onChange={handleAuthChange} 
              required 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
            />
            <button type="submit" className="w-full bg-yellow-500 text-black font-bold py-3 rounded-lg hover:bg-yellow-400 transition transform hover:scale-105">
              {authMode === 'login' ? 'ይግቡ' : 'ይመዝገቡ'}
            </button>
          </form>

          {authStatus && <p className="mt-4 text-center text-red-600 font-medium">{authStatus}</p>}
          
          <p 
            className="mt-6 text-center text-blue-600 cursor-pointer hover:underline" 
            onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
          >
            {authMode === 'login' ? 'አካውንት የለዎትም? ይመዝገቡ' : 'ቀድሞ አካውንት አለዎት? ይግቡ'}
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Login;
