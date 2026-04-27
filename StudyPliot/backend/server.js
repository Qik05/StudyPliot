import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
import path from 'path';

const { createPool } = mysql;
const { join } = path;

const db = createPool({
  connectionLimit: 10,
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
});

const app = express();

app.use(express.json());
app.use(cors());

// LOGIN
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const sql = 'SELECT * FROM Users WHERE username = ? AND password = ?';
  db.query(sql, [username, password], (err, result) => {
    if (err) {
      res.status(500).json({ message: 'Server error' });
    } else if (result.length > 0) {
      res.status(200).json({ message: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });
});

// REGISTER
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  const checkSql = 'SELECT * FROM Users WHERE username = ?';
  db.query(checkSql, [username], (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error' });

    if (result.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const insertSql = 'INSERT INTO Users (username, password) VALUES (?, ?)';
    db.query(insertSql, [username, password], (err) => {
      if (err) return res.status(500).json({ message: 'Could not create user' });
      res.status(201).json({ message: 'User created' });
    });
  });
});

// serve frontend
const __dirname = new URL('.', import.meta.url).pathname;

app.use(express.static(join(__dirname, '../frontend/dist')));

app.get(/.*/, (req, res) => {
  res.sendFile(join(__dirname, '../frontend/dist', 'index.html'));
});

// START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});