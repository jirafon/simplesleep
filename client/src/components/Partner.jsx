import React from 'react';
import Laptop from '../assets/compliancegc.png';
import Partner1 from '../assets/partner1.png';
import Unbiax from '../assets/unbiax13.png';
import Ctracker from '../assets/ctracker.png';

const About = () => {
  const laptopLink = "https://compliancegc.com/";
  const unbiaxLink = "https://unbiax.com/";
  const ctrackerlink = "https://compliance-tracker.com/";

  return (
    <div id="about" className="about">
      <div className='w-full bg-white py-16 px-4'>
        <div className='max-w-[1240px] mx-auto text-center'>
          {/* Title */}
          <h6 className='md:text-4xl sm:text-3xl text-2xl font-bold py-2'>Nuestros Partners</h6>

          {/* Logos Row */}
          <div className='flex flex-wrap justify-center'>
            <a href={laptopLink} target="_blank" rel="noopener noreferrer">
              <img className='w-[250px] mx-2 my-8' src={Laptop} alt='Laptop' />
            </a>
            <a href={ctrackerlink} target="_blank" rel="noopener noreferrer">
              <img className='w-[250px] mx-2 my-8' src={Ctracker} alt='Ctracker' />
            </a>
            <a href={unbiaxLink} target="_blank" rel="noopener noreferrer">
              <img className='w-[100px] mx-2 my-8' src={Unbiax} alt='Unbiax' />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
