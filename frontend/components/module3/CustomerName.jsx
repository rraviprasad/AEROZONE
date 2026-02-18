import React from "react";

const CustomerName = ({ values = [], selectedCustomer, onSelectCustomer }) => {
    // ✅ Remove duplicates & ignore empty/null/undefined
    const uniqueValues = [...new Set(values.filter(Boolean))];

    
    return (
        <div className="relative w-249 group transition-all duration-300 drop-shadow-lg hover:drop-shadow-xl">
            <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-[1px] clip-angled h-full">
                <div className="bg-black clip-angled p-4 h-13 flex flex-row items-center">
                    <div className="text-xs text-center font-bold text-white mb-1">
                        Customers
                        <span className=" text-xs ml-2 ">
                            {` (${uniqueValues.length})`}
                        </span>
                    </div>
                    {uniqueValues.length === 0 ? (
                        <div className="text-purple-500 text-xs">No data found</div>
                    ) : (
                        <div className="flex flex-row  overflow-x-auto gap-2 py-1 scrollbar-hide">
                            <div className="flex flex-row  gap-1 mb-2">
                                {uniqueValues.map((item, idx) => {
                                    const isActive = selectedCustomer === item;

                                    return (
                                        <span
                                            key={idx}
                                            onClick={() => onSelectCustomer(item)}
                                            className={`px-6 py-1 h-7 whitespace-nowrap text-xs font-semibold items-center border clip-angled cursor-pointer transition-all
                                                ${isActive
                                                    ? "bg-purple-600 text-white  border-purple-500 scale-105 shadow-md shadow-purple-500/30"
                                                    : "bg-purple-800/30 hover:transition-transform duration-700 border-purple-700/50 hover:bg-purple-900/80 text-purple-300 hover:text-purple-200"
                                                }
                                            `}
                                        >
                                            {item}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default CustomerName;
