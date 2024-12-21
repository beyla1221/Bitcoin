import React, { useMemo, useState } from 'react';
import moment from 'moment';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';
import CurrencyList from './CurrencyList';

import 'react-toastify/dist/ReactToastify.css';
import './BitcoinRatesChart.css';

const BitcoinRatesChart = () => {
  const startDateDefault = moment().subtract(1, 'year').format('YYYY-MM-DD');
  const endDateDefault = moment().format('YYYY-MM-DD');

  const [startDate, setStartDate] = useState(startDateDefault);
  const [endDate, setEndDate] = useState(endDateDefault);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [currency, setCurrency] = useState('USD');
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(false);

  const getRates = async () => {
    setRates([]);
    setLoading(true);

    try {
      const response = await axios.get(`http://localhost:3000/api/bitcoin-rates`, {
        params: {
          startDate: moment(startDate).format('YYYY-MM-DD'),
          endDate: moment(endDate).format('YYYY-MM-DD'),
          currency: selectedCurrency,
        }
      });
      
      setRates(response.data);
      setCurrency(selectedCurrency);
    } catch (error) {
      toast.error(error?.response?.statusText || 'Error getting rates');
    } finally {
      setLoading(false);
    }
  };

  const isHours = useMemo(() => {
    const dateCounts = rates.reduce((acc, item) => {
      const date = moment(item.date).format('YYYY-MM-DD');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    
    return Object.values(dateCounts).some(count => count > 1);
  }, [rates]);

  const dateFormat = isHours ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD';

  return (
    <div>
      <h2>Bitcoin Rates</h2>
      <div className='inputs-container'>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <CurrencyList onCurrencySelect={setSelectedCurrency} />
      </div>
      <button onClick={getRates}>Get Rates</button>

      {loading && <p>Loading...</p>}
      {!loading && rates.length > 0 && (
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <LineChart data={rates}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(tick) => moment(tick).format(dateFormat)}
              />
              <YAxis />
              <Tooltip content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const { date, price } = payload[0].payload;
                  return (
                    <div style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
                      <p><strong>Date:</strong> {moment(date).format(dateFormat)}</p>
                      <p><strong>Price:</strong> {price.toLocaleString(undefined, {
                        style: 'currency',
                        currency,
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })}
                      </p>
                    </div>
                  );
                }

                return null;
              }} />
              <Legend />
              <Line type="monotone" dataKey="price" stroke="red" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default BitcoinRatesChart;
