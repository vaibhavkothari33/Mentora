// import { createContext, useContext, useState, useEffect } from 'react';

// const ThemeContext = createContext();

// export const ThemeProvider = ({ children }) => {
//   const [darkMode, setDarkMode] = useState(false);

//   useEffect(() => {
//     const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
//     setDarkMode(localStorage.getItem('darkMode') === 'true' || prefersDark);
//   }, []);

//   useEffect(() => {
//     localStorage.setItem('darkMode', darkMode.toString());
//     document.documentElement.classList.toggle('dark', darkMode);
//   }, [darkMode]);

//   const toggleDarkMode = () => {
//     setDarkMode(!darkMode);
//   };

//   return (
//     <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };

// export const useTheme = () => {
//   const context = useContext(ThemeContext);
//   if (!context) {
//     throw new Error('useTheme must be used within a ThemeProvider');
//   }
//   return context;
// }; 
// src/context/ThemeContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  // Theme colors object to maintain consistency across the app
  const theme = {
    light: {
      primary: 'from-indigo-500 to-purple-500', // Gradient primary
      secondary: 'from-purple-500 to-pink-500', // Gradient secondary
      accent: 'text-indigo-600',
      background: 'from-slate-50 via-white to-slate-50',
      card: 'bg-white',
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-600',
        accent: 'text-indigo-600'
      },
      border: 'border-gray-200',
      hover: {
        primary: 'hover:from-indigo-600 hover:to-purple-600',
        background: 'hover:bg-gray-50'
      }
    },
    dark: {
      primary: 'from-indigo-400 to-purple-400', // Softer gradient for dark mode
      secondary: 'from-purple-400 to-pink-400',
      accent: 'text-indigo-400',
      background: 'from-slate-900 via-slate-800 to-slate-900',
      card: 'bg-slate-800',
      text: {
        primary: 'text-white',
        secondary: 'text-gray-300',
        accent: 'text-indigo-400'
      },
      border: 'border-slate-700',
      hover: {
        primary: 'hover:from-indigo-500 hover:to-purple-500',
        background: 'hover:bg-slate-700'
      }
    }
  };

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(localStorage.getItem('darkMode') === 'true' || prefersDark);
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, theme: darkMode ? theme.dark : theme.light }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};