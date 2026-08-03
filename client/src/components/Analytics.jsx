import React from 'react';
import QuotationMarks from '../assets/comillas@2x.png'; // Asegúrate de que la ruta sea correcta
import XimenaPhoto from '../assets/ximena.png'; // Asegúrate de que la ruta sea correcta

const Analytics = () => {
  return (
    <div className='w-full bg-white py-16 px-4'>
      <div className='max-w-[1240px] mx-auto flex flex-col items-center'>
        <div className='relative max-w-[800px] mx-auto p-6'>
          <img 
            src={QuotationMarks} 
            alt="Gráfico de comillas" 
            className='absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-16 h-16' 
          />
          <div className='flex items-start'>
            <div className='ml-20'> {/* Ajusta el margen a la izquierda según sea necesario */}
              <p className='text-lg leading-relaxed'>
              Puede producir un impacto increíble en la mejora del flujo de trabajo de sus empleados. Los resúmenes de proyectos, guías técnicas y la estructura organizacional se pueden encontrar fácilmente a través de Unbiax. Puede dar ayuda a encontrar información precisa y relevante de manera rápida y sencilla, reduciendo el esfuerzo, el trabajo innecesario y el tiempo perdido.              </p>
              <div className='pt-6 flex items-center'>
               
                <div>
                  <p className='font-bold text-xl'></p>
                  <p className='text-gray-600'></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
