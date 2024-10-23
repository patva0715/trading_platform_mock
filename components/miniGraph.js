"use client"
import React, { useCallback, useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const MiniGraph = ({value,lastPrice}) => {
    const now = Date.now()
    const [priceData, setPriceData] = useState(Array.from({ length: 50 }, (_, index) => ({ value: null, x: index })))
    const [timeIdx, setCurr] = useState(0)
    const [currPrice, setCurrPrice] = useState(59)

    const UpdateGraph = (newPrice) => {
 
            setPriceData((prev) => {
                let ar=prev.slice(1)
                ar.push({value:newPrice,x:50})
            // let index = Math.floor(getTimeSince() / 300)
            return ar
        })
        // console.log(newPrice)
    }


    // UPDATE GRAPH WHEN CURR PRICE CHANGES
    useEffect(() => {
        UpdateGraph(value)
        // console.log(timeIdx)
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
                    <YAxis dataKey={'value'} hide={true} domain={['dataMin-10','dataMax+10']}/>
                    <ReferenceLine ifOverflow="extendDomain" y={lastPrice} stroke="#ddd" strokeDasharray="1 5" />
                    <Line isAnimationActive={false} type="linear" strokeWidth={1} dot={false} dataKey="value" stroke={lastPrice>value?"red":"#07CA0C"} />
                </LineChart>
            </ResponsiveContainer>
        </div >
    )
}

export default MiniGraph