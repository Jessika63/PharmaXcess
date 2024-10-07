const app = require('../init')
const { getMachines } = require("../SQL/vending_machines/query")
const { generateGoogleMapsLink } = require("../tools/google_map")

app.get('/vending_machines', (req, res) => {
    getMachines((err, machines) => {
        if (err)
            return res.status(500).json({ error: 'Database query failed' })
        res.json(machines)
    })
})

app.get('/vending_machines/get_nearest', (req, res) => {
    const { latitude, longitude } = req.query
  
    if (!latitude || !longitude)
        return res.status(400).json({ error: 'Latitude and Longitude are required.' })
    getNearestMachines(longitude, latitude, 10, (err, machines) => {
        if (err)
            return res.status(500).json({ error: 'Database query failed' })
        res.json(machines)
    })
})

app.get('/vending_machines/get_itinary', (req, res) => {
    const { latitude, longitude, id } = req.query // latitude & longitude are user's coords

    if (!id | id < 0)
        return res.status(400).json({ error: 'ID is required.' })
    getMachinesByID(id, (err, machine) => {
        if (err)
            return res.status(500).json({ error: 'Database query failed' })
        res.json(generateGoogleMapsLink({latA: latitude, lngA: longitude}, {latB: machine.latitude, lngB: machine.longitude}))
    })
})