import React, { useState } from 'react';
import unsplash from '../assets/fondo-hero@2x.png';
import Description from './Description'; // Import the Description component

const Hero = () => {
  const [nav, setNav] = useState(false);

  const handleNav = () => {
    setNav(!nav);
  };

  const handleLogin = () => {
    window.location.replace('https://unbiax.onrender.com');
  };

  const handleSmoothScroll = (event, targetId) => {
    event.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
    setNav(false); // Close the mobile menu after clicking the link
  };

  return (
    <>
      <div id="inicio" className="inicio relative h-screen bg-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={unsplash}
            alt="Background"
            className="w-full h-full object-cover"
            style={{ height: '130vh' }} // Extend the height of the background image by 30%
          />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <div className="text-black mb-8">
            <p className="font-bold text-4xl lg:text-5xl mb-4 px-4 lg:px-[20%]" style={{ fontSize: '300%' }}>
              Maneja tus procesos de compliance en un solo lugar, de manera segura.
            </p>
            <p className="text-2xl lg:text-3xl px-4 lg:px-[15%]" style={{ fontSize: '100%', marginTop: '2rem' }}>
              Unbiax es una plataforma de software robusta que simplifica el cumplimiento ético y la gestión de conflictos en tu organización.
            </p>
          </div>
          <div className="flex flex-wrap justify-center space-x-4 px-4 lg:px-[15%] mt-8">
            <button className="nav-button nav-button-demo" onClick={handleLogin}>
              Solicita un demo
            </button>
            <button className="nav-button nav-button-entrar" onClick={handleLogin}>
              Diagnóstico en Línea
            </button>
          </div>
        </div>

        {/* Video Section */}
        <div className="relative z-20 w-full flex justify-center mt-12">
          <div style={{ position: 'relative', paddingBottom: '39.375%', height: 0, width: '80%' }}>
            <iframe
              allow="autoplay; gyroscope; fullscreen;"
              allowFullScreen
              src="https://studio.youtube.com/video/yyfutyFPfX8/edit"
              style={{ border: '0', height: '100%', width: '100%', position: 'absolute', top: '0' }} // Adjust top positioning as needed
              title="Video Unbiax"
            ></iframe>
          </div>
        </div>
        
        <Description /> {/* Add the Description component */}
      </div>
    </>
  );
};

export default Hero;
