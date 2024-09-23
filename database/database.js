const mongoose = require('mongoose');

// Replace with your MongoDB Cloud connection string
const uri = 'mongodb+srv://ayoubbasidi1:hxwRbjXlfWswHN15@cluster0.4zaqwio.mongodb.net/mendil';

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
