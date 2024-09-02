
const fs = require('fs');
const path = require('path');

// Definiera sökvägen
const dbDir = path.resolve(__dirname, 'db');
const dbPath = path.join(dbDir, 'data.db');

// Skapa mappen om den inte finns
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Nu kan du ansluta till eller skapa databasen på den specificerade sökvägen
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS measurements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT,
        measurement REAL,
        setpoint REAL,
        valve REAL,
        P REAL,
        I REAL,
        D REAL
    )`);

    db.all(`PRAGMA table_info(measurements);`, [], (err, rows) => {
        if (err) {
            throw err;
        }
        console.log(rows);
    });
});





// Stäng databasen när den inte längre behövs
function closeDatabase() {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Closed the database connection'); 
    });
}

function saveMeasurement(timestamp, measurement, setpoint, valve, P, I, D) {
    db.run(
        `INSERT INTO measurements (timestamp, measurement, setpoint, valve, P, I, D) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [timestamp, measurement, setpoint, valve, P, I, D],
        function(err) {
            if (err) {
                return console.error(err.message);
            }
            console.log(`Measurement inserted with rowid ${this.lastID}`);
        }
    );
}

function getMeasurements(callback) {
    db.all(`SELECT * FROM measurements ORDER BY timestamp ASC`, [], (err, rows) => {
        if (err) {
            throw err;
        }
        callback(rows);
    });
}

module.exports = {
    db,
    saveMeasurement,
    getMeasurements,
    closeDatabase
};
