import React, { useState } from 'react';
import image1 from '../assets/unbiax13.png'; // Cambia esto a las rutas correctas para tus imágenes
import camp from '../assets/camp.png'; // Cambia esto a las rutas correctas para tus imágenes
import formul from '../assets/app@2x7.png'; // Cambia esto a las rutas correctas para tus imágenes
import denuncias from '../assets/denuncias1.png'; // Cambia esto a las rutas correctas para tus imágenes
import declar from '../assets/aut.png'; // Cambia esto a las rutas correctas para tus imágenes

import certeval from '../assets/misd.png'; // Cambia esto a las rutas correctas para tus imágenes
import reuniones from '../assets/reuchil.png'; // Cambia esto a las rutas correctas para tus imágenes
const KeyFeatures = () => {
  const [selectedImage, setSelectedImage] = useState(image1); // Imagen por defecto

  const handleClick = (image) => {
    //setSelectedImage(image);
  };

  return (
    <section id="ventajas" className="relative">

    <div className='w-full bg-[#ecfdff] py-16 px-4'>
      <div className='max-w-[1240px] mx-auto flex flex-col md:flex-row'>
        <div className='w-full md:w-1/2'>
          <h2 className='text-3xl md:text-4xl font-bold text-center mb-8'>
            Productos
          </h2>
          <ul className='list-none space-y-4'>
              Agiliza el proceso de búsqueda de la información critica de la organización y permite a los empleados encontrar respuestas fácilmente en un solo lugar centralizado.
            <li
              className='bg-white p-4 flex items-start cursor-pointer'
              onClick={() => handleClick(reuniones)}
              style={{ maxWidth: '100%' }}
            >
              <span className='text-lg md:text-xl'>
              Descubra sus datos y aprovéchelos al máximo.
              </span>
            </li>
        
            <li
              className='bg-white p-4 flex items-start cursor-pointer'
              onClick={() => handleClick(camp)}
              style={{ maxWidth: '100%' }}
            >
              <span className='text-lg md:text-xl'>
                Concentimiento, control y campaña de uso de Datos.
              </span>
            </li>
            <li
              className='bg-white p-4 flex items-start cursor-pointer'
              onClick={() => handleClick(declar)}
              style={{ maxWidth: '100%' }}
            >
              <span className='text-lg md:text-xl'>
              Copiloto de consulta de Datos GenAI
              </span>
            </li>
        
          </ul>
        </div>
        <div className='w-full md:w-1/2 flex items-center justify-center'>
          <img src={selectedImage} alt='Selected Feature' className='max-w-full h-auto' />
        </div>
      </div>
    </div>
    </section>

  );

};

export default KeyFeatures;
