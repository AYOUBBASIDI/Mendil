const express = require('express');
const router = express.Router();
const db = require('../../database/database'); // or '../../database' if database.js is directly inside database folder


// Example route to get expenses
router.get('/expenses', (req, res) => {
    const month = req.query.month || getCurrentMonth();
    const sql = 'SELECT * FROM expenses WHERE strftime("%Y-%m", date) = ?';
    db.all(sql, [month], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

function getCurrentMonth() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
    return `${year}-${month}`;
}

// Route to add an expense
router.post('/expenses', (req, res) => {
    const { date, type, amount, description, client_id,client_name} = req.body;
    console.log(req.body);  // Log to check if all fields are present

    // Ensure all required fields are provided
    if (!date || !type || !amount || !client_id || !client_name) {
        return res.status(400).json({ error: 'Please provide all required fields: date, type, amount, client_id, and client_name.' });
    }

    // Insert the expense into the database
    db.run('INSERT INTO expenses (date, type, amount, description, client_id, client_name) VALUES (?, ?, ?, ?, ?, ?)',
        [date, type, amount, description, client_id, client_name],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ id: this.lastID });
        });
});



// Route to delete an expense by ID
router.delete('/expenses/:id', (req, res) => {
    const expenseId = req.params.id;
    db.run('DELETE FROM expenses WHERE id = ?', [expenseId], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Expense not found' });
            return;
        }
        res.status(200).json({ message: 'Expense deleted successfully' });
    });
});

// Route to update an expense
router.put('/expenses/:id', (req, res) => {
    const id = req.params.id;
    const { date, type, amount, description, client_id, client_name } = req.body;

    const sql = 'UPDATE expenses SET date = ?, type = ?, amount = ?, description = ?, client_id = ?, client_name = ? WHERE id = ?';
    db.run(sql, [date, type, amount, description, client_id, client_name, id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Expense not found' });
            return;
        }
        res.json({ changes: this.changes });
    });
});


// Route to get all clients
router.get('/clients', (req, res) => {
    db.all('SELECT * FROM clients', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Route to add a client
router.post('/clients', (req, res) => {
    const { name, budget } = req.body;
    db.run('INSERT INTO clients (name, budget) VALUES (?, ?)',
        [name, budget],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.status(201).json({ id: this.lastID });
        });
});

// Route to delete a client by ID
router.delete('/clients/:id', (req, res) => {
    const clientId = req.params.id;
    db.run('DELETE FROM clients WHERE id = ?', [clientId], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Client not found' });
            return;
        }
        res.status(200).json({ message: 'Client deleted successfully' });
    });
});

// Route to update a client and related expenses
router.put('/clients/:id', (req, res) => {
    const id = req.params.id;
    const { name, budget } = req.body;

    // Start a transaction
    db.serialize(() => {
        // Begin the transaction
        db.run('BEGIN TRANSACTION');

        // Update the client information in the clients table
        const updateClientSql = 'UPDATE clients SET name = ?, budget = ? WHERE id = ?';
        
        // Update related expenses in the expenses table (only updating client_name)
        const updateExpensesSql = 'UPDATE expenses SET client_name = ? WHERE client_id = ?';

        // Combine both updates in one execution
        db.run(updateClientSql, [name, budget, id], function(err) {
            if (err) {
                db.run('ROLLBACK'); // Rollback the transaction on error
                res.status(500).json({ error: err.message });
                return;
            }

            if (this.changes === 0) {
                db.run('ROLLBACK'); // Rollback the transaction if no client is found
                res.status(404).json({ error: 'Client not found' });
                return;
            }

            // Proceed to update the expenses if client update is successful
            db.run(updateExpensesSql, [name, id], function(err) {
                if (err) {
                    db.run('ROLLBACK'); // Rollback the transaction on error
                    res.status(500).json({ error: err.message });
                    return;
                }

                // Commit the transaction if both updates succeed
                db.run('COMMIT', () => {
                    res.json({ clientChanges: 1, expenseChanges: this.changes });
                });
            });
        });
    });
});



// Route to get a single client by ID
router.get('/clients/:id', (req, res) => {
    const clientId = req.params.id;
    db.all('SELECT id, name, budget FROM clients WHERE id = ?', [clientId], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        if (results.length === 0) {
            console.log(`No client found with ID: ${clientId}`);
            return res.status(404).json({ error: 'Client not found' });
        }
 
        res.json(results[0]);
    });
});


// Route to get all columns from the expenses table by client ID
router.get('/expenses/:clientId', (req, res) => {
    const clientId = req.params.clientId;

    // Log the request for debugging purposes
    //console.log(`Fetching expenses for client ID: ${clientId}`);

    db.all('SELECT * FROM expenses WHERE client_id = ?', [clientId], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (results.length === 0) {
            console.log(`No expenses found for client ID: ${clientId}`);
            return res.status(404).json({ error: 'No expenses found for the given client ID' });
        }

        // Log the results for debugging purposes
       // console.log(`Recovered expenses for client ID: ${clientId}`, results);

        res.json(results);
    });
});

module.exports = router;
