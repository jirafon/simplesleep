import React from 'react';
import image1 from '../assets/anim2.gif'; // Adjust the path as needed
import agents from '../assets/agents.png'; // Adjust the path as needed
import services from '../assets/services.png'; // Adjust the path as needed

const Analytics = () => {
  return (
    <section id="FAQ" className="FAQ">

    <div
      className="w-full bg-black text-white py-16 px-4"
      style={{
        backgroundImage: `url(${image1})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="max-w-[1240px] mx-auto grid md:grid-cols-2 gap-8 bg-black bg-opacity-60 rounded-lg p-8">
        {/* Left Section */}
        <div className="flex flex-col justify-center text-left pl-8 md:pl-16">
          <p className="text-2xl md:text-4xl font-bold mb-6 leading-relaxed">
            Agents Library for Complex Industries
          </p>
          <p className="text-lg md:text-xl leading-7">
            Explore our library of agents tailored for solving challenges in complex industries.
          </p>
        </div>

        {/* Right Section */}
        <div className="flex flex-col items-center justify-center space-y-6">
          <img
            src={agents}
            alt="Agents"
            className="rounded-lg shadow-lg"
            style={{ width: '250%', height: 'auto' }} // Increased size by 50%
          />
        
        </div>
      </div>
    </div>
    </section>

  );
};

export default Analytics;
