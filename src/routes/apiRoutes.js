const express = require('express');
const router = express.Router();

// Import Models
const Expense = require('../../models/Expense'); // Expense model
const Client = require('../../models/Client'); // Client model

router.get('/expenses', async (req, res) => {
    const month = req.query.month || getCurrentMonth();
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    try {
        const expenses = await Expense.find({
            date: { $gte: startDate, $lte: endDate }
        });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.post('/expenses', async (req, res) => {
    const { date, type, amount, description, client_id, client_name } = req.body;

    if (!date || !type || !amount || !client_id || !client_name) {
        return res.status(400).json({ error: 'Please provide all required fields: date, type, amount, client_id, and client_name.' });
    }

    try {
        const expense = new Expense({
            date,
            type,
            amount,
            description,
            client_id,
            client_name
        });

        const savedExpense = await expense.save();
        res.status(201).json(savedExpense);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.delete('/expenses/:id', async (req, res) => {
    const expenseId = req.params.id;

    try {
        const result = await Expense.findByIdAndDelete(expenseId);
        if (!result) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.get('/clients', async (req, res) => {
    try {
        const clients = await Client.find();
        res.json(clients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.post('/clients', async (req, res) => {
    const { name, budget } = req.body;

    try {
        const client = new Client({ name, budget });
        const savedClient = await client.save();
        res.status(201).json(savedClient);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.delete('/clients/:id', async (req, res) => {
    const clientId = req.params.id;

    try {
        const result = await Client.findByIdAndDelete(clientId);
        if (!result) {
            return res.status(404).json({ error: 'Client not found' });
        }
        res.status(200).json({ message: 'Client deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.put('/clients/:id', async (req, res) => {
    const id = req.params.id;
    const { name, budget } = req.body;

    try {
        const updatedClient = await Client.findByIdAndUpdate(
            id,
            { name, budget },
            { new: true }
        );

        if (!updatedClient) {
            return res.status(404).json({ error: 'Client not found' });
        }

        // Update related expenses
        const updatedExpenses = await Expense.updateMany(
            { client_id: id },
            { client_name: name }
        );

        res.json({ client: updatedClient, updatedExpenses });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/clients/:id', async (req, res) => {
    const clientId = req.params.id;

    try {
        const client = await Client.findById(clientId);
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        res.json(client);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.get('/expenses/:clientId', async (req, res) => {
    const clientId = req.params.clientId;

    try {
        const expenses = await Expense.find({ client_id: clientId });
        if (expenses.length === 0) {
            return res.status(404).json({ error: 'No expenses found for the given client ID' });
        }
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/expenses/:id', async (req, res) => {
    const expenseId = req.params.id;
    const { date, type, amount, description, client_id, client_name } = req.body;

    try {
        // Find the expense by ID and update with the new data
        const updatedExpense = await Expense.findByIdAndUpdate(
            expenseId,
            { date, type, amount, description, client_id, client_name },
            { new: true, runValidators: true } // Options: `new: true` returns the updated document, `runValidators` applies schema validation
        );

        if (!updatedExpense) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        res.json(updatedExpense);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
