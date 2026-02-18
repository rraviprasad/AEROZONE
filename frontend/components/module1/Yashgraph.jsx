import React from 'react';

const Yashgraph = ({ fullWidth = false }) => {
  return (
    <div className={`${fullWidth ? 'col-span-1 md:col-span-2 lg:col-span-2' : ''} bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 hover:scale-105`}>
      <div className="text-sm text-gray-600 mb-4">Performance Overview</div>
      <div className="flex items-end justify-between h-24">
        <div className="bg-blue-500 hover:bg-blue-600 transition-all duration-300 rounded-t" style={{height: '65%', width: '14%'}}></div>
        <div className="bg-blue-500 hover:bg-blue-600 transition-all duration-300 rounded-t" style={{height: '45%', width: '14%'}}></div>
        <div className="bg-blue-500 hover:bg-blue-600 transition-all duration-300 rounded-t" style={{height: '80%', width: '14%'}}></div>
        <div className="bg-blue-500 hover:bg-blue-600 transition-all duration-300 rounded-t" style={{height: '30%', width: '14%'}}></div>
        <div className="bg-blue-500 hover:bg-blue-600 transition-all duration-300 rounded-t" style={{height: '55%', width: '14%'}}></div>
        <div className="bg-blue-500 hover:bg-blue-600 transition-all duration-300 rounded-t" style={{height: '70%', width: '14%'}}></div>
        <div className="bg-blue-500 hover:bg-blue-600 transition-all duration-300 rounded-t" style={{height: '40%', width: '14%'}}></div>
      </div>
    </div>
  );
};

export default Yashgraph;
