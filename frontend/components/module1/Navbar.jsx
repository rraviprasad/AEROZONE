"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

/* =======================
   NAV CONFIG
======================= */
const NAV_ITEMS = [
  { to: "/", label: "Home", id: "home" },
  { to: "/data2", label: "Planer Checker", id: "planner" },
  { to: "/Module2Page1", label: "Prism", id: "prism" },
  { to: "/Module3Page1", label: "Orbit", id: "orbit" },
  {
    label:"Analysis",
    id:"Analysis",
    children:[
      {to: "/Analysis1page", id:"Analysis",label:"Analysis Page 1"},
      {to: "/Analysis2page", id:"Analysis",label:"Analysis Page 2"}
    ]
  },

  {
    label: "Menu",
    id: "menu",
    children: [
      { to: "/data", id: "DataPage", label: "Main Chart", icon: "📊" },
      { to: "/pdf-to-json", id: "PdfJson", label: "PDF to JSON", icon: "📄" },
    ],
  },
];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const location = useLocation();
  const dropdownRef = useRef(null);

  /* =======================
     EFFECTS
  ======================= */
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenDropdownId(null);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleDropdown = (id) =>
    setOpenDropdownId((prev) => (prev === id ? null : id));

  const isHomePage = location.pathname === "/";

  /* =======================
     RENDER
  ======================= */
  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 pt-2 ${
        !isHomePage ? "backdrop-blur-md bg-transparent dark:bg-transparent" : ""
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* LOGO */}
        <Link to="/" className="flex items-center space-x-3">
          <img src="/logo-new.png" alt="AEROZON" className="h-9" />
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            AEROZONE
          </span>
        </Link>

        {/* =======================
            DESKTOP NAV
        ======================= */}
        <nav className="hidden md:flex items-center space-x-1" ref={dropdownRef}>
          {NAV_ITEMS.map((item) => {
            const hasChildren = !!item.children;
            const isActive =
              location.pathname === item.to ||
              (hasChildren &&
                item.children.some((c) => c.to === location.pathname));

            if (hasChildren) {
              return (
                <div key={item.id} className="relative">
                  <button
                    onClick={() => toggleDropdown(item.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center transition
                      ${
                        isActive
                          ? "bg-cyan-500/10 text-cyan-600"
                          : "text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50"
                      }`}
                  >
                    {item.label}
                    <svg
                      className={`ml-1 w-4 h-4 transition-transform ${
                        openDropdownId === item.id ? "rotate-180" : ""
                      }`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {openDropdownId === item.id && (
                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-lg py-2 border border-gray-200 dark:border-gray-700">
                      {item.children.map((child) => (
                        <Link
                          key={child.id}
                          to={child.to}
                          className={`flex items-center px-4 py-2 text-sm transition
                            ${
                              location.pathname === child.to
                                ? "bg-cyan-500/10 text-cyan-600"
                                : "hover:bg-gray-100 dark:hover:bg-gray-700/50"
                            }`}
                        >
                          <span className="mr-3">{child.icon}</span>
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.id}
                to={item.to}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition
                  ${
                    isActive
                      ? "bg-cyan-500/10 text-cyan-600"
                      : "text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50"
                  }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* =======================
            MOBILE BUTTON
        ======================= */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen((p) => !p)}
        >
          ☰
        </button>
      </div>

      {/* =======================
          MOBILE MENU
      ======================= */}
      <div
        className={`fixed inset-0 bg-black/50 md:hidden transition-opacity ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white dark:bg-gray-900 md:hidden transform transition-transform ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 border-b font-bold text-xl">Menu</div>

        <nav className="p-4 space-y-2">
          {NAV_ITEMS.map((item) => {
            const hasChildren = !!item.children;

            if (hasChildren) {
              return (
                <div key={item.id}>
                  <button
                    onClick={() => toggleDropdown(item.id)}
                    className="w-full flex justify-between items-center px-4 py-3 rounded-lg font-bold hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {item.label}
                    <span>{openDropdownId === item.id ? "▲" : "▼"}</span>
                  </button>

                  {openDropdownId === item.id && (
                    <div className="ml-4 mt-2 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.id}
                          to={child.to}
                          className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          {child.icon} {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.id}
                to={item.to}
                className="block px-4 py-3 rounded-lg font-bold hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
