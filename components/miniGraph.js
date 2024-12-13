"use client"
import React, { useCallback, useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, ScatterChart, Scatter, ComposedChart, Bar } from 'recharts';

const MiniGraph = ({ value, lastPrice, priceHistory, marketClosed, strokeW, range, historicalPrices }) => {
    let historicalPricesFormatted = historicalPrices?historicalPrices.map((price, i) => ({ ...price, x: i })):[]
    const [priceData, setPriceData] = useState([])
    const [idx, setCurrIdx] = useState(0)
    const UpdateGraph = (newPrice) => {
        setPriceData((prev) => {
            let ar = prev.slice(0)
            ar[idx] = { x: idx, value: newPrice }
            setCurrIdx(x => x + 1)
            return ar
        })
    }

    // UPDATE GRAPH WHEN CURR PRICE CHANGES
    useEffect(() => {
        if (!marketClosed) UpdateGraph(value)
    }, [value, marketClosed])

    useEffect(() => {
        let interval = null
        if (marketClosed) {
            interval = setInterval(() => setPriceData((prev) => {
                let ar = prev.slice(0)
                ar[0] = { x: 0, value }
                setCurrIdx(x => {
                    ar.push({ x, value })
                    return x + 1
                })
                return ar
            }), 1000)
        }
        else {
            if (interval) clearInterval(interval)
        }
        return (() => clearInterval(interval))
    }, [marketClosed])

    useEffect(() => {
        if(!priceHistory)return
        if (priceHistory.length == 0) {
            setPriceData([{ x: 0, value: value }])
            setCurrIdx(0)
        }
        else {
            let ar = priceHistory.slice(30)
            // console.log(priceHistory)
            setPriceData(priceHistory.map((price, i) => ({ ...price, x: i })))
            setCurrIdx(priceHistory.length)
        }
    }, [priceHistory])
    // console.log(historicalPrices)
    return (
        <div className='w-full'>

            <ResponsiveContainer width="100%" height="100%" minWidth={100} aspect={2}  >
                <ComposedChart
                    margin={{
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                    }}
                >
                    {range == 1 ? <>
                        <XAxis domain={[0, 44]} hide={true} type="number" dataKey="x" name="stature"  />
                        <YAxis domain={[lastPrice * .85, lastPrice * 1.15]} type="number" hide={true} dataKey="value" name="weight" unit="kg" />
                        <Bar dataKey="value" barSize={30} fill="red" />
                        <Tooltip content={<CustomTooltip strokeW={strokeW} />} />
                        {/* <Legend /> */}
                        <ReferenceLine ifOverflow="extendDomain" y={lastPrice} stroke="#ddd" strokeDasharray="1 5" />
                        <Scatter isAnimationActive={true} name="A school" data={priceData} fill={lastPrice > value ? "red" : "#07CA0C"} line={{ strokeWidth: strokeW || 1 }} shape={<></>} />
                    </> : <>
                        <XAxis domain={[0,range*30]}  hide={true} type="number" dataKey="x" name="stature" unit="D" />
                        <YAxis 
                        domain={[Math.min(...historicalPricesFormatted.map(obj => obj.value))*.8,Math.max(...historicalPricesFormatted.map(obj => obj.value))*1.2]} 
                        type="number" hide={true} dataKey="value"  />
                        <Bar dataKey="value" barSize={500} fill="red" />
                        <Tooltip content={<CustomTooltip strokeW={strokeW} />} />
                        {/* <Legend /> */}
                        <Scatter isAnimationActive={true} name="A school" data={historicalPricesFormatted} fill={"#07CA0C"} line={{ strokeWidth: strokeW || 1 }} shape={<></>} />
                    </>}

                </ComposedChart>
            </ResponsiveContainer>
        </div >
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
export default MiniGraph

{/* <LineChart
width={100}
height={170}
data={priceData || [...Array.from({ length: 45 }, (_, index) => ({ value: null }))]}
margin={{
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
}}
>
<YAxis dataKey={'value'} hide={true} domain={['dataMin-10', 'dataMax+10']} />
<ReferenceLine ifOverflow="extendDomain" y={lastPrice} stroke="#ddd" strokeDasharray="1 5" />
<Line isAnimationActive={false} type="linear" strokeWidth={1} dot={false} dataKey="value" stroke={lastPrice > value ? "red" : "#07CA0C"} />
</LineChart> */}