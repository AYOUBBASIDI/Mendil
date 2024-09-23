document.addEventListener('DOMContentLoaded', () => {
    console.log('Script loaded'); // Check if script is loading

    const errorMessage = document.createElement('div');
    document.body.appendChild(errorMessage);

    // Fetch and populate the client select dropdown
    function loadClients() {
        fetch('/api/clients') // Endpoint to get clients
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load clients: ' + response.statusText);
                }
                return response.json();
            })
            .then(clients => {
                const clientSelect = document.getElementById('clientSelect');

                if (clientSelect) {
                    clientSelect.innerHTML = ''; // Clear existing options

                    const defaultOption = document.createElement('option');
                    defaultOption.value = "";
                    defaultOption.disabled = true;
                    defaultOption.selected = true;
                    defaultOption.textContent = "Select Client";
                    clientSelect.appendChild(defaultOption);

                    clients.forEach(client => {
                        const option = document.createElement('option');
                        option.value = client._id; // Client ID
                        option.textContent = client.name; // Client name
                        clientSelect.appendChild(option);
                    });
                } else {
                    console.error('Client select element not found!');
                }
            })
            .catch(error => {
                if (errorMessage) {
                    errorMessage.textContent = 'An error occurred while loading clients: ' + error.message;
                    errorMessage.style.color = 'red'; // Optional styling for error message
                }
                console.error('Error:', error);
            });
    }

    // Load clients on page load
    loadClients();

 // Handle form submission
 const statsForm = document.getElementById('statsForm');
 if (statsForm) {
     statsForm.addEventListener('submit', function(event) {
         event.preventDefault(); // Prevent default form submission

         const clientId = document.getElementById('clientSelect').value;
         if (!clientId) {
             errorMessage.textContent = 'Please select a client.';
             errorMessage.style.color = 'red'; // Optional styling for error message
             return;
         }

         // Fetch and display client data based on selected client
         fetch(`/api/clients/${clientId}`) // Endpoint to get client details by ID
             .then(response => {
                 if (!response.ok) {
                     throw new Error('Failed to load client data: ' + response.statusText);
                 }
                 return response.json();
             })
             .then(client => {
                 // Update client table
                 const clientTableBody = document.getElementById('clientTableBody');
                 clientTableBody.innerHTML = ''; // Clear existing rows

                 const row = document.createElement('tr');
                 row.innerHTML = `
                     <td>${client.name}</td>
                     <td class="total_budget">+ ${client.budget} DH</td>
                 `;
                 clientTableBody.appendChild(row);

                 // Fetch and display expenses
                 fetch(`/api/expenses/${clientId}`) // Endpoint to get expenses for the selected client
                     .then(response => {
                         if (!response.ok) {
                             throw new Error('Failed to load expenses: ' + response.statusText);
                         }
                         return response.json();
                     })
                     .then(expenses => {
                         // Update expenses table
                         const expensesTableBody = document.getElementById('expensesTableBody');
                         const totalExpensesElement = document.getElementById('totalExpenses');
                         const gainElement = document.getElementById('gain');

                         expensesTableBody.innerHTML = ''; // Clear existing rows

                         let totalExpenses = 0;

                         expenses.forEach(expense => {
                             const row = document.createElement('tr');
                             row.innerHTML = `
                                 <td>${expense.date}</td>
                                 <td>${expense.type}</td>
                                 <td>${expense.amount}</td>
                                 <td>${expense.description}</td>
                             `;
                             expensesTableBody.appendChild(row);
                             totalExpenses += parseFloat(expense.amount); // Add to total expenses
                         });

                         // Update total expenses
                         totalExpensesElement.textContent = totalExpenses.toFixed(2); // Ensure two decimal places

                         // Calculate and update gain
                         const budget = parseFloat(document.querySelector('.total_budget').textContent.replace(/[^\d.-]/g, '')); // Extract budget value from the client table
                         const gain = budget - totalExpenses;
                         gainElement.textContent = gain.toFixed(2); // Ensure two decimal places
                     })
                     .catch(error => {
                         if (errorMessage) {
                             errorMessage.textContent = 'An error occurred while loading expenses: ' + error.message;
                             errorMessage.style.color = 'red'; // Optional styling for error message
                         }
                         console.error('Error:', error);
                     });
             })
             .catch(error => {
                 if (errorMessage) {
                     errorMessage.textContent = 'An error occurred while loading client data: ' + error.message;
                     errorMessage.style.color = 'red'; // Optional styling for error message
                 }
                 console.error('Error:', error);
             });
     });
 }

});
