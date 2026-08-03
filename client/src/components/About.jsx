import React from 'react';
import Laptop from '../assets/team2.png';
import GG from '../assets/biogg.png';
import CH from '../assets/bioch.png';

const About = () => {
  return (
    <div id="about" className="about">
      <div className='w-full bg-white py-16 px-4'>
        <div className='max-w-[1240px] mx-auto grid md:grid-cols-2'>
          <img className='w-[900px] mx-auto my-4' src={Laptop} alt='/' />
          <div className='flex flex-col justify-center'>
            <p className='text-[#00df9a] font-bold '></p>
            <h1 className='md:text-4xl sm:text-3xl text-2xl font-bold py-2'></h1>
            <p>
            </p>
       
          
            <img className='w-[150px] mx-auto my-4' src={CH} alt='/' />
            <div>
            <h6 className='md:text-4xl sm:text-3xl text-2xl font-bold py-2'>Cristian Haquin</h6>
            <h6 className='md:text-2xl sm:text-3xl text-2xl  py-2'>Managing Director</h6>

              <p>
              Cristian es Ingeniero Civil Industrial de la Universidad de Santiago, com título MBA en Negocios Internacionales de la U. Federico Santa Maria. Trabajó en empresas  líderes como Siemens y BHP Billiton. Su experiencia abarca liderar áreas de negocios, manejo y gestión de datos, diseño de procesos y  desarrollo de Hardware y Software, incluyendo habilidades en Machine Learning, LLM y Computer Vision. Además de tener su experiencia en consultoria a empresas, es Full-Stack Developer y arquitecto de soluciones. 
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
