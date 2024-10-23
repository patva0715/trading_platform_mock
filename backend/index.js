const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const PORT = 5000;
const cors = require('cors'); // Require the cors package
const app = express();
app.use(cors());
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Initial stock prices and last prices
let stockPrices = {
    'SPY': 200.0, // Initial price for Company A
    'AMD': 200.0, // Initial price for Company B
    // 'AAPL': 150.0, // Initial price for Apple
    // 'TSLA': 230.0, // Initial price for Tesla
    // 'GOOGL': 250.0, // Initial price for Alphabet (Google)
    // 'AMZN': 150.0, // Initial price for Amazon
    // 'MSFT': 300.0  // Initial price for Microsoft
};
let lastPrices = {
    'SPY': 200.0, // Initial price for Company A
    'AMD': 200.0, // Initial price for Company B
}
let ownedStocks = {
    'SPY': {
        shareCt: 1
    },
    'AMD': {
        shareCt: 1
    }
}
let priceHistory = {
    'SPY': [{ value: 200 }, { value: 200 }, { value: 200 }, { value: 200 }, { value: 200 }, { value: 200 }, { value: 200 }, { value: 200 }, { value: 200 }, { value: 200 }],
    'AMD': [{ value: 200 }, { value: 200 }, { value: 200 }, { value: 200 }, { value: 200 }, { value: 200 }, { value: 200 }, { value: 200 }, { value: 200 }, { value: 200 }],
}

// Function to update stock prices by ±1%
const updateStockPrices = () => {
    Object.keys(stockPrices).forEach(ticker => {
        const change = (Math.random() * 4 - 2) * 0.01; // Random change between -1% and +1%
        let newVal = stockPrices[ticker] * (1 + change)
        stockPrices[ticker] = (newVal).toFixed(2);
        priceHistory[ticker].push({value:newVal})

    });
};
const updateLastPrices = () =>{
    Object.keys(lastPrices).map((ticker)=>{
        lastPrices[ticker] = stockPrices[ticker]
    })
    console.log('new last prices')
    console.log(lastPrices)
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({message:"updateLastPrices",data:lastPrices}));
        }
    });
}
const trimArray = () => {
    Object.keys(priceHistory).forEach(ticker => {
        const halfLength = Math.floor(priceHistory[ticker].length / 2);
        priceHistory[ticker] = priceHistory[ticker].slice(halfLength); // Keep the latest half
        console.log('Array trimmed:', priceHistory[ticker]);
    })

};
// Update stock prices every second
setInterval(() => {
    updateStockPrices();
    //   console.log(stockPrices)
}, 1000);
// Trim History Arrays every 1 min
setInterval(trimArray, 60000);
setInterval(updateLastPrices, 6000);

const decoder = new TextDecoder('utf-8');
// Handle WebSocket connections
wss.on('connection', ws => {
    console.log('New client connected');

    // Listen for requests from the client
    ws.on('message', (message) => {
        let cli_req = decoder.decode(message)
        if (cli_req === 'getStockPrices') {
            console.log('stocks');

            // When the client requests stock prices, send them back
            ws.send(JSON.stringify({ message: 'stockPrices', data: stockPrices }));
        }
        else if (cli_req.startsWith('getIndivPrice')) {
            let ticker = cli_req.slice(13)
            ws.send(JSON.stringify({ message: 'stockPrice', data: stockPrices[ticker] }));
        }
    });
    //   ws.addEventListener('message',(event)=>{
    //     console.log(event.data)
    //     ws.send(JSON.stringify(stockPrices));
    // })

    // Handle WebSocket disconnection
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// DIVIDER GET BALANCE HISTORY
app.get('/ownedStocks', (req, res) => {
    // Extract start and end dates from query parameters
    res.json(ownedStocks);
});
app.get('/lastPrices', (req, res) => {
    // Extract start and end dates from query parameters
    res.json(lastPrices);
});
app.get('/history', (req, res) => {
    const ticker = req.query.ticker;
    // Extract start and end dates from query parameters
    res.json(priceHistory[ticker]);
});
// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});