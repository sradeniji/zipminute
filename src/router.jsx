import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import Search from './pages/Search';
import Slot from './pages/Slot';
import VendorRegistration from './pages/VendorRegistration';
import VendorDashboard from './pages/VendorDashboard';
import VendorServices from './pages/VendorServices';
import VendorSlots from './pages/VendorSlots';
import VendorReservations from './pages/VendorReservations';

// Custom React Router using History API
const Router = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [searchParams, setSearchParams] = useState(new URLSearchParams(window.location.search));

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      setSearchParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigation helper
  const navigate = (path, queryString = '') => {
    const url = queryString ? `${path}?${queryString}` : path;
    window.history.pushState({}, '', url);
    setCurrentPath(path);
    setSearchParams(new URLSearchParams(queryString));
  };

  // Make navigate available globally
  window.navigate = navigate;

  // Route matching
  const renderRoute = () => {
    switch (currentPath) {
      case '/':
        return <Home />;
      case '/search':
        return <Search searchParams={searchParams} />;
      case '/slot':
        const slotId = searchParams.get('id');
        return <Slot slotId={slotId} />;
      case '/vendor/register':
        return <VendorRegistration />;
      case '/vendor/dashboard':
        return <VendorDashboard />;
      case '/vendor/services':
        return <VendorServices />;
      case '/vendor/slots':
        return <VendorSlots />;
      case '/vendor/reservations':
        return <VendorReservations />;
      default:
        // Handle dynamic routes like /slot/:id
        if (currentPath.startsWith('/slot/')) {
          const slotId = currentPath.split('/')[2];
          return <Slot slotId={slotId} />;
        }
        return <Home />;
    }
  };

  return (
    <div className="app">
      {renderRoute()}
    </div>
  );
};

export default Router;
