const express = require('express')
const bodyParser = require('body-parser')
const app = express()

const { initSQL, endSQL } = require('./SQL/init')

app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000')
    initSQL()
})

module.exports = app