document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    // Hardcoded credentials
    const correctUsername = 'mendil';
    const correctPassword = 'mendil@2024';

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();

            // Clear previous error messages
            errorMessage.textContent = '';

            // Get form values
            const username = document.getElementById('login').value;
            const password = document.getElementById('password').value;

            // Validate input
            if (!username || !password) {
                errorMessage.textContent = 'Please fill in both username and password.';
                return;
            }

            // Check credentials
            if (username === correctUsername && password === correctPassword) {
                // Store login status in localStorage
                localStorage.setItem('isLoggedIn', 'true');
                
                // Redirect to the home page if login is successful
                window.location.href = '/index.html'; // Adjust this path as needed
            } else {
                errorMessage.textContent = 'Invalid username or password.';
            }
        });
    }
});
