// components/navbar2.jsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Uploadfrom2 from './Uploadfrom2';

// Converted LayoutGrid component using standard React and Tailwind CSS
const LayoutGrid = ({ width = 20, height = 20, strokeWidth = 2, stroke = "#ffffff", ...props }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        cursor: "pointer",
        userSelect: "none",
        padding: "2px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox="0 0 15 15"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Top-left rectangle */}
        <rect
          width="5"
          height="5"
          x={isHovered ? "1" : "2"}
          y={isHovered ? "1" : "2"}
          rx="1"
          style={{
            transition: "all 0.3s ease",
          }}
        />
        {/* Top-right rectangle */}
        <rect
          width="5"
          height="5"
          x={isHovered ? "9" : "8"}
          y={isHovered ? "1" : "2"}
          rx="1"
          style={{
            transition: "all 0.3s ease",
          }}
        />
        {/* Bottom-left rectangle */}
        <rect
          width="5"
          height="5"
          x={isHovered ? "1" : "2"}
          y={isHovered ? "9" : "8"}
          rx="1"
          style={{
            transition: "all 0.3s ease",
          }}
        />
        {/* Bottom-right rectangle */}
        <rect
          width="5"
          height="5"
          x={isHovered ? "9" : "8"}
          y={isHovered ? "9" : "8"}
          rx="1"
          style={{
            transition: "all 0.3s ease",
          }}
        />
      </svg>
    </div>
  );
};

// ChevronDown component for dropdown indicators
const ChevronDown = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-4 w-4 ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

// Custom Navigation Item with Dropdown
const NavItemWithDropdown = ({
  title,
  navigationPath,
  dropdownOpen,
  onToggleDropdown,
  onUploadClick,
  children
}) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        {/* Main navigation button */}
        <button
          onClick={() => window.location.href = navigationPath}
          className="flex-1 text-left px-3 py-2 text-xs font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
        >
          {title}
        </button>

        {/* Dropdown toggle button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleDropdown();
          }}
          className="p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
        >
          <ChevronDown className={`transform transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown content */}
      {dropdownOpen && (
        <div className="ml-4 mt-1">
          {children}
        </div>
      )}
    </div>
  );
};

const Navbar2 = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showUploadForm2, setShowUploadForm2] = useState(false);
  const navbarRef = useRef(null);

  // Close navbar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setIsOpen(false);
        setOpenDropdowns({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle dropdown
  const toggleDropdown = (name) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  // Handle upload form toggles

  const handleUploadForm = () => {
    setShowUploadForm(!showUploadForm);
    setOpenDropdowns({}); // close all dropdowns
  };


  const handleUploadForm2 = () => {
    setShowUploadForm2(!showUploadForm2);
    setOpenDropdowns({}); // close all dropdowns
  };


  return (
    <>
      {/* Menu Toggle Button - Made smaller */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-1 rounded-md bg-gray-800 dark:bg-gray-200 shadow-md"
        aria-label="Toggle navigation menu"
      >
        <LayoutGrid stroke={isOpen ? "#ef4444" : "#ffffff"} />
      </button>



      {/* Navbar Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsOpen(false)} />
      )}

      {/* Navbar - Made narrower and more compact */}
      <div
        ref={navbarRef}
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Navbar Header - Reduced padding and font size */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Navigation</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
              aria-label="Close navigation menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Items - Reduced padding and font size */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {/* Home Button */}
            <button
              onClick={() => window.location.href = '/'}
              className="w-full text-left px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 flex items-center"
            >
              Home
            </button>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

            {/* Module 1 Dropdown */}
            <div>
              <button
                onClick={() => setOpenDropdowns(prev => ({ ...prev, module1: !prev.module1 }))}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 flex items-center justify-between"
              >
                <span>Module 1</span>
                <ChevronDown className={`transform transition-transform ${openDropdowns['module1'] ? 'rotate-180' : ''}`} />
              </button>

              {openDropdowns['module1'] && (
                <div className="ml-4 mt-1 space-y-1">
                  {/* Main Chart with custom dropdown */}
                  <NavItemWithDropdown
                    title="Main Chart"
                    navigationPath="/data"
                    dropdownOpen={openDropdowns['mainChart']}
                    onToggleDropdown={() => toggleDropdown('mainChart')}
                  >
                    <button
                      onClick={handleUploadForm}
                      className="w-full text-left px-3 py-2 text-xs font-medium rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                    >
                      future implementation
                    </button>
                  </NavItemWithDropdown>

                  {/* Reference B with custom dropdown */}
                  <NavItemWithDropdown
                    title="Reference B"
                    navigationPath="/data2"
                    dropdownOpen={openDropdowns["referenceB"]}
                    onToggleDropdown={() => toggleDropdown("referenceB")}
                  >
                    <button
                      onClick={handleUploadForm2}
                      className="w-full text-left px-3 py-2 text-xs font-medium rounded-md text-gray-500 hover:bg-gray-100 transition-colors duration-200"
                    >
                      future implementation
                    </button>

                  </NavItemWithDropdown>



                  {/* PDF to JSON */}
                  <button
                    onClick={() => window.location.href = '/pdf-to-json'}
                    className="w-full text-left px-3 py-2 text-xs font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                  >
                    PDF to JSON
                  </button>
                </div>
              )}
            </div>

            {/* Future Modules Dropdown */}
            <div>
              <button
                onClick={() => setOpenDropdowns(prev => ({ ...prev, futureModules: !prev.futureModules }))}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 flex items-center justify-between"
              >
                <span>Future Modules</span>
                <ChevronDown className={`transform transition-transform ${openDropdowns['futureModules'] ? 'rotate-180' : ''}`} />
              </button>

              {openDropdowns['futureModules'] && (
                <div className="ml-4 mt-1 space-y-1">
                  <button
                    className="w-full text-left px-3 py-2 text-xs font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                  >
                    Module 2 (Coming Soon)
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 text-xs font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                  >
                    Module 3 (Coming Soon)
                  </button>
                </div>
              )}
            </div>
          </nav>


        </div>
      </div>

      {/* Upload Form Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Upload Excel for Main Chart</h3>
              <button
                onClick={() => setShowUploadForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Add your UploadForm component here */}
            {/* Render Uploadfrom2 when the user clicks the dropdown button */}
            {showUploadForm2 && (
              <div className="text-center py-4">
                <Uploadfrom2 onUpload={handleFileUpload} />
              </div>
            )}

          </div>
        </div>
      )}

      {/* Upload Form 2 Modal */}
      {showUploadForm2 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Upload Excel for Reference B</h3>
              <button
                onClick={() => setShowUploadForm2(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Add your UploadForm2 component here */}
            <div className="text-center py-4">
              <Uploadfrom2 onUpload={handleFileUpload} />
            </div>
          </div>
        </div>
      )}




      {/* Add animation keyframes */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default Navbar2;