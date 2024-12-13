'use client'
import GraphWindow from '@/components/graphWindow'
import MiniGraph from '@/components/miniGraph'
import NavBar from '@/components/navbar'
import React, { useEffect, useState } from 'react'
const dollerFormat = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});
const page = ({ params }) => {
    const ticker = params.slug
    const [processing, setProcessing] = useState(false)
    const [transactionType, setTransactionType] = useState("Buy")
    const [qty, setQty] = useState("")
    const [owned, setOwned] = useState({})
    const [marketClosed, setMarketClosed] = useState(false)
    const [priceHistory, setPriceHistory] = useState([])
    const [historicalPrices, setHistoricalPrices] = useState([])
    const [stockPrice, setStockPrice] = useState(0)
    const [lastPrice, setLastPrice] = useState(0)
    const [isActive, setIsActive] = useState(false);
    const [range, setRange] = useState(1)
    let bgColor = stockPrice >= lastPrice ? '#07CA0C' : "#FF0000"
    const handleSubmit = async (e) => {
        setProcessing(true)
        e.preventDefault();
        const requestBody = {
            type: transactionType,
            tickerSymbol: ticker,
            stockPrice: parseFloat(stockPrice),
            qty: parseInt(qty, 10),
        };

        try {
            const response = await fetch("http://localhost:5000/order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                const data = await response.json();
                // alert("Transaction successful: " + JSON.stringify(data));
                fetchOwned()
            } else {
                alert("Transaction failed. Please try again.");
            }
            setTimeout(() => setProcessing(false), 800)
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while processing the transaction.");
        }
    };
    const fetchLastPrices = async () => {
        try {
            const response = await fetch('http://localhost:5000/lastPrices');
            if (!response.ok) {
                throw new Error('Failed to fetch owned stocks');
            }
            const data = await response.json();
            setLastPrice(data[ticker]); // Set the received data to the state
        } catch (error) {
            console.error('Error fetching owned stocks:', error);
        }
    }
    const handleQtyChange = (value) => {
        if (value) {
            setQty(value)
        } else {
            setQty("")
        }
    }
    const fetchPriceHistories = async () => {
        try {
            const response = await fetch('http://localhost:5000/priceHistories');
            if (!response.ok) {
                throw new Error('Failed to fetch owned stocks');
            }
            const data = await response.json();
            console.log(data[ticker])
            setPriceHistory(data[ticker]); // Set the received data to the state
        } catch (error) {
            console.error('Error fetching owned stocks:', error);
        }
    }
    const fetchHistoricalPrices = async (theRange) => {
        try {
            const response = await fetch(`http://localhost:5000/historicalPrices?ticker=${ticker}`);
            if (!response.ok) {
                throw new Error('Failed to fetch owned stocks');
            }
            const data = await response.json();
            console.log("ALL HISTORY")
            console.log(data.slice(theRange * -30))
            setHistoricalPrices(data.slice(theRange * -30))
            // setPriceHistory(data[ticker]); // Set the received data to the state
        } catch (error) {
            console.error('Error fetching owned stocks:', error);
        }
    }
    const fetchOwned = async () => {
        try {
            const response = await fetch('http://localhost:5000/ownedStocks');
            if (!response.ok) {
                throw new Error('Failed to fetch owned stocks');
            }

            const data = await response.json();
            setOwned(data[ticker]); // Set the received data to the state
        } catch (error) {
            console.error('Error fetching owned stocks:', error);
        }
    };
    useEffect(() => {
        if (!ticker) return
        fetchOwned()
        fetchLastPrices()
        fetchPriceHistories()
        // fetchHistoricalPrices()
        let interval = null
        // Establish a WebSocket connection to the server
        const ws = new WebSocket('ws://localhost:5000');
        ws.onopen = () => {
            requestStockPrices()
            interval = setInterval(requestStockPrices, 1000);
        }
        const requestStockPrices = () => {
            ws.send(String('getIndivPrice' + ticker));
        };
        // When new data is received from the server, update the stock prices and UserBal
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log(data)
            if (data.message == 'updateIndiv') {
                setStockPrice(data.data)
                setMarketClosed(data.marketClosed)
            } else if (data.message == 'updateLastPrices') {
                console.log('lastPrices and HistoryUpdated')
                setLastPrice(data.data.lastPrices[ticker])
                setPriceHistory(data.data.priceHistory[ticker])
            } else if (data.message == 'updatePriceHistories') {
                console.log('Price History Updated')
                console.log(data.data[ticker])
                setPriceHistory(data.data[ticker])
            } else { }
        };

        // UpdateStock Interval


        return () => {
            clearInterval(interval);
            ws.close();
        };
    }, [ticker]);
    useEffect(() => {
        fetchHistoricalPrices(range)
    }, [range])
    return (
        <>
            <NavBar />
            <main className="flex max-w-[1400px] mx-auto gap-10 w-full items-start">
                {/* DIVIDER COL 1 - GRAPH AND INFO */}
                <div className="w-3/4">
                    <h1 className="text-4xl">{ticker}</h1>
                    <h1 className="text-4xl">${stockPrice}</h1>
                    <p className='text-xs mt-1 flex gap-1'>
                        {stockPrice ? lastPrice > stockPrice ?
                            <span className=" text-red-500">-${(lastPrice - stockPrice).toFixed(2)} ({(100 * (lastPrice - stockPrice) / lastPrice).toFixed(2)}%)</span> :
                            <span className=" text-green-500">+${(stockPrice - lastPrice).toFixed(2)} ({(100 * (stockPrice - lastPrice) / lastPrice).toFixed(2)}%)</span> : <></>}

                        <span>{marketClosed ? 'Market Closed' : 'Today'}</span>
                    </p>
                    <MiniGraph strokeW={3} value={stockPrice} lastPrice={lastPrice} priceHistory={priceHistory} historicalPrices={historicalPrices} marketClosed={marketClosed} range={range} />
                    <div className='py-4 px-1 flex gap-2 flex-col'>
                        <div className='flex basis-full gap-2 py-4'>
                            {[1, 7, 30, 100].map((x) => (<button key={x} className='text-nowrap font-bold text-white text-sm p-1 hover:bg-green-500 aspect-[3] basis-10 w-auto' onClick={() => setRange(x)}>{x} D</button>))}
                        </div>


                        {owned && owned.shareCt ? <StockInfoWindow stockPrice={stockPrice} owned={owned} /> : <></>}

                        <div className='flex py-4 pt-12 border-y-[1px] border-neutral-700'>
                            <span className='text-xl font-bold grow'>About</span>
                        </div>
                        <p className='mt-6 text-sm'>Aliqua velit anim officia sunt culpa non ex elit eiusmod commodo labore qui. Proident officia Lorem mollit do reprehenderit deserunt. Ex laboris adipisicing est esse elit qui ullamco minim ipsum id ea id incididunt officia.</p>

                        <div className='flex py-4 pt-12 border-y-[1px] border-neutral-700'>
                            <span className='text-xl font-bold grow'>Key Statistics</span>
                        </div>
                        <KeyStatWindow stockPrice={stockPrice} />


                        <OrderHistoryWindow ticker={ticker} owned={owned} />


                    </div>
                </div>
                {/* DIVIDER COL 2 - PLACE ORDER WINDOW */}
                <div className="w-1/4 border-[1px] min-h-[600px] border-neutral-500 bg-[rgb(30,33,36)] text-white rounded-md flex flex-col sticky top-10">
                    <h2 className="p-6 pb-3 border-b-[1px] border-neutral-500 font-bold">{transactionType} {ticker}</h2>
                    <form className='flex flex-col gap-2 p-6 pt-3 text-sm grow' onSubmit={handleSubmit}>
                        <div className='flex items-center'>
                            <span className='grow w-1/2'>Order Type</span>
                            <select className='bg-transparent border-[1px] w-1/3 rounded-md border-neutral-500 p-1' value={transactionType} onChange={(e) => setTransactionType(e.target.value)}>
                                <option className='bg-black rounded-none' value='Sell'>Sell</option>
                                <option className='bg-black rounded-none' value='Buy'>Buy</option>
                            </select></div>
                        <div className='flex items-center'>
                            <span className='grow w-1/2'>Shares</span>
                            <input placeholder="0" className='w-1/3 bg-transparent border-[1px] p-1 text-right rounded-md outline-none' style={{
                                borderColor: isActive ? bgColor : "#666", // Use the dynamic variable here
                            }} onFocus={() => { console.log("HELLO"); setIsActive(true) }}
                                onBlur={() => { console.log("Axxxx"); setIsActive(false) }} value={qty} onChange={(e) => handleQtyChange(e.target.value)} />
                        </div>
                        <div className='flex items-center'><span className='basis-1/2 grow '>Market Price</span><span className='font-bold text-right p-1'>${stockPrice}</span></div>
                        <div className='h-[1px] w-full bg-neutral-500 my-2' />
                        <div className='flex'><span className='basis-1/2 grow '>Estimated Total</span><span className='font-bold text-right'>${Number((stockPrice * (qty || 0)).toFixed(2)).toLocaleString()}</span></div>
                        {processing ? <p className='w-full p-4 text-center mt-6 font-bold' style={{ color: bgColor }}>...Processing</p> : <button type='submit' className='p-4 rounded-full bg-red-500 text-[rgb(30,33,36)] font-semibold mt-6' style={{ backgroundColor: bgColor }}>Place {transactionType} Order</button>}

                        <div className='w-full text-center'>
                            {owned && owned.shareCt ? <span className='p-2' style={{ color: bgColor }}>{owned.shareCt} available</span> : ""}
                        </div>
                    </form>
                    <h2 className="pt-4 pb-3 border-t-[1px] border-neutral-500 text-center text-xs">$1,234 buying power available</h2>
                </div>

            </main>
        </>
    )
}
const StockInfoWindow = ({ owned, stockPrice }) => {
    let totalReturn = owned.shareCt * stockPrice - owned.shareCt * owned.avgCost
    let perc = ((totalReturn / (owned.shareCt * owned.avgCost)) * 100).toFixed(2)
    return (
        <>
            <div className='flex py-4 border-y-[1px] border-neutral-700'>
                <span className='text-xl font-bold grow'>Stocks</span>
            </div>
            <div className='flex  pr-6 w-full  text-xs mt-6'>
                <div className='grow'><p className='font-semibold'>Shares</p><p>{owned.shareCt}</p></div>
                <div className='grow'><p className='font-semibold'>Value</p><p>{dollerFormat.format((owned.shareCt * stockPrice).toFixed(2))}</p></div>
                <div className='grow'><p className='font-semibold'>Average cost/share</p><p>${owned.avgCost}</p></div>
                <div className='grow'><p className='font-semibold'>Total Return</p><p>{dollerFormat.format(totalReturn)}({perc}%)</p></div>
            </div>
        </>
    )
}

const KeyStatWindow = () => {
    return (
        <div className='flex  pr-6 w-full flex-wrap  text-xs mt-6'>
            <div className='grow basis-1/4 pb-4'><p className='font-semibold '>30-Day yield</p><p>32.36</p></div>
            <div className='grow basis-1/4 pb-4'><p className='font-semibold '>High today</p><p>$323</p></div>
            <div className='grow basis-1/4 pb-4'><p className='font-semibold '>Low today</p><p>$318.12</p></div>
            <div className='grow basis-1/4 pb-4'><p className='font-semibold '>Open price</p><p>$320.16(12.25%)</p></div>
            <div className='grow basis-1/4 pb-4'><p className='font-semibold '>52 Week high</p><p>$302.12</p></div>
            <div className='grow basis-1/4 pb-4'><p className='font-semibold '>52 Week low</p><p>$230.12</p></div>
        </div>
    )
}

const OrderHistoryWindow = ({ ticker, owned }) => {
    const [orderHistory, setOrderHistory] = useState([])
    const fetchOrderHistory = async () => {
        try {
            const response = await fetch(`http://localhost:5000/order?tickerSymbol=${ticker}`);

            if (!response.ok) {
                throw new Error('Failed to fetch order history');
            }

            const data = await response.json();
            setOrderHistory(data.history); // Set the received data to the state
        } catch (error) {
            console.error('Error fetching owned stocks:', error);
        }
    }
    useEffect(() => {
        fetchOrderHistory()
    }, [ticker, owned])

    if (!orderHistory) return
    return (
        <div className='py-4 pt-12 border-t-[1px] border-neutral-700'>
            <p className='text-xl font-bold grow pb-3'>History</p>
            <div >
                {orderHistory.slice().reverse().map(({ type, qty, date, totalCost }, idx) => (
                    <div key={idx} className='flex border-y-[1px] border-neutral-700 p-3 hover:bg-neutral-600 '>
                        <div>
                            <p className='font-semibold leading-4 text-sm'>{`${type} ${qty} ${ticker}`}</p>
                            <span className=' text-xs font-light'>{date}</span>
                        </div>
                        <span className='grow text-right font-bold text-sm'>{dollerFormat.format(totalCost)}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
export default page