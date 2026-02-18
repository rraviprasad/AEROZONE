import React from 'react'


const RMSupplier = ({  label, suppliers }) => {



label="RM"
  return (
    <div className="bg-[var(--card)] p-4 py-1 w-full h-30 rounded-md  shadow">
      <div className="text-sm font-semibold text-[var(--color-primary)]">{label} </div>
        <div className="h-[90%] text-xs text-left overflow-y-auto scrollbar-hide text-wrap mt-1">
        {suppliers && Object.entries(suppliers).map(([code, sups]) => (
          <div key={code} className="mt-2 text-xs">
            <ul className="list-disc pl-4 space-y-1"> 
              {Array.from(sups).map((supplier, idx) => (
                <li key={idx}>{supplier} </li>  
                
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RMSupplier