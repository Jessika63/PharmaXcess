const { connection } = require('../init')

function getMachines(callback) {
    const sql = 'SELECT * FROM vending_machines'

    connection.query(sql, (err, results) => {
        if (err) {
            return callback(err)
        }
        callback(null, results)
    })
}

function getMachinesByName(name, callback) {
    const sql = 'SELECT * FROM vending_machines WHERE name = ?'

    connection.query(sql, [name], (err, results) => {
        if (err) {
            return callback(err)
        }
        callback(null, results)
    })
}

function getMachineByID(id, callback) {
    const sql = 'SELECT * FROM vending_machines WHERE id = ? LIMIT 1'

    connection.query(sql, [id], (err, results) => {
        if (err) {
            return callback(err)
        }
        callback(null, results.length > 0 ? results[0] : null)
    })
}

function getNearestMachines(longitude, latitude, limit = 10, callback) {
    if (!longitude || !latitude) {
        return callback(new Error('Longitude and Latitude are required.'))
    }

    const sql = `
        SELECT id, name, latitude, longitude,
        (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?))
        + sin(radians(?)) * sin(radians(latitude)))) AS distance
        FROM vending_machines
        ORDER BY distance
        LIMIT ?
    `
    const params = [latitude, longitude, latitude, limit]

    connection.query(sql, params, (err, results) => {
        if (err) {
            return callback(err)
        }
        callback(null, results)
    })
}

module.exports = { getMachines, getMachinesByName, getMachineByID, getNearestMachines }