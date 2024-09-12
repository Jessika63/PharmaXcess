const connection = require('../init');

function getMachines(callback) {
    const sql = 'SELECT * FROM vending_machines';

    connection.query(sql, (err, results) => {
        if (err) {
            return callback(err);
        }
        callback(null, results);
    });
}

function getMachinesByName(name, callback) {
    const sql = 'SELECT * FROM vending_machines WHERE name = ?';

    connection.query(sql, [name], (err, results) => {
        if (err) {
            return callback(err);
        }
        callback(null, results);
    });
}

module.exports = { getMachines, getMachinesByName }