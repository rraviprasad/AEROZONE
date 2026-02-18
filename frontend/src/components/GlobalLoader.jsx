import React from "react";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const planeAnimationUrl = "https://assets-v2.lottiefiles.com/a/ae3f60b8-de97-11ef-80ba-fbdf8f76c6db/nlYrATOFBm.lottie";

const GlobalLoader = ({ loading }) => {
    if (!loading) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md transition-all duration-300">
            <div className="w-64 h-64 md:w-96 md:h-96 relative">
                {/* 
            Color Adjustment:
            In Light Mode (default): The plane is likely dark/colored.
            In Dark Mode: We want it White.
            We use CSS filters to invert the color in dark mode.
         */}
                <div className="dark:invert dark:brightness-200 transition-all duration-300 w-full h-full">
                    <DotLottieReact
                        src={planeAnimationUrl}
                        loop
                        autoplay
                        style={{ width: '100%', height: '100%' }}
                    />
                </div>
            </div>
            {/* <div className="mt-4 font-bold text-xl tracking-wider text-foreground opacity-80 animate-pulse">
                LOADING
            </div> */}
        </div>
    );
};

export default GlobalLoader;
