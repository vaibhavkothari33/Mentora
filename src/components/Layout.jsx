// src/components/Layout.jsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useTheme } from '../context/ThemeContext';

const Layout = () => {
  const [connectedAccount, setConnectedAccount] = useState('');
  const { darkMode } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Navbar account={connectedAccount} onConnect={setConnectedAccount} />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;