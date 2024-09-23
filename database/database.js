const mongoose = require('mongoose');

// Replace with your MongoDB Cloud connection string
const uri = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(uri)
    .then(() => {
        console.log('Connected to MongoDB.');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err.message);
    });

// Export the connection
module.exports = mongoose;
