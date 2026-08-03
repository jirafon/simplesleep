import React from 'react';
import Control from '../assets/cont3.png';

const Analytics = () => {
  return (
    <div className='w-full bg-black py-16 px-4'> {/* Cambia 'bg-gray-100' por el color de fondo que prefieras */}
      <div className='max-w-[1240px] mx-auto grid md:grid-cols-1'>
        <div className='flex flex-col items-center justify-center'>
          <h1 className='md:text-4xl sm:text-3xl text-2xl font-bold py-2'> {/* Añade el texto del título aquí si es necesario */}
            {/* Puedes agregar un título aquí */}
          </h1>
          <div style={{ position: 'relative', paddingBottom: '39.375%', height: 0, overflow: 'hidden', width: '70%' }}>
            <iframe
              allow="autoplay; gyroscope; fullscreen;"
              allowFullScreen
              height="100%"
              referrerPolicy="strict-origin"
              src="https://www.kapwing.com/e/66ce08baa2c185829910aee4"
              style={{ border: '0', height: '100%', left: '0', position: 'absolute', top: '0', width: '100%' }}
              title="Video Unbiax"
              width="100%"
              
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
