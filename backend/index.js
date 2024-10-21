import express from 'express'
import client from './db.js'

const app = express()

app.get('/',(req,res)=>{
    console.log(client.port)
    console.log(client.port)
    res.send("HELLO")
})
app.listen(5000,()=>console.log("SERVER STARTED"))