import express from 'express';
import axios from 'axios';
import { convertDateToUnixTimestamp } from './convertDateToUnixTimestamp.js';

const app = express();
const PORT = 3000;

app.get('/api/bitcoin-rates', async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*'); 

  const { startDate, endDate, currency = 'USD' } = req.query;
  // check if startDate and endDate are provided
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Missing required query parameters: startDate, endDate' });
  }
  try {
    // convert dates to Unix timestamps
    const from = convertDateToUnixTimestamp(startDate);
    const to = convertDateToUnixTimestamp(endDate);
    // fetch market data
    // TODO: here we can use API-KEY if needed
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range`,
      {
        params: {
          vs_currency: currency,
          from,
          to,
        },
      }
    );
    const marketData = response.data.prices;
    // check if data is available for the specified range
    if (!marketData || marketData.length === 0) {
      return res.status(404).json({ error: 'No data found for the specified range' });
    }
    // format the data to ISO date strings
    const formattedData = marketData.map(([timestamp, price]) => ({
      date: new Date(timestamp).toISOString(),
      price,
    }));
    // send the formatted data as a response
    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching data:', error.message);

    if (error?.response?.status && error?.response?.statusText) {
      return res.status(error?.response?.status).json({ error: error?.response?.statusText });
    }

    res.status(500).json({ error: 'Failed to fetch market data' });
  }
});

app.get('/api/currencies', async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*'); 

  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/supported_vs_currencies');
    const supportedCurrencies = response.data;
    res.json(supportedCurrencies);
  } catch (error) {
    console.error('Error fetching currencies:', error);
    res.status(500).send('Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});