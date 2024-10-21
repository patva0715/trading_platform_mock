// Array of example stock tickers
const stocks = [
    { ticker: 'AAPL', price: 145.30 },
    // { ticker: 'MSFT', price: 299.10 },
    // { ticker: 'GOOGL', price: 2750.60 },
    // { ticker: 'TSLA', price: 710.10 },
    // { ticker: 'AMZN', price: 3400.20 },
];
const today = new Date()
// Function to simulate changing stock prices
const simulateStockPrices = () => {
    const intervals = [];

    for (const stock of stocks) {
        // Create an interval for each stock that updates the price every 3 seconds
        const interval = setInterval(async () => {
            const currentHour = today.getHours();
            const currentMin = today.getMinutes();

            // Only allow updates between 6 AM (06:00) and 12 PM (12:00)
            if (currentHour >= 6 && currentHour < 23 && currentMin < 39) {
                // Randomly change the stock price
                const change = (Math.random() * 10 - 5).toFixed(2); // Random change between -5 and +5
                stock.price = (parseFloat(stock.price) + parseFloat(change)).toFixed(2);

                console.log(`Ticker: ${stock.ticker}, New Price: $${stock.price}`, today.toUTCString());

                // Optional: Insert the new stock price into the database
                // await insertStockPrice(stock.ticker, stock.price);
            } else {
                // If it's past 12 PM, clear all intervals and stop the simulation for the day
                console.log(`Simulation stopped for the day at ${currentHour}:32.`);
                clearIntervals(intervals);
            }
        }, 3000); // Update every 3 seconds

        intervals.push(interval);
    }
};

const clearIntervals = (intervals) => {
    intervals.forEach(clearInterval);
};

// Function to insert the stock price into the database
// const insertStockPrice = async (ticker, price) => {
//     const query = `
//         INSERT INTO stock_prices (ticker, price, timestamp)
//         VALUES ($1, $2, NOW());
//     `;

//     try {
//         await pool.query(query, [ticker, price]);
//     } catch (err) {
//         console.error('Error inserting stock price:', err);
//     }
// };

// Start the simulation
simulateStockPrices();
