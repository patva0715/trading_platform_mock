"use client"
import React, { useCallback, useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const data = [
    { "value": 47, "x": 0 },
    { "value": 85, "x": 1 },
    { "value": 44, "x": 2 },
    { "value": 46, "x": 3 },
    { "value": 48, "x": 4 },
    { "value": 52, "x": 5 },
    { "value": 26, "x": 6 },
    { "value": 48, "x": 7 },
    { "value": 45, "x": 8 },
    { "value": 44, "x": 9 },
    { "value": 48, "x": 10 },
    { "value": 50, "x": 11 },
    { "value": 49, "x": 12 },
    { "value": 69, "x": 13 },
    { "value": 61, "x": 14 },
    { "value": 37, "x": 15 },
    { "value": 19, "x": 16 },
    { "value": 81, "x": 17 },
    { "value": 82, "x": 18 },
    { "value": 97, "x": 19 },
    { "value": 85, "x": 20 },
    { "value": 70, "x": 21 },
    { "value": 38, "x": 22 },
    { "value": 30, "x": 23 },
    { "value": 38, "x": 24 },
    { "value": 20, "x": 25 },
    { "value": 22, "x": 26 },
    { "value": 26, "x": 27 },
    { "value": 29, "x": 28 },
    { "value": 65, "x": 29 },
    { "value": 59, "x": 30 },
    { "value": 40, "x": 31 },
    { "value": 36, "x": 32 },
    { "value": 79, "x": 33 },
    { "value": 55, "x": 34 },
    { "value": 41, "x": 35 },
    { "value": 43, "x": 36 },
    { "value": 55, "x": 37 },
    { "value": 40, "x": 38 },
    { "value": 84, "x": 39 },
    { "value": 49, "x": 40 },
    { "value": 40, "x": 41 },
    { "value": 44, "x": 42 },
    { "value": 48, "x": 43 },
    { "value": 45, "x": 44 },
    { "value": 50, "x": 45 },
    { "value": 51, "x": 46 },
    { "value": 79, "x": 47 },
    { "value": 93, "x": 48 },
    { "value": 120, "x": 49 },
    { "value": 100, "x": 50 },
    { "value": 136, "x": 51 },
    { "value": null, "x": 52 },
    { "value": null, "x": 53 },
    { "value": null, "x": 54 },
    { "value": null, "x": 55 },
    { "value": null, "x": 56 },
    { "value": null, "x": 57 },
    { "value": null, "x": 58 },
    { "value": null, "x": 59 },
    { "value": null, "x": 60 },
    { "value": null, "x": 61 },
    { "value": null, "x": 62 },
    { "value": null, "x": 63 },
    { "value": null, "x": 64 },
    { "value": null, "x": 65 },
    { "value": null, "x": 66 },
    { "value": null, "x": 67 },
    { "value": null, "x": 68 },
    { "value": null, "x": 69 },
    { "value": null, "x": 70 },
    { "value": null, "x": 71 },
    { "value": null, "x": 72 },
    { "value": null, "x": 73 },
    { "value": null, "x": 74 },
    { "value": null, "x": 75 },
    { "value": null, "x": 76 },
    { "value": null, "x": 77 }
]

function getTimeSince() {
    // Get the current time in UTC
    const now = new Date();

    // Create a new Date object for today's date at 2:30 PM UTC
    const targetTime = new Date();
    targetTime.setUTCHours(13, 30, 0, 0); // Set time to 1:30 PM UTC (14:30)

    // If the current time is before 2:30 PM UTC today, calculate from the previous day
    if (now < targetTime) {
        targetTime.setDate(targetTime.getDate() - 1);
    }

    // Calculate the difference in seconds
    const differenceInMilliseconds = now - targetTime;
    const differenceInSeconds = Math.floor(differenceInMilliseconds / 1000);

    return differenceInSeconds;
}
const GraphWindow = ({value}) => {
    const now = Date.now()
    const [priceData, setPriceData] = useState(Array.from({ length: 78 }, (_, index) => ({ value: null, x: index })))
    const [timeIdx, setCurr] = useState(-1)
    const [currPrice, setCurrPrice] = useState(59)

    const UpdateGraph = useCallback((newPrice) => {
        setPriceData((prev) => {
            // let index = Math.floor(getTimeSince() / 300)
            return prev.map((item, i) => {
                return (i == timeIdx ? { ...item, value: newPrice } : item)
            })
        })
        // console.log(newPrice)
    }, [timeIdx])

    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         // setPriceData((prev) => {
    //         //     let index = Math.floor(getTimeSince() / 300)
    //         //     console.log(index)
    //         //     return prev.map((item, i) => (i == index ? { ...item, value: Math.random() } : item))
    //         // })
    //         setCurr(x => x + 1)
    //     }, 1000)
    //     return () => clearInterval(interval)
    // }, [])
    
    // Interval that updates current price
    useEffect(()=>{
        const interval= setInterval(()=>{
            setCurrPrice((curr)=>{
                let newPrice = curr + (((Math.random() * .1) - .048) * curr)
                return newPrice
            })
            setCurr(x=>x+1)
        },3000)
        return ()=>clearInterval(interval)
    },[setCurrPrice])

    // UPDATE GRAPH WHEN CURR PRICE CHANGES
    useEffect(() => {
        UpdateGraph(value)
    }, [value])

    return (
        <div>
    
            <div className=' w-full '>
                <ResponsiveContainer width="100%" aspect={2} >
                    <LineChart
                        width={200}
                        height={300}
                        data={priceData}
                        margin={{
                            top: 55,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <Tooltip isAnimationActive={false} />
                        <YAxis dataKey={'value'} hide={true} domain={[20, 250]} />
                        <ReferenceLine ifOverflow="extendDomain" y={50} stroke="#ddd" strokeDasharray="1 5" />
                        <Line isAnimationActive={false} type="linear" strokeWidth={1.5} dot={false} dataKey="value" stroke="#07CA0C" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className='py-4 px-1 flex border-y-[1px] border-neutral-800'>
                <span className='text-base font-bold grow'>Buying power</span>
                <span className='text-base font-bold'>$499.21</span>

            </div>
        </div>
    )
}




export default GraphWindow