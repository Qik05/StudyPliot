import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import path from 'path';
// Encrypting passwords
import bcrypt from 'bcrypt';
//AI ROUTE
import chatRoute from './chat.js'; 

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

app.use(express.json({limit: '20mb'})); // to support JSON-encoded bodies and increase limit for file uploads
app.use(cors());
//AI ROUTE
app.use('/api/chat', chatRoute);  

// LOGIN With encrypted password
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const sql = 'SELECT * FROM Users WHERE username = ?';
  db.query(sql, [username], async (err, result) => {
    if (err) {
      console.error("LOGIN DB ERROR:", err);
      return res.status(500).json({ message: err.message });
    }

    if (result.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, result[0].password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({ message: 'Login successful' });
  });
});

// REGISTER With encrypted password
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  const checkSql = 'SELECT * FROM Users WHERE username = ?';
  db.query(checkSql, [username], async (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error' });

    if (result.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertSql = 'INSERT INTO Users (username, password) VALUES (?, ?)';
    db.query(insertSql, [username, hashedPassword], (err) => {
      if (err) return res.status(500).json({ message: 'Could not create user' });
      res.status(201).json({ message: 'User created' });
    });
  });
});

// serve frontend
const __dirname = new URL('.', import.meta.url).pathname;

app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

// START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
