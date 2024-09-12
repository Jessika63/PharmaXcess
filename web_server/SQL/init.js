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
            console.error('Connection error: ' + err.stack);
            return;
        }
        console.log('Connected to DB.');

        const parentDir = path.join(__dirname, '.');

        fs.readdir(parentDir, (err, files) => {
            if (err) {
                console.error('Error reading directory:', err);
                return;
            }

            const directories = files.filter(file => {
                return fs.statSync(path.join(parentDir, file)).isDirectory();
            });

            directories.forEach(directory => {
                const sqlFilePath = path.join(parentDir, directory, 'init.sql');
                
                if (fs.existsSync(sqlFilePath)) {
                    console.log(`Found init.sql in ${directory}`);

                    const sql = fs.readFileSync(sqlFilePath, 'utf-8');
                    const queries = sql.split(';').filter(query => query.trim().length > 0);

                    queries.forEach(query => {
                        connection.query(query, (err) => {
                            if (err) {
                                console.error(`Error executing query in ${directory}:`, err);
                            } else {
                                console.log(`Executed query in ${directory}:`, query.trim());
                            }
                        });
                    });
                } else {
                    console.log(`No init.sql found in ${directory}`);
                }
            });

            console.log('SQL execution completed.');
        });
    });
};

const endSQL = () => {
    connection.end()
}

module.exports = { initSQL, endSQL, connection }