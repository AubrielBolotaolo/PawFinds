import React, { useEffect, useState } from 'react';
import '../styles/Preloader.css';
import logo from './assets/logo.png'; // Make sure to add your logo image

const Preloader = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="preloader">
      <img src={logo} alt="Paw Finds Logo" />
    </div>
  );
};

export default Preloader;
