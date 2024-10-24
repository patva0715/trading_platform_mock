"use client"
import React, { useCallback, useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const GraphWindow = ({ value, prevClosingPrice }) => {
    const [priceData, setPriceData] = useState(Array.from({ length: 78 }, (_, index) => ({ value: null, x: index })))
    const [timeIdx, setCurr] = useState(-1)

    const UpdateGraph = useCallback((newPrice) => {
        setCurr(x => x + 1)
        setPriceData((prev) => {
            if (timeIdx > 78) {
                let ar = prev.slice(1)
                ar.push({ value: newPrice, x: 78 })
                return ar
            }
            return prev.map((item, i) => {
                return (i == timeIdx ? { ...item, value: newPrice } : item)
            })
        })
    }, [timeIdx])

    // UPDATE GRAPH WHEN CURR PRICE CHANGES
    useEffect(() => {
        UpdateGraph(value)
    }, [value])

    return (
        <div>
            <div className=' w-full '>
                <ResponsiveContainer width={'100%'} height={'100%'} aspect={2.8} >
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
                        <Tooltip className="bg-transparent" isAnimationActive={false} />
                        <YAxis dataKey={'value'} hide={true} domain={['dataMin-10', 'dataMax+20']} />
                        <ReferenceLine ifOverflow="extendDomain" y={prevClosingPrice} stroke="#ddd" strokeDasharray="6 8" />
                        <Line activeDot={true} isAnimationActive={false} type="linear" strokeWidth={3} dot={false} dataKey="value" stroke={prevClosingPrice > value ? "red" : "#07CA0C"} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

        </div>
    )
}




export default GraphWindow