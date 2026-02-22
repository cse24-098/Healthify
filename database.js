const sqlite3 = require('sqlite3').verbose();
const path = require('path');

//connect to database
const db = new sqlite3.Database(path.join(__dirname, 'healthify.db'), (err) => {
    if (err) {
        console.error(' Database connection error:', err.message);
    } else {
        console.log('✅ Connected to SQLite database');
        createTables();
    }
});

// Create tables
function createTables() {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        age INTEGER,
        gender TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Chat history table
    db.run(`CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        symptoms TEXT,
        age TEXT,
        gender TEXT,
        risk_assessment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Risk assessments table
    db.run(`CREATE TABLE IF NOT EXISTS risk_assessments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        diabetes_risk TEXT,
        cardio_risk TEXT,
        blood_pressure TEXT,
        blood_sugar TEXT,
        weight TEXT,
        height TEXT,
        lifestyle TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    console.log("Database tables created");
}


module.exports = {
    // Add a new user
    addUser: (name, email, age, gender) => {
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO users (name, email, age, gender) VALUES (?, ?, ?, ?)',
                [name, email, age, gender],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID });
                }
            );
        });
    },

    // Save chat history
    saveChat: (userId, symptoms, age, gender, riskAssessment) => {
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO chat_history (user_id, symptoms, age, gender, risk_assessment) VALUES (?, ?, ?, ?, ?)',
                [userId, symptoms, age, gender, riskAssessment],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID });
                }
            );
        });
    },

    //comprehensive risk assessment
    saveRiskAssessment: (userId, assessmentData) => {
        return new Promise((resolve, reject) => {
            const { diabetesRisk, cardioRisk, bloodPressure, bloodSugar, weight, height, lifestyle } = assessmentData;
            db.run(
                'INSERT INTO risk_assessments (user_id, diabetes_risk, cardio_risk, blood_pressure, blood_sugar, weight, height, lifestyle) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [userId, diabetesRisk, cardioRisk, bloodPressure, bloodSugar, weight, height, lifestyle],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID });
                }
            );
        });
    },

    // Get user's chat history
    getUserChats: (userId) => {
        return new Promise((resolve, reject) => {
            db.all(
                'SELECT * FROM chat_history WHERE user_id = ? ORDER BY created_at DESC',
                [userId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    },

    // Get all users
    getAllUsers: () => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM users ORDER BY created_at DESC', [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    // Close database connection
    close: () => {
        db.close((err) => {
            if (err) console.error('Error closing database:', err.message);
            else console.log('✅ Database connection closed');
        });
    }
};