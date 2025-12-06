import React from 'react';
import Router from './router';
import { StoreProvider } from './context/Store';
import './App.css';

function App() {
  return (
    <StoreProvider>
      <Router />
    </StoreProvider>
  );
}

export default App;