document.addEventListener('DOMContentLoaded', () => {
    console.log('Script loaded'); // Check if script is loading

    const expenseForm = document.getElementById('expenseForm');
    const monthForm = document.getElementById('monthForm');
    const errorMessage = document.getElementById('errorMessage');
    const expensesTable = document.getElementById('expensesTable')?.getElementsByTagName('tbody')[0];
    const messageDiv = document.getElementById('message');
    const updateButton = document.getElementById('updateButton'); // Add a reference to the update button
    let currentExpenseId = null; // To keep track of the expense being edited

    if (!messageDiv) {
        console.error('Message div not found!');
    }

    // Fetch and populate clients into the select list
    function loadClients() {
        fetch('/api/clients') // Endpoint to get clients
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load clients: ' + response.statusText);
                }
                return response.json();
            })
            .then(clients => {
                const clientSelect = document.getElementById('clientSelect'); // Ensure this matches your HTML element ID

                if (clientSelect) {
                    clientSelect.innerHTML = ''; // Clear existing options

                    // Create and append default option
                    const defaultOption = document.createElement('option');
                    defaultOption.value = "";
                    defaultOption.disabled = true;
                    defaultOption.selected = true;
                    defaultOption.textContent = "Select Client";
                    clientSelect.appendChild(defaultOption);

                    // Append each client as an option
                    clients.forEach(client => {
                        const option = document.createElement('option');
                        option.value = client.id; // Client ID
                        option.textContent = client.name; // Client name
                        clientSelect.appendChild(option);
                    });
                }
            })
            .catch(error => {
                if (errorMessage) {
                    errorMessage.textContent = 'An error occurred while loading clients: ' + error.message;
                }
                console.error('Error:', error);
            });
    }

    if (expenseForm) {
        expenseForm.addEventListener('submit', (event) => {
            event.preventDefault();
            if (messageDiv) messageDiv.textContent = ''; // Clear previous messages
    
            const date = document.getElementById('date').value;
            const type = document.getElementById('type').value;
            const amount = document.getElementById('amount').value;
            const description = document.getElementById('description').value;
            const clientSelect = document.getElementById('clientSelect'); // Select element for clients
            
            // Make sure to get both the client ID and client name
            const client_id = clientSelect ? clientSelect.value : ''; // Get selected client ID
            const client_name = clientSelect ? clientSelect.options[clientSelect.selectedIndex].text : ''; // Get selected client name
    
            // Validate required fields
            if (!date || !type || !amount || !client_id) {
                if (errorMessage) {
                    errorMessage.textContent = 'Please fill in all required fields: Date, Type, Amount, and Client.';
                }
                return;
            }
    
            const expenseData = {
                date,
                type,
                amount: parseFloat(amount),
                description,
                client_id, // Include client ID
                client_name // Include client name
            };
    
            if (currentExpenseId) {
                updateExpense(currentExpenseId, expenseData); // Update the existing expense
            } else {
                saveExpense(expenseData); // Save the new expense
            }
        });

        function saveExpense(expense) {
            fetch('/api/expenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(expense)
            })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(errorText => {
                        throw new Error(`Failed to save expense: ${errorText}`);
                    });
                }
                return response.json();
            })
            .then(() => {
                expenseForm.reset(); // Reset the form only if save is successful
                loadExpenses(); // Reload the expense list
                if (messageDiv) {
                    messageDiv.textContent = 'Expense saved successfully!';
                    messageDiv.style.color = 'green';
                }
            })
            .catch(error => {
                if (errorMessage) {
                    errorMessage.textContent = 'An error occurred while saving the expense: ' + error.message;
                }
                if (messageDiv) {
                    messageDiv.textContent = 'Error occurred while saving the expense.';
                    messageDiv.style.color = 'red';
                }
                console.error('Error:', error); // Detailed error logging
                alert(`Error details: ${error.message}`); // Alert with error details for debugging
            });
        }
        

        function updateExpense(id, expense) {
            fetch(`/api/expenses/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(expense)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update expense: ' + response.statusText);
                }
                return response.json();
            })
            .then(() => {
                expenseForm.reset(); // Reset the form only if update is successful
                currentExpenseId = null; // Reset the ID after updating
                if (updateButton) {
                    updateButton.style.display = 'none'; // Hide the update button
                }
                loadExpenses(); // Reload expenses to reflect the update
                if (messageDiv) {
                    messageDiv.textContent = 'Expense updated successfully!';
                    messageDiv.style.color = 'green';
                }
            })
            .catch(error => {
                if (errorMessage) {
                    errorMessage.textContent = 'An error occurred while updating the expense: ' + error.message;
                }
                if (messageDiv) {
                    messageDiv.textContent = 'An error occurred while updating the expense.';
                    messageDiv.style.color = 'red';
                }
                console.error('Error:', error);
            });
        }

        function handleUpdate(expense) {
            document.getElementById('date').value = expense.date;
            document.getElementById('type').value = expense.type;
            document.getElementById('amount').value = expense.amount;
            document.getElementById('description').value = expense.description;

            // Populate the client select element
            const clientSelect = document.getElementById('clientSelect');
            if (clientSelect) {
                clientSelect.value = expense.client; // Set the selected client ID
            }

            currentExpenseId = expense.id; // Set the ID of the expense to be updated

            if (updateButton) {
                updateButton.style.display = 'inline'; // Show the update button
            }
        }

        // Handle month form submission
        if (monthForm) {
            monthForm.addEventListener('submit', (event) => {
                event.preventDefault();
                const selectedMonth = document.getElementById('month').value;
                loadExpenses(selectedMonth);
            });
        }

        function getCurrentMonth() {
            const now = new Date();
            const year = now.getFullYear();
            const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
            return `${year}-${month}`;
        }

        function loadExpenses(month = getCurrentMonth()) {
            fetch(`/api/expenses?month=${month}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to load expenses: ' + response.statusText);
                    }
                    return response.json();
                })
                .then(expenses => {
                    if (expensesTable) {
                        expensesTable.innerHTML = ''; // Clear existing rows
                        expenses.forEach(expense => {
                            const row = expensesTable.insertRow();
                            row.insertCell(0).textContent = expense.date;
                            row.insertCell(1).textContent = expense.type;
                            row.insertCell(2).textContent = parseFloat(expense.amount).toFixed(2); // Ensure amount is a float
                            row.insertCell(3).textContent = expense.description;
                            row.insertCell(4).textContent = expense.client_name || 'No Client'; // Display client name or 'No Client'

                            // Create Update button
                            const updateButton = document.createElement('button');
                            updateButton.textContent = '⚙️';
                            updateButton.className = 'update-button'; // Apply styling class
                            updateButton.dataset.id = expense.id; // Store the expense ID
                            updateButton.addEventListener('click', () => {
                                // Trigger update functionality
                                handleUpdate(expense);
                            });

                            // Create Delete button
                            const deleteButton = document.createElement('button');
                            deleteButton.textContent = '❌';
                            deleteButton.className = 'delete-button'; // Apply styling class
                            deleteButton.dataset.id = expense.id; // Store the expense ID
                            deleteButton.addEventListener('click', () => {
                                // Trigger delete functionality
                                deleteExpense(expense.id);
                            });

                            // Append buttons to the row
                            const actionCell = row.insertCell(5); // Adjust index if needed
                            actionCell.appendChild(updateButton);
                            actionCell.appendChild(deleteButton);
                        });
                    }
                })
                .catch(error => {
                    if (errorMessage) {
                        errorMessage.textContent = 'An error occurred while loading expenses: ' + error.message;
                    }
                    console.error('Error:', error);
                });
        }

        function deleteExpense(id) {
            fetch(`/api/expenses/${id}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete expense: ' + response.statusText);
                }
                return response.json();
            })
            .then(() => {
                loadExpenses(); // Reload the expense list
                if (messageDiv) {
                    messageDiv.textContent = 'Expense deleted successfully!';
                    messageDiv.style.color = 'green';
                }
            })
            .catch(error => {
                if (errorMessage) {
                    errorMessage.textContent = 'An error occurred while deleting the expense: ' + error.message;
                }
                if (messageDiv) {
                    messageDiv.textContent = 'An error occurred while deleting the expense.';
                    messageDiv.style.color = 'red';
                }
                console.error('Error:', error);
            });
        }

        // Load initial data
        loadClients();
        loadExpenses();
    }
});
