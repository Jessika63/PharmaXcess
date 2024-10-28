const router = require('express').Router();
const { getMachines } = require('../SQL/vending_machines/query')


router.get('/vending_machines', (req, res) => {
    getMachines((err, machines) => {
        if (err)
            return res.status(500).json({ error: 'Database query failed' });
        res.json(machines);
    })
});

router.get('/vending_machines/get_nearest', (req, res) => {
    const { latitude, longitude } = req.query;
  
    if (!latitude || !longitude)
        return res.status(400).json({ error: 'Latitude and Longitude are required.' });
    getNearestMachines(longitude, latitude, 10, (err, machines) => {
        if (err)
            return res.status(500).json({ error: 'Database query failed' });
        res.json(machines)
    })
});

module.exports = router;