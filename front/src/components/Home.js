import React, { useEffect, useState } from 'react';
// Adjust the import paths based on where your images are located
import logoImg from '../CanvasLogo2.png'; // Use ../ to go up one folder
import heroBg from '../bacggroundForCanvas.jpg';

function Home({ setCurrentScreen }) {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch('https://canvas-restaurant.onrender.com/api/projects')
      .then((res) => res.json())
      .then((data) => {
        // Handle both object-based response and array-based response
        const projectList = Array.isArray(data) ? data : (data.projects || []);
        setProjects(projectList);
      })
      .catch((err) => console.error("Error fetching projects", err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header Section */}
      <header 
        className="flex-grow flex flex-col justify-center items-center text-center p-6 md:p-10 text-white min-h-[60vh] relative bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-black opacity-60"></div>

        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight relative z-10 drop-shadow-lg">
          እንኳን ወደ Canvas-Restaurant በሰላም መጡ!
        </h1>
        <p className="text-xl md:text-2xl mb-6 md:mb-8 text-gray-100 relative z-10 drop-shadow-md">
          ምን ይፈልጋሉ? ሁሉም እኛ ጋር ይገኛል
        </p>
        <button 
          onClick={() => setCurrentScreen('order')} 
          className="bg-yellow-500 text-black px-10 py-4 rounded-full text-lg font-bold hover:scale-105 transition transform relative z-10 shadow-xl"
        >
          አሁኑኑ ይዘዙን!
        </button>
      </header>

      {/* Project/Food Grid */}
      <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {projects.map((p) => (
          <div key={p._id} className="bg-white p-4 rounded-xl shadow-lg hover:shadow-2xl transition">
            <img src={p.imageUrl} alt={p.title} className="w-full h-48 object-cover rounded-lg" />
            <h3 className="text-center mt-4 font-bold text-lg">{p.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
