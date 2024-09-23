const express = require('express');
const path = require('path');
const app = express();
// Import and configure dotenv
require('dotenv').config();
const port = process.env.PORT || 3000;

// Import database connection
const db = require('./database/database'); 

// Middleware to parse JSON
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Redirect to login page at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Include API routes and pass the database connection
const apiRoutes = require('./src/routes/apiRoutes');
app.use('/api', apiRoutes);


// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
