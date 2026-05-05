import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
//AI ROUTE
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

const app = express();

app.use(express.json({limit: '20mb'})); // to support JSON-encoded bodies and increase limit for file uploads
app.use(cors());
//AI ROUTE
app.use('/api/chat', chatRoute);  

// LOGIN
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const sql = 'SELECT * FROM Users WHERE username = ? AND password = ?';
  db.query(sql, [username, password], (err, result) => {
    if (err) {
  console.error("LOGIN DB ERROR:", err);
  return res.status(500).json({ message: err.message });
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

// FILE UPLOAD
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ message: 'Username required' });
  }

  const filename = req.file.originalname;
  const filePath = `/uploads/${req.file.filename}`;
  const fileType = req.file.mimetype;

  const sql = 'INSERT INTO UserFiles (username, filename, filePath, fileType) VALUES (?, ?, ?, ?)';
  db.query(sql, [username, filename, filePath, fileType], (err, result) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(500).json({ message: 'Failed to save file metadata' });
    }
    res.json({ message: 'File uploaded', fileId: result.insertId });
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
