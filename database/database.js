const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./mydatabase.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');

        // Ensure the 'expenses' table exists with the new structure
        db.run(`CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY,
            date TEXT,
            type TEXT,
            amount REAL,
            description TEXT,
            client_id INTEGER,
            client_name TEXT
        )`, (err) => {
            if (err) {
                console.error('Error creating expenses table:', err.message);
            } else {
                console.log('Expenses table is ready.');
            }
        });

        // Ensure the 'clients' table exists
        db.run(`CREATE TABLE IF NOT EXISTS clients (
            id INTEGER PRIMARY KEY,
            name TEXT,
            budget REAL
        )`, (err) => {
            if (err) {
                console.error('Error creating clients table:', err.message);
            } else {
                console.log('Clients table is ready.');
            }
        });
    }
});

module.exports = db;
