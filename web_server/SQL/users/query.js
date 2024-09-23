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

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return callback(err);
        }

        connection.query(sql, [name, birthdate, email, hashedPassword], (err, result) => {
            if (err) {
                return callback(err);
            }
            callback(null, result);
        });
    });
};

function getUserByID(id, callback) {
    const sql = 'SELECT id, name, email, birthdate FROM users WHERE id = ?';

    connection.query(sql, [id], (err, results) => {
        if (err) {
            return callback(err);
        }
        callback(null, results);
    });
};

function getUsersByName(name, callback) {
    const sql = 'SELECT id, email, birthdate FROM users WHERE name = ?';

    connection.query(sql, [id], (err, results) => {
        if (err) {
            return callback(err);
        }
        callback(null, results);
    });
}

module.exports = { getUsers, createUser, getUserByID, getUsersByName }