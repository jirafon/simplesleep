import React, { useState } from 'react';
import Control from '../assets/cont6.png';
import ImageBottomLeft from '../assets/fondo-cta-izq.svg'; // Ensure this image exists
import ImageBottomRight from '../assets/fondo-cta-der@2x.png'; // Ensure this image exists

const Analytics = () => {
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [nav, setNav] = useState(false);

  const handleNav = () => {
    setNav(!nav);
  };

  const handleLogin = () => {
    window.location.replace('https://unbiax.onrender.com');
  };

  const toggleContentVisibility = () => {
    setIsContentVisible(!isContentVisible);
  };

  return (
    <section id="news" className="relative" style={{ backgroundColor: 'black' }}>
      <div className="w-full max-w-6xl mx-auto relative z-10 px-[10%] py-24">
        <div className="flex flex-col justify-center items-center text-center relative bg-black text-white p-12 z-30">
          <h1
            className="md:text-4xl sm:text-3xl text-2xl font-bold py-2 cursor-pointer"
            onClick={toggleContentVisibility}
            aria-expanded={isContentVisible}
            style={{ fontFamily: 'serif', color: 'white' }}
          >
            Explore how Generative AI can help your business.
          </h1>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'white' }}>
            Request a demonstration now and discover the cutting edge of AI.
          </h2>
          {isContentVisible && (
            <div className="text-white text-6xl font-serif" style={{ fontSize: '180%' }}>
              {/* Optional dynamic content */}
            </div>
          )}
          <img
            src={ImageBottomLeft}
            alt="Bottom Left"
            className="absolute bottom-0 left-0 w-32 h-37 object-cover z-30"
          />
          <img
            src={ImageBottomRight}
            alt="Bottom Right"
            className="absolute bottom-0 right-0 w-32 h-32 object-cover z-30"
          />
        </div>
      </div>
    </section>
  );
};

export default Analytics;
