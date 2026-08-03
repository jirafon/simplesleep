import React from 'react';
import Schwager from '../assets/logo-schwager.png';
import Bago from '../assets/logo-bago.png';
import Mapsa from '../assets/logo-larrain.png';
import SC1 from '../assets/sc1.png';
import Ese from '../assets/ese.png';
import DeCapital from '../assets/decapital.png';

import SC2 from '../assets/sc3.png';
import SC3 from '../assets/sc2.png';

import SC4 from '../assets/sc4.png';
import Life4 from '../assets/life4logo.png';

import ADS from '../assets/logoads2.png';
import Gruas from '../assets/logo-gruas5.png';
import Slider from "react-slick";
import Dimerco from '../assets/dimercologo.png';

import ComplianceGC from '../assets/compliancegc.png';
import ComplianceTracker from '../assets/ctracker.png';
import Unbiax from '../assets/unbiax13.png';

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
const Clients = () => {
 
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 4, // Decrease this value to reduce space between logos
        slidesToScroll: 1,
        responsive: [
          {
            breakpoint: 1024,
            settings: {
              slidesToShow: 3,
              slidesToScroll: 1,
              infinite: true,
              dots: true
            }
          },
          {
            breakpoint: 600,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 1,
              initialSlide: 1
            }
          }
        ]
      };
      
      
  return (
    <div id="Clients" className="Clients">
      <div className='w-full bg-white py-16 px-4'>
        <div className='max-w-[1240px] mx-auto text-center'>
          {/* Title */}
          <h6 className='md:text-4xl sm:text-3xl text-2xl font-bold py-2'>Organizacións que confían en Unbiax</h6>

          <Slider {...settings}>
  <div>
    <a href={Schwager} target="_blank" rel="noopener noreferrer" className="logo-wrapper">
      <img className='w-[200px] mx-2 my-auto' src={Schwager} alt='Schwager' />
    </a>
  </div>
  <div>
    <a href={Bago} target="_blank" rel="noopener noreferrer" className="logo-wrapper">
      <img className='w-[200px] mx-2 my-auto' src={Bago} alt='Bago' />
    </a>
  </div>
  <div>
    <a href={Mapsa} target="_blank" rel="noopener noreferrer" className="logo-wrapper">
      <img className='w-[200px] mx-2 my-8' src={Mapsa} alt='Mapsa' />
    </a>
  </div>
  <div>
    <a href={DeCapital} target="_blank" rel="noopener noreferrer" className="logo-wrapper">
      <img className='w-[200px] mx-2 my-8' src={DeCapital} alt='DeCapital' />
    </a>
  </div>
  <div>
    <a href={Life4} target="_blank" rel="noopener noreferrer" className="logo-wrapper">
      <img className='w-[200px] mx-2 my-8' src={Life4} alt='Life4' />
    </a>
  </div>
  <div>
    <a href={Gruas} target="_blank" rel="noopener noreferrer" className="logo-wrapper">
      <img className='w-[200px] mx-2 my-8' src={Gruas} alt='Gruas' />
    </a>
  </div>
  <div>
    <a href={ADS} target="_blank" rel="noopener noreferrer" className="logo-wrapper">
      <img className='w-[200px] mx-2 my-8' src={ADS} alt='ADS' />
    </a>
  </div>
  <div>
    <a href={ComplianceTracker} target="_blank" rel="noopener noreferrer" className="logo-wrapper">
      <img className='w-[200px] mx-2 my-8' src={ComplianceTracker} alt='ADS' />
    </a>
  </div>

  
  <div>
    <a href={ComplianceGC} target="_blank" rel="noopener noreferrer" className="logo-wrapper">
      <img className='w-[200px] mx-2 my-8' src={ComplianceGC} alt='ADS' />
    </a>
  </div>
  <div>
    <a href={ADS} target="_blank" rel="noopener noreferrer" className="logo-wrapper">
      <img className='w-[200px] mx-2 my-8' src={ADS} alt='ADS' />
    </a>
  </div>  <div>
    <a href={SC3} target="_blank" rel="noopener noreferrer" className="logo-wrapper">
      <img className='w-[200px] mx-2 my-8' src={SC3} alt='SC3' />
    </a>
  </div>  
  <div>
    <a href={SC2} target="_blank" rel="noopener noreferrer" className="logo-wrapper">
      <img className='w-[200px] mx-2 my-8' src={SC2} alt='SC2' />
    </a>
  </div>  
  <div>
    <a href={SC4} target="_blank" rel="noopener noreferrer" className="logo-wrapper">
      <img className='w-[200px] mx-2 my-8' src={SC4} alt='SC4' />
    </a>
  </div>
  <div>
    <a href={SC1} target="_blank" rel="noopener noreferrer" className="logo-wrapper">
      <img className='w-[200px] mx-2 my-8' src={SC1} alt='SC1' />
    </a>
  </div>  <div>
    <a href={Ese} target="_blank" rel="noopener noreferrer" className="logo-wrapper">
      <img className='w-[200px] mx-2 my-8' src={Ese} alt='Ese' />
    </a>
  </div>
  <div>
    <a href={Unbiax} target="_blank" rel="noopener noreferrer" className="logo-wrapper">
      <img className='w-[200px] mx-2 my-8' src={Unbiax} alt='ADS' />
    </a>
  </div>
</Slider>



        </div>
      </div>
    </div>
  );
};

export default Clients;
