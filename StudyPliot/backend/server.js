const path = require("path");
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const db = mysql.createPool({
  connectionLimit: 10, // Adjust as needed
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'designLogin',
  port: 3307,
});

const app = express();

app.use(express.json());
app.use(cors());

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const sql = 'SELECT * FROM Users WHERE username = ? AND password = ?';
  db.query(sql, [username, password], (err, result) => {
    if (err) {
      res.status(500).json({ message: 'An error occurred while processing your request.' });
    } else {
      if (result.length > 0) {
        res.status(200).json({ message: 'Login successful' });
      } else {
        res.status(401).json({ message: 'Login failed. Invalid username or password.' });
      }
    }
  });
});

//register 
app.post('/register', (req, res) => {
  const { username, password } = req.body;

// Check if the username already exists
  const checkSql = 'SELECT * FROM Users WHERE username = ?';
  db.query(checkSql, [username], (err, result) => {
    if (err) return res,status(500).json({ message: 'That UserName is already taken.' });

    //insert new user
    const insertSql = 'INSERT INTO Users (username, password) VALUES (?, ?)'; 
    db.query(insertSql, [username, password], (err) => {
      if (err) return res.status(500).json({ message: 'Could not create user.' });
      res.status(201).json({ message: 'User created successfully.' });
    });
  });
});

// Serve frontend
app.use(express.static(path.join(__dirname, "client/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/dist", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
