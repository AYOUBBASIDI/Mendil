const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Expense schema
const expenseSchema = new Schema({
    date: { type: Date, required: true },
    type: { type: String, required: true },
    amount: { type: Number, required: true },
    description: { type: String },
    client_id: { type: Schema.Types.ObjectId, ref: 'Client' }, // Reference to Client model
    client_name: { type: String } // You can also derive this from the client_id if needed
}, { timestamps: true });

// Create the Expense model
const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
