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
                    <Tooltip content={<CustomTooltip strokeW={3} />} />
                        <YAxis dataKey={'value'} hide={true} domain={['dataMin-10', 'dataMax+20']} />
                        <ReferenceLine ifOverflow="extendDomain" y={prevClosingPrice} stroke="#ddd" strokeDasharray="6 8" />
                        <Line activeDot={true} isAnimationActive={false} type="linear" strokeWidth={3} dot={false} dataKey="value" stroke={prevClosingPrice > value ? "red" : "#07CA0C"} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

        </div>
    )
}


const CustomTooltip = ({ active, payload, label, strokeW }) => {
    if (active && payload && payload.length) {
        if (strokeW) return (
            <div className="custom-tooltip p-1 bg-black text-lg">
                <p>${Number(payload[0].value).toFixed(2)}</p>
                {/* <p className="label">{`${label} : ${payload[0].value}`}</p> */}
                {/* <p className="intro">{getIntroOfPage(label)}</p> */}
                {/* <p className="desc">Anything you want can be displayed here.</p> */}
            </div>
        )
        else {
            return <div className="custom-tooltip p-1 bg-black text-[10px]">
                <p>${Number(payload[0].value).toFixed(2)}</p>
                {/* <p className="label">{`${label} : ${payload[0].value}`}</p> */}
                {/* <p className="intro">{getIntroOfPage(label)}</p> */}
                {/* <p className="desc">Anything you want can be displayed here.</p> */}
            </div>
        }

    }

    return null;
};

export default GraphWindow