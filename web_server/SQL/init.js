const mysql = require('mysql2')
const fs = require('fs')
const path = require('path')

const connection = mysql.createConnection({ // TODO : replace by .env file
    host: 'localhost',
    user: 'myuser',
    password: 'mypassword',
    database: 'mydatabase'
})

const initSQL = () => {
    connection.connect((err) => {
        if (err) {
            console.error('Connexion error : ' + err.stack)
            return
        }
        console.log('Connected to DB.')
    
        const sqlFilePath = path.join(__dirname, '', 'init.sql');
        const sql = fs.readFileSync(sqlFilePath, 'utf-8');
    
        const queries = sql.split(';').filter(query => query.trim().length > 0);
    
        for (const query of queries) {
            connection.query(query);
            console.log('Executed query:', query);
        }
    
        console.log('SQL file executed successfully.');
    })
}

const endSQL = () => {
    connection.end()
}

module.exports = { initSQL, endSQL }