const app = require('../init');
const { getMachines } = require("../SQL/vending_machines/query")

app.get('/vending_machines', (req, res) => {
    getMachines((err, machines) => {
        if (err) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.json(machines);
    })
});

app.get('/vending_machines/get_nearest', (req, res) => {
    const { latitude, longitude } = req.query;
  
    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Latitude and Longitude are required.' });
    }
    //TODO : get nearest machines

});