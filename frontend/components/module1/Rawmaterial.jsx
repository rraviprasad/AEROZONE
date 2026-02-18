import React from 'react';

const Rawmaterial = ({ 
  value = "123 RM", 
  label = "RM",
  valueColor = "text-blue-600",
  labelColor = "text-gray-600",
  bgColor = "bg-white",
  hoverScale = "hover:scale-105"
}) => {
  return (
    <div className={`${bgColor} text-center align-middle rounded-md shadow-md p-4 hover:shadow-lg transition-all duration-300 ${hoverScale}`}>
      <div className='flex flex-row justify-center gap-2 items-center'>
      <div className={`text-2xl font-bold ${valueColor} mb-1`}>{value} </div>
      <h4 className={`text-lg font-semibold ${valueColor}`}>Items</h4>
      </div>
      <div className={`text-sm font-semibold ${labelColor}`}>{label}</div>
    </div>
  );
};

export default Rawmaterial;