import React from 'react'

const BOISupplier = ({ label, suppliers }) => {
  label="BOI"
  return (
    <div className="bg-[var(--card)] p-4 py-1 w-full h-30 rounded-md shadow">

      <div className="text-[var(--primary)] text-sm font-semibold">
        {label}
      </div>

      <div className="h-[90%] text-xs  text-left overflow-y-auto scrollbar-hide text-wrap mt-1">
        {suppliers && Object.entries(suppliers).map(([code, sups]) => (
          <div key={code} className="mt-2">
            <ul className="list-disc pl-4 space-y-1"> 
              {Array.from(sups).map((supplier, idx) => (
                <li key={idx}>{supplier}</li>  
              ))}
            </ul>
          </div>
        ))}
      </div>

    </div>
  );
};

export default BOISupplier;
