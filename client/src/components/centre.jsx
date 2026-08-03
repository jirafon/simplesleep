import React from 'react';
import image1 from '../assets/anim2.gif'; // Adjust the path as needed
import services from '../assets/services.png'; // Adjust the path as needed

const Analytics = () => {
  return (
    <section id="ventajas" className="relative">

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
            Trust in your data is key to driving innovation and achieving results.
          </p>
          <p className="text-lg md:text-xl leading-7">
            Unbiax is a next-generation enterprise solution by leveraging advanced Retrieval-Augmented Generation (RAG) technology, Unbiax enables organizations to effortlessly 
            search, retrieve, and generate actionable information from their internal data sources. It integrates with third-party 
            software and systems, facilitating access to internal knowledge for employees and enhancing productivity and 
            decision-making across the organization.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center space-y-6">
         
          <img
            src={services}
            alt="Services"
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
