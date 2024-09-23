const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Client schema
const clientSchema = new Schema({
    name: { type: String, required: true },
    budget: { type: Number, required: true }
}, { timestamps: true });

// Create the Client model
const Client = mongoose.model('Client', clientSchema);

module.exports = Client;
