import React from 'react';
import Single from '../assets/single.png';
import Double from '../assets/double.png';
import Triple from '../assets/triple.png';
import Multi from '../assets/multi.png';

const Cards = () => {
  return (
    <div className='w-full py-[10rem] px-4 bg-white'>
      <div className='max-w-[1240px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8'>
        {/* Small Card */}
        
        <div className='w-full sm:w-auto shadow-xl flex flex-col p-4 my-4 rounded-lg hover:scale-105 duration-300'>
          
          <img className='w-20 mx-auto mt-[-3rem] bg-white' src={Single} alt="Single" />
          <h2 className='text-2xl font-bold text-center py-8'>Small</h2>
          <p className='text-center text-4xl font-bold'>15 UF /  Mensual</p>
          <div className='text-center font-medium'>
            <p className='py-2 border-b mx-8'>100 Mb Almacenamiento</p>
            <p className='py-2 border-b mx-8'>50 Itemes</p>

            <p className='py-2 border-b mx-8 mt-8'>Módulos: Levantamiento de datos y Riesgos  </p>
            <p className='py-2 border-b mx-8 mt-8'>Setup Fee: 25 UF+ IVA </p>




          </div>
        </div>


        {/* Mid Card */}
        <div className='w-full sm:w-auto shadow-xl flex flex-col p-4 my-4 rounded-lg hover:scale-105 duration-300'>
        <img className='w-20 mx-auto mt-[-3rem] bg-white' src={Double} alt="double" />

          <h2 className='text-2xl font-bold text-center py-8'>STARTER</h2>
          <p className='text-center text-4xl font-bold'>45 UF / Mensual</p>

          <div className='text-center font-medium'>

            <p className='py-2 border-b mx-8'>500 Mb Almacenamiento</p>
            <p className='py-2 border-b mx-8'>200 Itemes</p>

            <p className='py-2 border-b mx-8 mt-8'>Módulos: Levantamiento de datos y Riesgos  </p>
            <p className='py-2 border-b mx-8 mt-8'>Setup Fee: 100 UF+ IVA </p>





          </div>
        </div>

        {/* Pro Card */}
        <div className='w-full sm:w-auto shadow-xl flex flex-col p-4 my-4 rounded-lg hover:scale-105 duration-300'>
        <img className='w-20 mx-auto mt-[-3rem] bg-white' src={Triple} alt="triple" />

          <h2 className='text-2xl font-bold text-center py-8'>PRO</h2>
          <p className='text-center text-4xl font-bold'>140 UF / Mensual</p>
          <div className='text-center font-medium'>
            <p className='py-2 border-b mx-8'>1 Gb Almacenamiento</p>
            <p className='py-2 border-b mx-8'>1000 Itemes</p>

            <p className='py-2 border-b mx-8 mt-8'>Módulos: Levantamiento de datos y Riesgos  </p>
            <p className='py-2 border-b mx-8 mt-8'>Setup Fee: 250 UF+ IVA </p>



          </div>
        </div>

        {/* Enterprise Card 
        <div className='w-full sm:w-auto shadow-xl flex flex-col p-4 my-4 rounded-lg hover:scale-105 duration-300'>
        <img className='w-20 mx-auto mt-[-3rem] bg-white' src={Multi} alt="multi" />

          <h2 className='text-2xl font-bold text-center py-8'>ENTERPRISE</h2>
          <p className='text-center text-4xl font-bold'>198 UF / Mensual</p>
          <div className='text-center font-medium'>
            <p className='py-2 border-b mx-8 mt-8'>5.000 Declaraciones Anuales</p>
            <p className='py-2 border-b mx-8'>20 Usuarios Admin</p>
            <p className='py-2 border-b mx-8'>2Gb Canal Denuncias </p>
            <p className='py-2 border-b mx-8'>0,5 UF/ Consultas en Compliance Tracker </p>
            <p className='py-2 border-b mx-8'>5 Licencias E-learning</p>

          </div>
        </div>

        <div className='w-full sm:w-auto shadow-xl flex flex-col p-4 my-4 rounded-lg hover:scale-105 duration-300'>
          
          <img className='w-20 mx-auto mt-[-3rem] bg-white' src={Multi} alt="Multi" />
          <h2 className='text-2xl font-bold text-center py-8'>CUSTOM</h2>
          <p className='text-center text-4xl font-bold'>Contactenos</p>
          <div className='text-center font-medium'>
            <p className='py-2 border-b mx-8 mt-8'>+2.000 Declaraciones Anuales</p>
            <p className='py-2 border-b mx-8'>Campañas</p>
            <p className='py-2 border-b mx-8'>Diligencia Debida</p>
            <p className='py-2 border-b mx-8'>Repositorio</p>
            <p className='py-2 border-b mx-8'>Canal Denuncias</p>
            <p className='py-2 border-b mx-8'>Gestor de Reuniones</p>
            <p className='py-2 border-b mx-8 mt-8'>Formularios Especiales</p>
            <p className='py-2 border-b mx-8 mt-8'>Exportacion Customizada</p>
            <p className='py-2 border-b mx-8 mt-8'>Módulos: Repositorio, Transferencia de Valor, Diligencia Debida, Reuniones, Conflictos de Interés, Canal de Denuncias.  
</p>




          </div>
        </div>
        */}
      </div>
    </div>
  );
};

export default Cards;
