import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const CurrencySelector = ({ onCurrencySelect }) => {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState('usd');

  useEffect(() => {
    axios.get('http://localhost:3000/api/currencies')
      .then(response => {
        setCurrencies(response.data);
        setLoading(false);
      })
      .catch(error => {
        toast.error('Error fetching currencies');
        setLoading(false);
      });
  }, []);

  const handleCurrencyChange = (event) => {
    const currency = event.target.value;
    setSelectedCurrency(currency);
    onCurrencySelect(currency);
  };

  return (
    <div>
      {loading ? (
        <p>Loading currencies...</p>
      ) : (
        <select value={selectedCurrency} onChange={handleCurrencyChange}>
          <option value="">Select a currency</option>
          {currencies.map((currency, index) => (
            <option key={index} value={currency}>
              {currency.toUpperCase()}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default CurrencySelector;
