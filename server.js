const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const PORT = 4000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// MySQL connection configuration - Using Connection Pooling
const pool = mysql.createPool({
  host: '49.12.197.74', // IP address of your VPS
  user: 'ramy', // MySQL username
  password: 'pass', // MySQL password
  database: 'grad', // Name of your MySQL database
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

let receivedOTP = ''; // Variable to store OTP received from desk.js

// Endpoint to receive OTP forwarded from desk.js
app.post('/receive-otp', (req, res) => {
  const { otp } = req.body;
  console.log('Received OTP from desk.js:', otp);
  receivedOTP = otp; // Store the received OTP in the variable
  res.json({ success: true, message: 'OTP received successfully' });
});

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Query MySQL to check if the user exists
  const query = `SELECT * FROM users WHERE username = ? AND password = ?`;

  // Acquire a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error acquiring connection from pool:', err);
      res.status(500).json({ success: false, message: 'Internal server error' });
      return;
    }

    // Execute query with the acquired connection
    connection.query(query, [username, password], (error, results, fields) => {
      // Release the connection back to the pool
      connection.release();

      if (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
        return;
      }

      if (results.length > 0) {
        // User found, login successful
        res.json({ success: true, message: 'Login successful', otp: receivedOTP }); // Send stored OTP along with success response
        receivedOTP = ''; // Reset receivedOTP after sending it
      } else {
        // No user found with provided credentials
        res.status(401).json({ success: false, message: 'Invalid username or password' });
      }
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
