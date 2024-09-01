document.addEventListener('DOMContentLoaded', () => {
    const clientForm = document.getElementById('clientForm');
    const loadClientsButton = document.getElementById('loadClients');
    const clientsTableBody = document.getElementById('clientsTable').getElementsByTagName('tbody')[0];

    clientForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        const name = document.getElementById('name').value;
        const budget = document.getElementById('budget').value;

        if (!name || !budget) {
            alert('Please fill in all required fields.');
            return;
        }

        fetch('/api/clients', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, budget: parseFloat(budget) })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to add client: ' + response.statusText);
            }
            return response.json();
        })
        .then(() => {
            clientForm.reset(); // Reset form after successful submission
            loadClients(); // Reload clients to reflect the addition
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

    loadClientsButton.addEventListener('click', loadClients);

    function loadClients() {
        fetch('/api/clients')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load clients: ' + response.statusText);
            }
            return response.json();
        })
        .then(clients => {
            clientsTableBody.innerHTML = ''; // Clear existing rows
            clients.forEach(client => {
                const row = clientsTableBody.insertRow();
                row.insertCell(0).textContent = client.id;
                row.insertCell(1).textContent = client.name;
                row.insertCell(2).textContent = client.budget.toFixed(2);
                
                // Create Update button
                const updateButton = document.createElement('button');
                updateButton.textContent = 'Update';
                updateButton.addEventListener('click', () => handleUpdate(client));
                
                // Create Delete button
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', () => deleteClient(client.id));
                
                // Append buttons to the row
                const actionsCell = row.insertCell(3);
                actionsCell.appendChild(updateButton);
                actionsCell.appendChild(deleteButton);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    function deleteClient(clientId) {
        fetch(`/api/clients/${clientId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete client: ' + response.statusText);
            }
            return response.json();
        })
        .then(() => {
            loadClients(); // Reload clients after deletion
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    function handleUpdate(client) {
        const name = prompt('Enter new name:', client.name);
        const budget = prompt('Enter new budget:', client.budget);

        if (name && budget !== null) {
            fetch(`/api/clients/${client.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, budget: parseFloat(budget) })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update client: ' + response.statusText);
                }
                return response.json();
            })
            .then(() => {
                loadClients(); // Reload clients after update
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    }
});
