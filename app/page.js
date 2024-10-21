"use client"
import Image from "next/image";
import GraphWindow from './components/graphWindow'
import MiniGraph from "./components/miniGraph";
import { useEffect, useState } from "react";
import Link from "next/link";
// DIVIDER
// On load connect to backend server. Instantiate a socket for each stock in the watchlist
// Loop through each stock owned and fetch new data for each. .1s gap between each fetch
// Loop through each stock watchlist and fetch new data for each .1s gap between each fetch
// 1s interval to recalculate user balance

export default function Home() {
  const [userBal, setUserBal] = useState(0)
  const [ownedStocks, setOwnedStocks] = useState({
    'spy': {
      shareCt: 20
    }
  })
  const [stocks, setStocks] = useState({
    'spy': {
      price: 300
    }
  })

  const updateStock = () => {
    Object.keys(stocks).map((stock) => {
      let newPrice = stocks[stock].price * ((Math.random() * .05) +1 - .025)
      // console.log(newPrice);
      
      setStocks((old) => {
        let a = old
        a[stock].price = newPrice
        console.log(old);
        
        return a
      })
      // Wait Fetch new data
      // wait for updated UI then move on to next
    })
  }
  useEffect(()=>{
    console.log("HJFOIEFJ")
  },[stocks])
  const updateUserBal = () => {
    Object.keys(ownedStocks).map((stock) => {
      let newUserBal = 0
      newUserBal += stock.shareCt * stocks[stock].price
      setUserBal(newUserBal)
    })
  }

  useEffect(() => {
    const interval = setInterval(() => {
      updateStock()
      updateUserBal()
    }, 1000);
  }, [])
  return (
    <div className="mt-6">
      <main className="flex max-w-[1400px] mx-auto gap-10 w-full">
        <div className="w-3/4">
          <GraphWindow />
        </div>
        <div className="w-1/4 border-[1px] border-neutral-700 rounded-md">
          <h2 className="p-4 border-b-[1px] border-neutral-800 font-bold">Postions</h2>
          {Object.keys(stocks).map((stock) => <div key={stock}>{stock} --- {stocks[stock].price}</div>)}
          <PositionsWindow />
          <h2 className="p-4 border-y-[1px] border-neutral-800 font-bold">Watch List</h2>
          <WatchListWindow />
        </div>
      </main>
    </div>
  );
}


const WatchListWindow = () => {
  return (
    <div className="p-4 flex flex-col gap-4 text-sm">
      {mockWatchList.map((item, idx) => (<ItemWatchList watching={item} key={idx} />))}
    </div>
  )
}
const PositionsWindow = () => {
  return (
    <div className="p-4 flex flex-col gap-4 text-sm">
      {mockPostions.map((item, idx) => (<ItemPosition position={item} key={idx} />))}
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

const ItemPosition = ({ position }) => {
  return (
    <div className="flex">
      <div className="grow">
        <p className="font-bold">{position.ticker}</p>
        <p className="text-xs">{position.count} Shares</p>
      </div>
      <span className="font-bold">${position.value}</span>
    </div>
  )
}

const ItemWatchList = ({ watching }) => {
  return (
    <Link href={`/${watching.ticker}`} className="flex items-center gap-2">
      <span className="font-bold grow">{watching.ticker}</span>
      {/* {watching.changePer>0?  <div className="basis-28 bg-green-400 h-[2px]"></div>:  <div className="basis-28 bg-red-400 h-[2px]"></div>} */}
      <MiniGraph />
      <div className="grow flex items-end flex-col">
        <p className="grow">${watching.value}</p>
        <p className="grow">{watching.changePer}%</p>
      </div>
    </Link>
  )
}