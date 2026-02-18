import React from 'react'

const BOISupplier = ({ label, suppliers }) => {
    return (
        <div className="relative w-full h-34 group transition-all duration-300 drop-shadow-lg hover:drop-shadow-xl">
            <div className="bg-gradient-to-br from-orange-600 to-orange-800 p-[1px] clip-angled h-full">
                <div className="bg-gray-900 clip-angled p-4 py-2 h-full w-full">
                    <div className="text-orange-400 font-semibold">
                        {label}
                    </div>

                    <div className="h-[80%] text-sm text-left overflow-y-auto scrollbar-hide text-wrap mt-1 text-orange-300">
                        {suppliers && Object.entries(suppliers).map(([code, sups]) => (
                            <div key={code} className="mt-2">
                                <ul className="list-disc pl-4 space-y-1">
                                    {Array.from(sups).map((supplier, idx) => (
                                        <li key={idx} className="hover:text-orange-200 transition-colors duration-200">{supplier}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BOISupplier;
