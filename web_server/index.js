const express = require('express')
const app = express()

const { initSQL, endSQL } = require('./SQL/init');

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000')
    initSQL()
})