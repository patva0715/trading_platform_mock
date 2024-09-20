import Image from "next/image";

export default function Home() {
  return (
    <div className="">
      <main className="flex max-w-[1400px] mx-auto gap-2 w-full">
        <div className="w-3/4">
          <GraphWindow />
        </div>
        <div className="w-1/4 border-2 border-neutral-700 ">
          <h2 className="p-4 border-b-2 border-neutral-800 font-bold">Postions</h2>
          <PositionsWindow />
          <h2 className="p-4 border-y-2 border-neutral-800 font-bold">Watch List</h2>
          <WatchListWindow />
        </div>
      </main>
    </div>
  );
}

const GraphWindow = () => {
  return (
    <div >
      Investing 123
    </div>
  )
}
const WatchListWindow = () => {
  return (
    <div className="p-4 flex flex-col gap-4 text-sm">
      {mockWatchList.map((item, idx) => (<ItemWatchList watching={item} key={idx}/>))}
    </div>
  )
}
const PositionsWindow = () => {
  return (
    <div className="p-4 flex flex-col gap-4 text-sm">
      {mockPostions.map((item, idx) => (<ItemPosition position={item} key={idx}/>))}
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

const ItemPosition = ({position}) => {
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

const ItemWatchList = ({watching}) => {
  return (
    <div className="flex items-center gap-2">
      <span className="font-bold grow">{watching.ticker}</span>
      {watching.changePer>0?  <div className="basis-28 bg-green-400 h-[2px]"></div>:  <div className="basis-28 bg-red-400 h-[2px]"></div>}
    
      <div className="grow flex items-end flex-col">
        <p className="grow">${watching.value}</p>
        <p className="grow">{watching.changePer}%</p>
      </div>
    </div>
  )
}