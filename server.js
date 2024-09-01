const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(express.json());


// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Redirect to login page at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});


// Include API routes
const apiRoutes = require('./src/routes/apiRoutes');
app.use('/api', apiRoutes);

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
