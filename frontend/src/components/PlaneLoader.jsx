import React from 'react';

const PlaneLoader = () => {
    return (
        <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Central Loading Text */}
          

            {/* Rotating Container for Plane 1 */}
            <div className="absolute inset-0 animate-spin-slow">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 transform -rotate-45">
                    <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-full h-full text-blue-600 dark:text-blue-400 drop-shadow-lg"
                    >
                        <path d="M2 12l20-9-9 20-2-9-9-2z" />
                    </svg>
                </div>
            </div>

            {/* Rotating Container for Plane 2 (Opposite side) - Delays or rotation offset can be handled by wrapper rotation */}
            <div className="absolute inset-0 animate-spin-slow" style={{ animationDelay: '-1.5s' }}>
                {/* 
            We want a second plane chasing or opposite? 
            Let's put it on the bottom (180 deg) by just rotating the wrapper? 
            Or we can just add another plane in the same container but rotated.
         */}
            </div>

            {/* 
         Better approach for "Two planes circling":
         One container rotating. Two planes inside at opposite ends.
       */}
            <div className="absolute inset-0 animate-[spin_3s_linear_infinite]">
                {/* Plane 1 (Top) */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-10 h-10">
                    <svg viewBox="0 0 512 512" className="w-full h-full text-primary fill-current transform rotate-45">
                        <path d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480V396.4c0-4 1.5-7.8 4.2-10.7L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z" />
                    </svg>
                </div>

                {/* Plane 2 (Bottom) */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 w-10 h-10 transform rotate-180">
                    <svg viewBox="0 0 512 512" className="w-full h-full text-secondary fill-current transform rotate-45">
                        <path d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480V396.4c0-4 1.5-7.8 4.2-10.7L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z" />
                    </svg>
                </div>
            </div>

            {/* Outer Ring / Track (Optional, adds to the 'radar' feel) */}
            <div className="absolute inset-4 border-2 border-dashed border-primary/20 rounded-full animate-[spin_8s_linear_infinite_reverse]"></div>
        </div>
    );
};

export default PlaneLoader;
