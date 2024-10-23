const fs = require('fs');
function generateTimePriceData() {
    const data = [];
    let currentTime = new Date(); // Current timestamp as starting point
    currentTime.setHours(18, 0, 0, 0); // Set time to 6:00:00 PM
    let price=100
    for (let i = 0; i < 60; i++) {
        // Create a random price (between 100 and 200 as an example)
        const change = 1+((Math.random() * 2 - 1) * 0.01); // Random change between -1% and +1%
        price = price*change

        // Format the time (HH:MM:SS)
        const timeString = currentTime.toTimeString().split(' ')[0]; // Get the time part in HH:MM:SS format

        // Add the time and price to the array
        data.push({
            time: timeString,
            price: parseFloat(price),
        });

        // Increment time by 1 second
        currentTime.setMinutes(currentTime.getMinutes() + 5);
    }

    return data;
}

const spyData = generateTimePriceData();
const amdData = generateTimePriceData();

const spyString = JSON.stringify(spyData, null, 2); // Pretty-print with 2 spaces
const amdString = JSON.stringify(amdData, null, 2); // Pretty-print with 2 spaces

// Write the JSON string to a file (Node.js)
fs.writeFileSync('spy.json', spyString, 'utf8');
fs.writeFileSync('amd.json', spyString, 'utf8');
console.log('JSON data has been saved to .json');