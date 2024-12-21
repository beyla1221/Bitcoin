import React from 'react';
import './App.css';
import BitcoinRatesChart from './BitcoinRatesChart';
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <div className="App">
      <BitcoinRatesChart />
      <ToastContainer />
    </div>
  );
}

export default App;
