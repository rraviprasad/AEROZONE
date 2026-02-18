import React from 'react';

const Baught1 = ({
    value = "52 BOI",
    label = "BOI",
    bgColor = "bg-black",
    hoverScale = "hover:scale-105",
    bare = false
}) => {
    const content = (
        <div className={`${bare ? "" : bgColor + " clip-angled p-3"} text-center h-full relative overflow-hidden flex flex-col items-center justify-center`}>
            <div className="relative z-10 ">
                <div className="text-2xl font-bold text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.3)] group-hover:drop-shadow-[0_0_15px_rgba(251,146,60,0.5)] transition-all duration-300 flex flex-row items-baseline justify-center gap-2">
                    {value}<h3 className='text-orange-400 text-lg'>Items</h3>
                </div>
                <div className="text-sm font-semibold text-white group-hover:text-orange-200 transition-colors duration-300">
                    {label}
                </div>
            </div>
        </div>
    );

    if (bare) return content;

    return (
        <div className={`relative w-full h-full group ${hoverScale} transition-all duration-300 drop-shadow-lg `}>
            <div className="bg-gradient-to-br from-orange-600 to-orange-800 p-[1px] clip-angled h-full">
                {content}
            </div>
        </div>
    );
};

export default Baught1;