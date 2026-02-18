import React from "react";
import PlaneLoader from "./PlaneLoader";

const PageTransitionLoader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-md z-[9999]">
      <PlaneLoader/>
    </div>
  );
};

export default PageTransitionLoader;
