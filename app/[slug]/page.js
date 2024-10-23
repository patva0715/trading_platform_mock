'use client'
import GraphWindow from '@/components/graphWindow'
import NavBar from '@/components/navbar'
import React, { useEffect, useState } from 'react'

const page = ({ params }) => {
  const ticker = params.slug
  const [stockPrice, setStockPrice] = useState(0)
  const [lastPrice, setLastPrice] = useState(0)
  const [qty, setQty] = useState("")
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
  useEffect(() => {
    console.log(qty);

  }, [qty])
  useEffect(() => {
    if (!ticker) return
    fetchLastPrices()

    // Establish a WebSocket connection to the server
    const ws = new WebSocket('ws://localhost:5000');

    const requestStockPrices = () => {
      ws.send(String('getIndivPrice' + ticker));
    };

    // When new data is received from the server, update the stock prices and UserBal
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data)
      if (data.message != 'stockPrice') return
      setStockPrice(data.data)
    };

    // UpdateStock Interval
    const interval = setInterval(requestStockPrices, 1000);

    return () => {
      clearInterval(interval);
      ws.close();
    };
  }, [ticker]);
  return (
    <>
      <NavBar />
      <main className="flex max-w-[1400px] mx-auto gap-10 w-full items-start">
        <div className="w-3/4">
          <h1 className="text-4xl">{ticker}</h1>
          <h1 className="text-4xl">${stockPrice}</h1>
          {stockPrice ? lastPrice > stockPrice ? <p className="text-xs mt-1 text-red-500">+${(lastPrice - stockPrice).toFixed(2)}({(100 * (lastPrice - stockPrice) / lastPrice).toFixed(2)}%)<span>Today</span></p> : <p className="text-xs mt-1 text-green-500">${(lastPrice - stockPrice).toFixed(2)}({(100 * (lastPrice - stockPrice) / lastPrice).toFixed(2)}%)<span>Today</span></p> : <></>}

          <GraphWindow value={stockPrice} lastPrice={lastPrice} />
          <div className='py-4 px-1 flex gap-2 flex-col'>
            <div className='flex basis-full gap-2 py-4'>
              {["1D", "1W", "1M", "YTD", "1Y"].map((range) => (<button key={range} className='font-bold text-white text-sm p-1 hover:bg-green-500 aspect-[3] basis-10 w-auto'>{range}</button>))}
            </div>

            <div className='flex py-4 border-y-[1px] border-neutral-700'>
              <span className='text-xl font-bold grow'>Stocks</span>
            </div>
            <StockInfoWindow stockPrice={stockPrice}/>

            <div className='flex py-4 pt-12 border-y-[1px] border-neutral-700'>
              <span className='text-xl font-bold grow'>About</span>
            </div>
            <p className='mt-6 text-sm'>Aliqua velit anim officia sunt culpa non ex elit eiusmod commodo labore qui. Proident officia Lorem mollit do reprehenderit deserunt. Ex laboris adipisicing est esse elit qui ullamco minim ipsum id ea id incididunt officia.</p>

            <div className='flex py-4 pt-12 border-y-[1px] border-neutral-700'>
              <span className='text-xl font-bold grow'>Key Statistics</span>
            </div>
            <KeyStatWindow stockPrice={stockPrice}/>

            <div className='flex py-4 pt-12 border-y-[1px] border-neutral-700'>
              <span className='text-xl font-bold grow'>History</span>
            </div>


          </div>
        </div>
        <div className="w-1/4 border-[1px] min-h-[600px] border-neutral-500 bg-[rgb(30,33,36)] text-white rounded-md flex flex-col">
          <h2 className="p-6 pb-3 border-b-[1px] border-neutral-500 font-bold">Buy {ticker}</h2>
          <form className='flex flex-col gap-2 p-6 pt-3 text-sm grow'>
            <div className='flex'><span className='grow w-1/2'>Shares</span><input placeholder="0" className='w-1/2 bg-transparent border-[1px] p-2 text-right rounded-md border-neutral-500' value={qty} onChange={(e) => handleQtyChange(e.target.value)} /></div>
            <div className='flex'><span className='basis-1/2 grow '>Market Price</span><span className='font-bold text-right'>${stockPrice}</span></div>
            <div className='h-[1px] w-full bg-neutral-500 my-2' />
            <div className='flex'><span className='basis-1/2 grow '>Estimated Cost</span><span className='font-bold text-right'>${Number((stockPrice * (qty || 0)).toFixed(2)).toLocaleString()}</span></div>
            <button className='p-4 rounded-full bg-red-500 text-[rgb(30,33,36)] font-semibold mt-6'>Place Order</button>

          </form>
          <h2 className="pt-4 pb-3 border-t-[1px] border-neutral-500 text-center text-xs">$1,234 buying power available</h2>
        </div>

      </main>

    </>
  )
}
const StockInfoWindow = () =>{
  return(
    <div className='flex  pr-6 w-full  text-xs mt-6'>
      <div className='grow'><p className='font-semibold'>Shares</p><p>3</p></div>
      <div className='grow'><p className='font-semibold'>Value</p><p>$323</p></div>
      <div className='grow'><p className='font-semibold'>Average price</p><p>$32.12</p></div>
      <div className='grow'><p className='font-semibold'>Total Return</p><p>$102.16(12.25%)</p></div>
    </div>
  )
}

const KeyStatWindow = () =>{
  return(
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
export default page