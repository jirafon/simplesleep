import React from 'react';
import logo1 from '../assets/beneficios-reputacion@2x.png'; // Adjust the path as needed
import logo2 from '../assets/beneficios-seguridad@2x.png'; // Adjust the path as needed
import logo3 from '../assets/beneficios-tiempo@2x.png'; // Adjust the path as needed

const Analytics = () => {
  return (
    <div className='w-full' style={{ backgroundColor: 'rgb(0, 0, 0)' }}> {/* Set background to black */}
      <div className='py-16 px-4'>
        <div className='max-w-[1240px] mx-auto text-center mb-8'>
          <h1 className='text-4xl font-bold mb-4 text-white'>Improve your organization</h1> {/* White text */}
        </div>
        <div className='mx-auto grid md:grid-cols-1 lg:grid-cols-3 gap-8 items-center'>
          <div
            className='p-6 border border-gray-300 rounded-md flex flex-col justify-center items-center relative'
            style={{ backgroundColor: 'rgb(20, 23, 37)', color: 'white', height: '200px' }} // Adjusted color
          >
            <h2 className='text-2xl font-bold mb-4 text-center'>Workflow Builder for Responsible Knowledge Base</h2>
            <p className='text-center'>Design workflows that ensure data is managed responsibly and efficiently.</p>
          </div>
          <div
            className='p-6 border border-gray-300 rounded-md flex flex-col justify-center items-center relative'
            style={{ backgroundColor: 'rgb(20, 23, 37)', color: 'white', height: '200px' }} // Adjusted color
          >
            <h2 className='text-2xl font-bold mb-4 text-center'>Risk Analysis with Rich Data</h2>
            <p className='text-center'>Analyze complex datasets to mitigate risks across legal, compliance, and project management tasks.</p>
          </div>
          <div
            className='p-6 border border-gray-300 rounded-md flex flex-col justify-center items-center relative'
            style={{ backgroundColor: 'rgb(20, 23, 37)', color: 'white', height: '200px' }} // Adjusted color
          >
            <h2 className='text-2xl font-bold mb-4 text-center'>Generate Actions Based on Your Tailored Needs</h2>
            <p className='text-center'>Create customized actions for compliance, risk assessment, and project needs based on your specifications.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
