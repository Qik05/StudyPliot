import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import path from 'path';
import bcrypt from 'bcrypt';
import multer from 'multer';
import fs from 'fs';
import chatRoute from './chat.js';

const { createPool } = mysql;
const { join } = path;

const uploadsDir = path.join(path.dirname(new URL(import.meta.url).pathname), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

const db = createPool({
  connectionLimit: 10,
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
});

db.query(`
  CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
  )
`, (err) => { if (err) console.error('Users table error:', err.message); });

db.query(`
  CREATE TABLE IF NOT EXISTS Userfiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    filename VARCHAR(255),
    filePath VARCHAR(500),
    fileType VARCHAR(100),
    aiSummary TEXT
  )
`, (err) => { if (err) console.error('Userfiles table error:', err.message); });

db.query('ALTER TABLE Userfiles ADD COLUMN aiSummary TEXT', (err) => {
  if (err && !err.message.includes('Duplicate column name')) {
    console.error('Migration warning:', err.message);
  }
});

const app = express();

app.use(express.json({limit: '20mb'}));
app.use(cors());
app.use('/api/chat', chatRoute);

// LOGIN (bcrypt)
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

// REGISTER (bcrypt)
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
      if (err) {
        console.error("REGISTER DB ERROR:", err);
        return res.status(500).json({ message: 'Could not create user' });
      }
      res.status(201).json({ message: 'User created' });
    });
  });
});

// GET /api/files
app.get('/api/files', (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ message: 'Username required' });

  const sql = 'SELECT id, filename, fileType, aiSummary FROM Userfiles WHERE username = ? ORDER BY id DESC';
  db.query(sql, [username], (err, results) => {
    if (err) return res.status(500).json({ message: 'Failed to fetch files' });
    res.json({ files: results });
  });
});

// PATCH /api/files/:fileId/summary
app.patch('/api/files/:fileId/summary', (req, res) => {
  const { fileId } = req.params;
  const { summary } = req.body;
  if (!summary) return res.status(400).json({ message: 'Summary required' });

  const sql = 'UPDATE Userfiles SET aiSummary = ? WHERE id = ?';
  db.query(sql, [summary, fileId], (err) => {
    if (err) return res.status(500).json({ message: 'Failed to save summary' });
    res.json({ message: 'Summary saved' });
  });
});

// FILE UPLOAD
app.post('/api/upload', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err.message);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, (req, res) => {
  if (!req.file) {
    console.warn('No file in request');
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const { username } = req.body;
  if (!username) {
    console.warn('No username provided');
    return res.status(400).json({ message: 'Username required' });
  }

  const filename = req.file.originalname;
  const filePath = `/uploads/${req.file.filename}`;
  const fileType = req.file.mimetype;

  console.log(`Uploading: ${filename} for user ${username}`);

  const sql = 'INSERT INTO Userfiles (username, filename, filePath, fileType) VALUES (?, ?, ?, ?)';
  db.query(sql, [username, filename, filePath, fileType], (err, result) => {
    if (err) {
      console.error('Database insert error:', err);
      return res.status(500).json({ message: 'Failed to save file metadata', error: err.message });
    }
    console.log(`File saved to DB with ID: ${result.insertId}`);
    res.json({ message: 'File uploaded', fileId: result.insertId });
  });
});

// serve frontend
const __dirname = new URL('.', import.meta.url).pathname;

app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
