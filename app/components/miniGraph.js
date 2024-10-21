"use client"
import React, { useCallback, useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';



const MiniGraph = () => {
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


    useEffect(() => {
        const interval = setInterval(() => {
            setCurrPrice((curr) => {
                let newPrice = curr + (((Math.random() * .1) - .048) * curr)
                return newPrice
            })
            setCurr(x => x + 1)
        }, 1000)
        return () => clearInterval(interval)
    }, [setCurrPrice])

    // UPDATE GRAPH WHEN CURR PRICE CHANGES
    useEffect(() => {
        UpdateGraph(currPrice)
    }, [currPrice])

    return (
        <div className='w-[120px]'>

            <ResponsiveContainer width="100%" aspect={3} >
                <LineChart
                    width={100}
                    height={170}
                    data={priceData}
                    margin={{
                        top: 0,
                        right: 0,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <Tooltip isAnimationActive={false} />
                    <YAxis dataKey={'value'} hide={true} domain={[20, 80]} />
                    <ReferenceLine ifOverflow="extendDomain" y={50} stroke="#ddd" strokeDasharray="1 5" />
                    <Line isAnimationActive={false} type="linear" strokeWidth={1} dot={false} dataKey="value" stroke="#07CA0C" />
                </LineChart>
            </ResponsiveContainer>
        </div >
    )
}

export default MiniGraph