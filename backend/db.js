import pg from 'pg'
const { Client } = pg
const client = new Client({
    user: 'postgres',
    password: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'trademock',
  })
await client.connect()
console.log("Connected")
// await client.end()
console.log("Disconnected")

export default client