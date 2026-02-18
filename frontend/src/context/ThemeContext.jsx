import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Always use dark mode - light mode has been removed
    const theme = "dark";

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove("light");
        root.classList.add("dark");
        localStorage.setItem("theme", "dark");
    }, []);

    // No-op toggle function for backwards compatibility
    const toggleTheme = () => {
        // Theme is locked to dark mode
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
