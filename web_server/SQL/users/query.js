const connection = require('../init');

function getUsers(callback) {
    const sql = 'SELECT * FROM users';

    connection.query(sql, (err, results) => {
        if (err) {
            return callback(err);
        }
        callback(null, results);
    });
}

function createUser(data, callback) {
    const { name, birthdate, email, password } = data;
    const sql = 'INSERT INTO users (name, birthdate, email, password) VALUES (?, ?, ?, ?)';

    connection.query(sql, [name, birthdate, email, password], (err, result) => {
        if (err) {
            return callback(err);
        }
        callback(null, result);
    });
};