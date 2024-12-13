const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const PORT = 5000;
const cors = require('cors'); // Require the cors package
const app = express();
app.use(cors());
// Parse JSON bodies
app.use(express.json());
const OPENFOR = 30
const CLOSEFOR = 15

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const decoder = new TextDecoder('utf-8');
const csuData = require('./csu')

// Initial stock prices and last price
let closingBalPrices = {
    'user': 0
};
// let porfolioHistory = {
//     'user': [{ value: 220 }, { value: 250 }, { value: 220 }, { value: 220 },]
// }
let userCash = {
    'user': 1000
}
let orderHistory = {
    'user': {
        'FUL': [{
            date: 'May 25',
            qty: 2,
            type: 'Sell',
            totalCost: 120
        }]
    }
}
let ownedStocks = {
    user: {
        'FUL': {
            shareCt: 2,
            avgCost: 100
        },
        'POM': {
            shareCt: 1,
            avgCost: 120
        },
        'POM': {
            shareCt: 1,
            avgCost: 120
        },
        'BAK': {
            shareCt: 1,
            avgCost: 80
        }
    }
}
let getStartingPrice = (data1) => {
    let obj = {}
    Object.keys(data1).map(ticker => {
        let csu = data1[ticker]
        const basePrice = (csu.avgCost * csu.gradRate / 100) / (csu.acceptanceRate + 0.5);
        const adjustment = csu.bodyCount * .0001;

        // Final price, rounded to two decimal places
        const startingPrice = parseFloat((basePrice + adjustment).toFixed(2));
        obj[ticker] = startingPrice
    })

    return (obj)

}
let genHistory = () => {
    let obj = {}
    Object.keys(stockPrices).map(ticker => {
        obj[ticker] = []
    })
    obj['user'] = []
    return obj
}
let marketClosed = true
let stockPrices = getStartingPrice(csuData.csuData)
let lastPrices = { ...stockPrices }

let priceHistory = genHistory()
let historicalPrices = genHistory()



// Function to update stock prices by ±1%
const updateStockPrices = () => {
    let userPortVal = 0
    if (marketClosed) {
        Object.keys(stockPrices).forEach(ticker => {
            priceHistory[ticker].push({ value: Number(stockPrices[ticker]) })
            // console.log(priceHistory[ticker][-1])
        })
        Object.keys(ownedStocks['user']).map((ticker) => {
            userPortVal += (ownedStocks['user'][ticker].shareCt * stockPrices[ticker])
        })
        userPortVal += userCash['user']
        priceHistory['user'].push(({ value: Number(userPortVal) }))
        historicalPrices['user'].push(({ value: Number(userPortVal) }))
        return
    }
    Object.keys(stockPrices).forEach(ticker => {
        const change = (Math.random() * 8 - 4) * 0.01; // Random change between -1% and +1%
        let newVal = stockPrices[ticker] * (1 + change)
        stockPrices[ticker] = (newVal).toFixed(2);
        priceHistory[ticker].push(({ value: Number(newVal) }))
        historicalPrices[ticker].push(({ value: Number(newVal) }))

    })
    Object.keys(ownedStocks['user']).map((ticker) => {
        userPortVal += (ownedStocks['user'][ticker].shareCt * stockPrices[ticker])
    })
    userPortVal += userCash['user']
    priceHistory['user'].push(({ value: Number(userPortVal) }))
    historicalPrices['user'].push(({ value: Number(userPortVal) }))
};
const updateLastPrices = () => {
    Object.keys(lastPrices).map((ticker) => {
        lastPrices[ticker] = stockPrices[ticker]
    })
    console.log('Updated Prev Closing Price')
    // console.log(lastPrices)
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ message: "updateLastPrices", data: { lastPrices, priceHistory } }));
        }
    });
}
const updateClosingBalances = () => {
    Object.keys(closingBalPrices).map((user) => {
        let bal = 0
        Object.keys(ownedStocks[user]).map((ticker) => {
            bal += (ownedStocks[user][ticker].shareCt * stockPrices[ticker])
        })
        closingBalPrices[user] = bal+userCash['user']
    })
    console.log('Updated user closing bal prices')
    console.log(closingBalPrices)
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ message: "updateClosingBal", data: { closingBalPrices } }));
        }
    });
}
const prunePriceHistory = () => {
    if (marketClosed) return
    Object.keys(priceHistory).forEach(ticker => {
        priceHistory[ticker] = []

    })
    // Object.keys(balHistory).forEach(user => {
    //     balHistory[user] = []
    // })

};
const openMarket = () => {
    console.log('=== Market Open ===')
    setTimeout(closeMarket, OPENFOR * 1000)
    marketClosed = false
}
const closeMarket = () => {
    console.log('XXX Market Closed XXX')
    prunePriceHistory()
    marketClosed = true
    updateLastPrices()
    updateClosingBalances()
    setTimeout(openMarket, CLOSEFOR * 1000)
}
// Update stock prices every second
setInterval(() => {
    console.log(priceHistory['FUL'].length)
    updateStockPrices();
}, 1000);

// Trim History Arrays every 1 min
// setInterval(prunePriceHistory, 60000);
// setInterval(updateLastPrices, 60000);
// Open market every 60 secs 90-30sec(closing duration)
// setInterval(openMarket, 30000);

// setTimeout(openMarket, 1000)
openMarket()
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
            ws.send(JSON.stringify({ message: 'updateIndiv', data: stockPrices[ticker], marketClosed }));
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
    res.json(ownedStocks['user']);
});
app.get('/lastPrices', (req, res) => {
    // Extract start and end dates from query parameters
    res.json(lastPrices);
});
app.get('/closingBalance', (req, res) => {
    // Extract start and end dates from query parameters
    res.json(closingBalPrices['user']);
});
app.get('/userCash', (req, res) => {
    // Extract start and end dates from query parameters
    res.json(userCash['user']);
});
app.get('/priceHistories', (req, res) => {
    // Extract start and end dates from query parameters
    res.json(priceHistory);
});
app.get('/historicalPrices', (req, res) => {
    // Extract start and end dates from query parameters
    const ticker = req.query.ticker;
    res.json(historicalPrices[ticker]);
});
app.get('/history', (req, res) => {
    const ticker = req.query.ticker;
    // Extract start and end dates from query parameters
    res.json(priceHistory[ticker]);
});
app.get('/biggestMovers', (req, res) => {
    let ar = []
    Object.keys(lastPrices).map(ticker => {
        let last = lastPrices[ticker]
        let cur = stockPrices[ticker]
        let percChange = Math.abs(cur - last) / last
        ar.push({ ticker, percChange })
    })
    const top5 = ar.sort((a, b) => b.percChange - a.percChange).slice(0, 5);
    res.json(top5)

})
app.post("/order", (req, res) => {
    const { type, tickerSymbol, stockPrice, qty } = req.body;
    console.log(req.body)

    // Validate request body
    if (!type || !tickerSymbol || !stockPrice || !qty) {
        console.log("ERROR WITH ORDER")
        return res.status(400).json({ error: "Missing required fields" });
    }

    // Log the trade request (could be saved to a database or processed further)
    console.log("Trade Request Received:", { type, tickerSymbol, stockPrice, qty });

    // Simulate trade processing
    let currOwned = ownedStocks['user'][tickerSymbol]
    console.log(currOwned)

    if (type == 'Sell') {
        if (!currOwned) return res.status(400).json({ error: "Dont own that stock" });
        if (qty > currOwned.shareCt) return res.status(400).json({ error: "Quantity more than owned" })
        let newQty = currOwned.shareCt - qty
        if (!newQty) delete ownedStocks['user'][tickerSymbol];
        else ownedStocks['user'][tickerSymbol].shareCt = newQty
        userCash['user']=userCash['user']+(qty*stockPrice)
    }
    else {
        if (!currOwned) {
            ownedStocks['user'][tickerSymbol] = { shareCt: qty, avgCost: stockPrice }
        } else {
            ownedStocks['user'][tickerSymbol].shareCt = currOwned.shareCt + qty
            let prevTotalCost = ownedStocks['user'][tickerSymbol].avgCost * ownedStocks['user'][tickerSymbol].shareCt
            let newAvg = (prevTotalCost + qty * stockPrice) / (qty + ownedStocks['user'][tickerSymbol].shareCt)
            ownedStocks['user'][tickerSymbol].avgCost = newAvg.toFixed(2)
        }
        userCash['user']=userCash['user']-(qty*stockPrice)

    }
    const totalCost = stockPrice * qty;
    if (!orderHistory['user'][tickerSymbol]) orderHistory['user'][tickerSymbol] = []
    orderHistory['user'][tickerSymbol].push({ date: 'Jan 1', qty, type, totalCost })
    console.log(orderHistory['user'])
    const responseMessage = `Trade executed: ${type.toUpperCase()} ${qty} shares of ${tickerSymbol} at $${stockPrice.toFixed(2)} each. Total: $${totalCost.toFixed(2)}`;

    // Respond to the client
    res.status(200).json({ message: responseMessage });
});
app.get("/order", (req, res) => {
    const tickerSymbol = req.query.tickerSymbol;
    console.log(tickerSymbol)

    // Validate request body
    if (!tickerSymbol) {
        console.log("ERROR WITH ORDER")
        return res.status(400).json({ error: "Missing required fields" });
    }

    // Simulate trade processing
    let history = orderHistory['user'][tickerSymbol]
    console.log(history)
    const responseMessage = `Fetch History for ${tickerSymbol}`;
    res.status(200).json({ message: responseMessage, history });
});
// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});