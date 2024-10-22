const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const PORT = 5000;

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Initial stock prices for Company A and B
let stockPrices = {
    'spy': 100.0, // Initial price for Company A
    'amd': 200.0, // Initial price for Company B
};

// Function to update stock prices by ±1%
const updateStockPrices = () => {
    Object.keys(stockPrices).forEach(company => {
        const change = (Math.random() * 2 - 1) * 0.01; // Random change between -1% and +1%
        stockPrices[company] = (stockPrices[company] * (1 + change)).toFixed(2);
    });
};

// Update stock prices every second
setInterval(() => {
    updateStockPrices();
    //   console.log(stockPrices)
}, 1000);

// Create HTTP server and WebSocket server

const decoder = new TextDecoder('utf-8');
// Handle WebSocket connections
wss.on('connection', ws => {
    console.log('New client connected');

    // Listen for requests from the client
    ws.on('message', (message) => {
        let cli_req = decoder.decode(message)
        if (cli_req === 'getStockPrices') {
            // When the client requests stock prices, send them back
            ws.send(JSON.stringify(stockPrices));
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

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});