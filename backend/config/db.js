const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "auth_system"
});

db.connect((err) => {
  if (err) {
    console.log("Database connection failed");
  } else {
    console.log("Connected to database");
  }
});

module.exports = db;