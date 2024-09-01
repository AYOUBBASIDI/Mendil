const db = require('../database/');

class Expense {
    static getAll(callback) {
        db.all('SELECT * FROM expenses', callback);
    }

    static create(expense, callback) {
        const { date, type, amount, description } = expense;
        db.run('INSERT INTO expenses (date, type, amount, description) VALUES (?, ?, ?, ?)',
            [date, type, amount, description],
            function(err) {
                if (err) {
                    callback(err);
                    return;
                }
                callback(null, this.lastID);
            });
    }
}

module.exports = Expense;
