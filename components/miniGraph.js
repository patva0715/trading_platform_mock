"use client"
import React, { useCallback, useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const MiniGraph = ({ value, lastPrice, priceHistory }) => {
    // if (!priceHistory) return <></>
    // const [priceData, setPriceData] = useState([...priceHistory, ...Array.from({ length: 50 }, (_, index) => ({ value: null}))] )
    const [priceData, setPriceData] = useState([])
    const [idx, setCurrIdx] = useState(0)
    if (priceData.length<priceHistory.length){
        setPriceData([...priceHistory, ...Array.from({ length: 50 }, (_, index) => ({ value: null}))])
    }

    if(idx<priceHistory.length){
        setCurrIdx(priceHistory.length)
    }
    const UpdateGraph = (newPrice) => {
        setPriceData((prev) => {
            let ar = prev.slice(0)
            ar[idx] = { value: newPrice }
            setCurrIdx(x => x + 1)
            // ar.push({value:newPrice,x:50})
            // let index = Math.floor(getTimeSince() / 300)
            return ar
        })
    }

    // UPDATE GRAPH WHEN CURR PRICE CHANGES
    useEffect(() => {
        UpdateGraph(value)
    }, [value])



    return (
        <div className='w-full'>

            <ResponsiveContainer width="100%" height="100%" minWidth={50} aspect={2} >
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
                    {/* <Tooltip isAnimationActive={false} /> */}
                    <YAxis dataKey={'value'} hide={true} domain={['dataMin-10', 'dataMax+10']} />
                    <ReferenceLine ifOverflow="extendDomain" y={lastPrice} stroke="#ddd" strokeDasharray="1 5" />
                    <Line isAnimationActive={false} type="linear" strokeWidth={1} dot={false} dataKey="value" stroke={lastPrice > value ? "red" : "#07CA0C"} />
                </LineChart>
            </ResponsiveContainer>
        </div >
    )
}

export default MiniGraph