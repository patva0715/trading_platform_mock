const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const PORT = 5000;
const cors = require('cors'); // Require the cors package
const app = express();
app.use(cors());
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const decoder = new TextDecoder('utf-8');

// Initial stock prices and last prices
let marketClosed = true
let stockPrices = {
    'SPY': 200.0, // Initial price for Company A
    'AMD': 200.0, // Initial price for Company B
    'AAPL': 150.0, // Initial price for Apple
    'TSLA': 230.0, // Initial price for Tesla
    'GOOGL': 250.0, // Initial price for Alphabet (Google)
    'AMZN': 150.0, // Initial price for Amazon
    'MSFT': 300.0  // Initial price for Microsoft
};
let lastPrices = { ...stockPrices }
let ownedStocks = {
    'SPY': {
        shareCt: 1
    },
    'AMD': {
        shareCt: 1
    }
}
let priceHistory = {
    'SPY': [], // Initial price for Company A
    'AMD': [], // Initial price for Company B
    'AAPL': [], // Initial price for Apple
    'TSLA': [], // Initial price for Tesla
    'GOOGL': [], // Initial price for Alphabet (Google)
    'AMZN': [], // Initial price for Amazon
    'MSFT': []  // Initial price for Microsoft
}

// Function to update stock prices by ±1%
const updateStockPrices = () => {
    if (marketClosed) {
        Object.keys(stockPrices).forEach(ticker => {
            priceHistory[ticker].push({value:stockPrices[ticker]})
            // console.log(priceHistory[ticker][-1])
        })
        return
    }

    Object.keys(stockPrices).forEach(ticker => {
        const change = (Math.random() * 4 - 2) * 0.01; // Random change between -1% and +1%
        let newVal = stockPrices[ticker] * (1 + change)
        stockPrices[ticker] = (newVal).toFixed(2);
        priceHistory[ticker].push({ value: newVal })

    });
};
const updateLastPrices = () => {
    Object.keys(lastPrices).map((ticker) => {
        lastPrices[ticker] = stockPrices[ticker]
    })
    console.log('Updated Prev Closing Price')
    console.log(lastPrices)
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ message: "updateLastPrices", data: lastPrices }));
        }
    });
}
const prunePriceHistory = () => {
    if (marketClosed)return
    Object.keys(priceHistory).forEach(ticker => {
        priceHistory[ticker] = []
        // const halfLength = Math.floor(priceHistory[ticker].length / 2);
        // priceHistory[ticker] = priceHistory[ticker].slice(halfLength); // Keep the latest half
        // console.log('Price History Pruned:', { ticker });
    })

};
const openMarket = () => {
    console.log('Market Open')
    setTimeout(closeMarket, 30000)
    marketClosed = false
}

const closeMarket = () =>{
    console.log('Market Closed')
    prunePriceHistory()
    marketClosed=true
    updateLastPrices()
    setTimeout(openMarket,15000)
}
// Update stock prices every second
setInterval(() => {
    updateStockPrices();
}, 1000);
// Trim History Arrays every 1 min
// setInterval(prunePriceHistory, 60000);
// setInterval(updateLastPrices, 60000);
// Open market every 60 secs 90-30sec(closing duration)
// setInterval(openMarket, 30000);

setTimeout(openMarket,5000)
// Handle WebSocket connections
wss.on('connection', ws => {
    console.log('New client connected');

    // Listen for requests from the client
    ws.on('message', (message) => {
        let cli_req = decoder.decode(message)
        if (cli_req === 'getStockPrices') {
            // When the client requests stock prices, send them back
            ws.send(JSON.stringify({ message: 'updateStockPrices', data: stockPrices, marketClosed }));
        }
        else if (cli_req.startsWith('getIndivPrice')) {
            let ticker = cli_req.slice(13)
            ws.send(JSON.stringify({ message: 'updateStockPrices', data: stockPrices[ticker] }));
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