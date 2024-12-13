"use client"
import Image from "next/image";
import GraphWindow from '../components/graphWindow'
import MiniGraph from "../components/miniGraph";
import { useEffect, useState } from "react";
import Link from "next/link";
import NavBar from "@/components/navbar";
const dollerFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});
// DIVIDER
// On load connect to backend server. Instantiate a socket for each stock in the watchlist
// Loop through each stock owned and fetch new data for each. .1s gap between each fetch
// Loop through each stock watchlist and fetch new data for each .1s gap between each fetch
// 1s interval to recalculate user balance

export default function Home() {
  const [userBal, setUserBal] = useState(0)
  const [userCash, setUserCash] = useState(0)
  const [marketClosed, setMarketClosed] = useState(false)
  const [ownedStocks, setOwnedStocks] = useState({})
  const [range, setRange] = useState(1)
  const [stockPrices, setStockPrices] = useState({});
  const [lastPrices, setLastPrices] = useState({});
  const [priceHistories, setPriceHistories] = useState({})
  const [closingBalance, setClosingBalance] = useState(0)
  const [historicalPrices, setHistoricalPrices] = useState([])
  const [biggestMovers, setBiggestMovers] = useState([])
  // DIVIDER
  const fetchUserCash = async () => {
    try {
      const response = await fetch(`http://localhost:5000/userCash`);
      if (!response.ok) {
        throw new Error('Failed to fetch owned stocks');
      }
      const data = await response.json();
      setUserCash(data)
    } catch (error) {
      console.error('Error fetching owned stocks:', error);
    }
  }
  const fetchTop5 = async () => {
    try {
      const response = await fetch(`http://localhost:5000/biggestMovers`);
      if (!response.ok) {
        throw new Error('Failed to fetch owned stocks');
      }
      const data = await response.json();
      console.log("BIGGEST MOVERS")
      setBiggestMovers(data)
      // setPriceHistory(data[ticker]); // Set the received data to the state
    } catch (error) {
      console.error('Error fetching owned stocks:', error);
    }
  }
  const fetchHistoricalPrices = async (theRange) => {
    try {
      const response = await fetch(`http://localhost:5000/historicalPrices?ticker=${'user'}`);
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
  const fetchOwnedStocks = async () => {
    try {
      const response = await fetch('http://localhost:5000/ownedStocks');
      if (!response.ok) {
        throw new Error('Failed to fetch owned stocks');
      }

      const data = await response.json();
      setOwnedStocks(data); // Set the received data to the state
    } catch (error) {
      console.error('Error fetching owned stocks:', error);
    }
  };
  const fetchClosingBalance = async () => {
    try {
      const response = await fetch('http://localhost:5000/closingBalance');
      if (!response.ok) {
        throw new Error('Failed to fetch owned stocks');
      }
      const data = await response.json();
      setClosingBalance(data); // Set the received data to the state
    } catch (error) {
      console.error('Error fetching owned stocks:', error);
    }
  };
  const fetchLastPrices = async () => {
    try {
      const response = await fetch('http://localhost:5000/lastPrices');
      if (!response.ok) {
        throw new Error('Failed to fetch owned stocks');
      }
      const data = await response.json();
      setLastPrices(data); // Set the received data to the state
    } catch (error) {
      console.error('Error fetching owned stocks:', error);
    }
  }
  const fetchPriceHistories = async () => {
    try {
      const response = await fetch('http://localhost:5000/priceHistories');
      if (!response.ok) {
        throw new Error('Failed to fetch owned stocks');
      }
      const data = await response.json();
      console.log(data)
      setPriceHistories(data); // Set the received data to the state
    } catch (error) {
      console.error('Error fetching owned stocks:', error);
    }
  }
  useEffect(() => {
    fetchOwnedStocks()
    fetchLastPrices()
    fetchHistoricalPrices(30)
    fetchPriceHistories()
    fetchClosingBalance()
    fetchTop5()
    fetchUserCash()
    setInterval(()=>{
      fetchTop5()
    },3000)
  }, [])

  useEffect(() => {
    if (!ownedStocks) return
    // Establish a WebSocket connection to the server
    const ws = new WebSocket('ws://localhost:5000');

    const requestStockPrices = () => {
      ws.send(String('getStockPrices'));
    };

    // When new data is received from the server, update the stock prices and UserBal
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.message == 'updateStockPrices') {
        console.log('Stock Prices Updated')
        setMarketClosed(data.marketClosed)
        setStockPrices(data.data);
        let newUserBal = 0
        Object.keys(ownedStocks).map((stock) => {
          newUserBal += ownedStocks[stock].shareCt * data.data[stock]
        })
        setUserBal(newUserBal)
      } else if (data.message == 'updateLastPrices') {
        console.log('lastPrices and HistoryUpdated')
        setLastPrices(data.data.lastPrices)
        setPriceHistories(data.data.priceHistory)
      } else if (data.message == 'updatePriceHistories') {
        console.log('Price History Updated')
        setPriceHistories(data.data)
      } else if (data.message == 'updateClosingBal') {
        console.log('Closing Balance Price Updataed')
        setClosingBalance(data.data.closingBalPrices['user'])
      }
      else {

        console.log("RECEIVED UNCATCHED MESSAGE - WEBSOCKET")
      }
    };

    // UpdateStock Interval
    const interval = setInterval(requestStockPrices, 1000);

    return () => {
      clearInterval(interval);
      ws.close();
    };
  }, [ownedStocks]);

  return (
    <>
      <NavBar />
      <div className="mt-6">

        <main className="flex max-w-[1400px] mx-auto gap-10 w-full">
          <div className="w-3/4">
            <h1 className="text-4xl ">Investing</h1>
            <h1 className="text-4xl ">{dollerFormat.format(userBal + userCash)}</h1>
            <p className='text-xs mt-1 flex gap-1'>
              {userBal ? closingBalance > userBal + userCash ?
                <span className=" text-red-500">${(Math.abs(userBal + userCash - closingBalance)).toFixed(2)} ({(100 * (userBal + userCash - closingBalance) / closingBalance).toFixed(2)}%)</span> :
                <span className=" text-green-500">${(Math.abs(userBal + userCash - closingBalance)).toFixed(2)} ({(100 * (userBal + userCash - closingBalance) / closingBalance).toFixed(2)}%)</span> : <></>}

              <span>{marketClosed ? 'Premarket' : 'Today'}</span>
            </p>
            {/* <MiniGraph value={stock.price} range={1} lastPrice={stock.lastPrice} priceHistory={priceHistory} marketClosed={marketClosed} /> */}
            <MiniGraph strokeW={3} value={userBal + userCash} lastPrice={closingBalance} priceHistory={priceHistories['user']} historicalPrices={historicalPrices} marketClosed={marketClosed} range={range} />
            {/* <GraphWindow value={userBal} prevClosingPrice={closingBalance} /> */}
            <div className='py-4 px-1 flex gap-2 flex-col'>
              <div className='flex basis-full gap-2 py-4'>
                {[1, 7, 30, 1000].map((i, index) => (<button key={index} className='font-bold text-white text-sm p-1 hover:bg-green-500 aspect-[3] basis-10 w-auto text-nowrap' onClick={() => setRange(i)}>{i} D</button>))}
              </div>

              <div className='flex py-4 border-y-[1px] border-neutral-700'>
                <span className='text-base font-bold grow'>Buying power</span>
                <span className='text-base font-bold'>{dollerFormat.format(userCash)}</span>
              </div>
              <BiggestMoversWindow biggestMovers={biggestMovers} lastPrices={lastPrices} stockPrices={stockPrices} />

            </div>
          </div>
          <div className="w-1/4 ">
            <div className="p-4 border-b-[1px] border-neutral-700 flex mb-6">
              <span className="grow">Market</span>
              {marketClosed ? <span className="text-red-500">Closed</span> : <span className="text-green-500">Open</span>}
            </div>
            <div className="border-[1px] rounded-md border-neutral-700 ">
              <h2 className="p-4 border-b-[1px] border-neutral-800 font-bold">Postions</h2>
              {/* {Object.keys(stockPrices).map(stock => <div key={stock}>{stockPrices[stock]}</div>)} */}
              <PositionsWindow ownedStocks={ownedStocks} stocks={stockPrices} />
              <h2 className="p-4 border-y-[1px] border-neutral-800 font-bold">Watch List</h2>
              <WatchListWindow stocks={stockPrices} lastPrices={lastPrices} marketClosed={marketClosed} priceHistories={priceHistories} />
            </div>

          </div>
        </main>
      </div>
    </>

  );
}
// DIVIDER
const PositionsWindow = ({ ownedStocks, stocks }) => {
  return (
    <div className="flex flex-col gap-4 text-sm">
      {Object.keys(ownedStocks).map((stock) => (<ItemPosition stock={{ ...ownedStocks[stock], ticker: stock, price: stocks[stock] }} key={stock} />)
      )}

      {/* {mockPostions.map((item, idx) => (<ItemPosition position={item} key={idx} />))} */}
    </div>
  )
}

const WatchListWindow = ({ stocks, lastPrices, marketClosed, priceHistories }) => {
  return (
    <div className="flex flex-col text-sm">
      {Object.keys(stocks).map((ticker, idx) => (<ItemWatchList priceHistory={priceHistories[ticker]} marketClosed={marketClosed} stock={{ price: stocks[ticker], ticker, lastPrice: lastPrices[ticker], change: (stocks[ticker] - lastPrices[ticker]) / lastPrices[ticker] }} key={idx} />))}
    </div>
  )
}

const BiggestMoversWindow = ({ biggestMovers, lastPrices, stockPrices }) => {
  console.log(lastPrices)
  console.log(stockPrices)
  return <>
    <h2 className="text-2xl font-semibold py-4">Biggest Movers</h2>
    <div className='flex gap-4'>
      {biggestMovers.map((stock) => <BigWindowItem key={stock.ticker} stock={stock} lastPrice={lastPrices[stock.ticker]} stockPrice={stockPrices[stock.ticker]} />)}
    </div></>
}
const BigWindowItem = ({ stock, lastPrice, stockPrice }) => {

  let percChange = 100 * (stockPrice - lastPrice) / lastPrice
  if (percChange < 0) return (<>
    <Link href={`/${stock.ticker}`} key={stock.ticker} className=' hover:bg-red-900 basis-[110px] aspect-[4/5] flex items-left p-4 justify-between font-semibold flex-col border-[1px] border-red-500'>
      <p className="text-sm text-right grow">{stock.ticker}</p>
      <span className='text-xl font-semibold text-red-500'>{dollerFormat.format(stockPrice)}</span>
      <span className='text-sm font-light text-red-500'>{percChange.toFixed(2)}%</span>
    </Link>
  </>)
  return (<>
    <Link href={`/${stock.ticker}`}  key={stock.ticker} className=' hover:bg-green-900 basis-[110px] aspect-[4/5] flex items-left p-4 justify-between font-semibold flex-col border-[1px] border-green-500'>
      <p className="text-sm text-right grow">{stock.ticker}</p>
      <span className='text-xl font-semibold text-green-500'>{dollerFormat.format(stockPrice)}</span>
      <span className='text-sm font-light text-green-500'>{percChange.toFixed(2)}%</span>
    </Link>
  </>)
}

const ItemPosition = ({ stock }) => {
  return (
    <Link href={`/${stock.ticker}`} className="p-4 flex hover:bg-neutral-800">
      <div className="grow">
        <p className="font-bold">{stock.ticker}</p>
        <p className="text-xs">{stock.shareCt} Shares</p>
      </div>
      <span className="font-bold">${(stock.price * stock.shareCt).toFixed(2)}</span>
    </Link>
  )
}

const ItemWatchList = ({ stock, priceHistory, marketClosed }) => {

  return (
    <Link href={`/${stock.ticker}`} className="flex items-center hover:bg-neutral-700 px-4 py-2">
      <span className="font-bold grow basis-1/4 shrink-0 ">{stock.ticker}</span>
      {/* {stock.changePer>0?  <div className="basis-28 bg-green-400 h-[2px]"></div>:  <div className="basis-28 bg-red-400 h-[2px]"></div>} */}
      <div className="shrink-0 grow-0 basis-1/5 flex justify-center">
        <MiniGraph value={stock.price} range={1} lastPrice={stock.lastPrice} priceHistory={priceHistory} marketClosed={marketClosed} />
      </div>
      <div className="grow shrink-0 basis-1/4 flex items-end flex-col gap-1 font-light ">
        <p className="grow text-sm">${stock.price}</p>
        {stock.change < 0 ? <p className="grow text-xs text-red-500 font-light">{(100 * stock.change).toFixed(2) || 0}%</p> : <p className="grow text-xs text-green-500 font-light">+{(100 * stock.change).toFixed(2) || 0}%</p>}
      </div>
    </Link>
  )
}