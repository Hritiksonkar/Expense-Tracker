import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.documentElement.classList.toggle('dark', JSON.parse(savedTheme));
            return JSON.parse(savedTheme);
        }
        // Default to system preference
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', systemPrefersDark);
        return systemPrefersDark;
    });

    useEffect(() => {
        localStorage.setItem('theme', JSON.stringify(isDark));
        document.documentElement.classList.toggle('dark', isDark);
        // Set dark mode class on HTML element for full screen effect
        document.documentElement.classList.toggle('dark-mode', isDark);
        // Add dark mode class to body
        document.body.style.backgroundColor = isDark ? '#121212' : '#ffffff';
    }, [isDark]);

    const toggleTheme = () => setIsDark(!isDark);

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
