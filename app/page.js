"use client"
import Image from "next/image";
import GraphWindow from '../components/graphWindow'
import MiniGraph from "../components/miniGraph";
import { useEffect, useState } from "react";
import Link from "next/link";
import NavBar from "@/components/navbar";
// DIVIDER
// On load connect to backend server. Instantiate a socket for each stock in the watchlist
// Loop through each stock owned and fetch new data for each. .1s gap between each fetch
// Loop through each stock watchlist and fetch new data for each .1s gap between each fetch
// 1s interval to recalculate user balance

export default function Home() {
  const [userBal, setUserBal] = useState(0)
  const [ownedStocks, setOwnedStocks] = useState({})
  const [stockPrices, setStockPrices] = useState({});
  const [lastPrices, setLastPrices] = useState({});

  // DIVIDER
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
  useEffect(() => {
    fetchOwnedStocks()
    fetchLastPrices()
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
      console.log(data)
      if (data.message == 'stockPrices') {
        setStockPrices(data.data);
        let newUserBal = 0
        Object.keys(ownedStocks).map((stock) => {
          newUserBal += ownedStocks[stock].shareCt * data.data[stock]
        })
        setUserBal(newUserBal)
      }else if (data.message=='updateLastPrices'){
        console.log('lastPrices Updated')
        setLastPrices(data.data)
      }else{
        console.log(data)
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
            <h1 className="text-4xl ">${userBal.toFixed(2)}</h1>
            <p className="text-xs mt-1">$330(31.91%)<span>Today</span></p>
            <GraphWindow value={userBal} />
            <div className='py-4 px-1 flex gap-2 flex-col'>
              <div className='flex basis-full gap-2 py-4'>
                {["1D", "1W", "1M", "YTD", "1Y"].map((range) => (<button key={range} className='font-bold text-white text-sm p-1 hover:bg-green-500 aspect-[3] basis-10 w-auto'>{range}</button>))}
              </div>

              <div className='flex py-4 border-y-[1px] border-neutral-700'>
                <span className='text-base font-bold grow'>Buying power</span>
                <span className='text-base font-bold'>$499.21</span>
              </div>

              <h2 className="text-2xl font-semibold py-4">Biggest Movers</h2>
              <div className='flex gap-4'>
                {['SPY', 'AMD', 'NVDA', 'COIN'].map((stock) => (
                  <div key={stock} className='basis-[110px] aspect-[4/5] flex items-left p-4 justify-between font-semibold flex-col border-[1px] border-white'>
                    <p className="text-sm text-right grow">{stock}</p>
                    <span className='text-xl font-semibold text-green-500'>$123.23</span>
                    <span className='text-sm font-light text-green-500'>10.54%</span>
                  </div>
                ))}
              </div>

            </div>
          </div>
          <div className="w-1/4 border-[1px] border-neutral-700 rounded-md">
            <h2 className="p-4 border-b-[1px] border-neutral-800 font-bold">Postions</h2>
            {/* {Object.keys(stockPrices).map(stock => <div key={stock}>{stockPrices[stock]}</div>)} */}
            <PositionsWindow ownedStocks={ownedStocks} stocks={stockPrices} />
            <h2 className="p-4 border-y-[1px] border-neutral-800 font-bold">Watch List</h2>
            <WatchListWindow stocks={stockPrices} lastPrices={lastPrices} />
          </div>
        </main>
      </div>
    </>

  );
}
// DIVIDER
const PositionsWindow = ({ ownedStocks, stocks }) => {
  return (
    <div className="p-4 flex flex-col gap-4 text-sm">
      {Object.keys(ownedStocks).map((stock) => (<ItemPosition stock={{ ...ownedStocks[stock], ticker: stock, price: stocks[stock] }} key={stock} />)
      )}

      {/* {mockPostions.map((item, idx) => (<ItemPosition position={item} key={idx} />))} */}
    </div>
  )
}

const WatchListWindow = ({ stocks, lastPrices }) => {
  return (
    <div className="flex flex-col text-sm">
      {Object.keys(stocks).map((ticker, idx) => (<ItemWatchList stock={{ price: stocks[ticker], ticker, lastPrice: lastPrices[ticker], change: (stocks[ticker] - lastPrices[ticker]) / lastPrices[ticker] }} key={idx} />))}
    </div>
  )
}

const mockPostions = [
  {
    ticker: "SPY",
    value: 163,
    count: 17
  },
  {
    ticker: "NVDA",
    value: 329,
    count: 3
  },
  {
    ticker: "AMD",
    value: 219,
    count: 53
  },
]

const mockWatchList = [{
  ticker: "SPY",
  value: 568.21,
  changePer: -.08,
}, {
  ticker: "AMD",
  value: 152.23,
  changePer: .08
}, {
  ticker: "TSLA",
  value: 243.23,
  changePer: .08
}, {
  ticker: "META",
  value: 558.78,
  changePer: -.28
}, {
  ticker: "COIN",
  value: 170.22,
  changePer: .08
}, {
  ticker: "GME",
  value: 19.60,
  changePer: .08
},]

const ItemPosition = ({ stock }) => {
  // console.log(stock)
  return (
    <div className="flex">
      <div className="grow">
        <p className="font-bold">{stock.ticker}</p>
        <p className="text-xs">{stock.shareCt} Shares</p>
      </div>
      <span className="font-bold">${(stock.price * stock.shareCt).toFixed(2)}</span>
    </div>
  )
}

const ItemWatchList = ({ stock }) => {
  const [priceHistory, setPriceHistory] = useState([])
  const fetchHistory = (ticker) => {
    fetch(`http://localhost:5000/history?ticker=${ticker}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch owned stocks');
        }
        return response.json();
      })
      .then(data => {
        console.log(data)
        setPriceHistory(data); // Handle the data (e.g., setOwnedStocks(data))
      })
      .catch(error => {
        console.error('Error fetching owned stocks:', error);
      });
  }
  useEffect(() => {
    fetchHistory(stock.ticker)
  }, [stock.ticker])

  return (
    <Link href={`/${stock.ticker}`} className="flex items-center hover:bg-neutral-700 px-4 py-2">
      <span className="font-bold grow basis-1/4 shrink-0 ">{stock.ticker}</span>
      {/* {stock.changePer>0?  <div className="basis-28 bg-green-400 h-[2px]"></div>:  <div className="basis-28 bg-red-400 h-[2px]"></div>} */}
      <div className="shrink-0 grow-0 basis-1/5 flex justify-center">
        <MiniGraph value={stock.price} lastPrice={stock.lastPrice} priceHistory={priceHistory} />
      </div>
      <div className="grow shrink-0 basis-1/4 flex items-end flex-col gap-1 font-light ">
        <p className="grow text-sm">${stock.price}</p>
        {stock.change < 0 ? <p className="grow text-xs text-red-500 font-light">{(100 * stock.change).toFixed(2) || 0}%</p> : <p className="grow text-xs text-green-500 font-light">+{(100 * stock.change).toFixed(2) || 0}%</p>}
      </div>
    </Link>
  )
}