const express = require('express')
const app = express()

const { initSQL, endSQL } = require('./SQL/init');
const vendingMachineRoutes = require('./API/vending_machines');

app.use(express.json());


app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.use(vendingMachineRoutes);

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000')
    initSQL()
})

module.exports = app;