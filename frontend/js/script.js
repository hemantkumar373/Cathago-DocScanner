document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Clear previous error messages
    document.getElementById('emailError').textContent = '';
    document.getElementById('passwordError').textContent = '';
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Basic validation
    if (!email) {
        document.getElementById('emailError').textContent = 'Email is required';
        return;
    }
    if (!password) {
        document.getElementById('passwordError').textContent = 'Password is required';
        return;
    }
    
    try {
        const response = await fetch('http://localhost:3000/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        console.log('Login response:', data); // For debugging
        
        if (data.error) {
            document.getElementById('passwordError').textContent = data.error;
            return;
        }
        
        if (data.pendingApproval) {
            alert('Your admin account is pending approval');
            return;
        }
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify({
            username: data.username,
            email: data.email,
            role: data.role,
            credits: data.credits
        }));
        
        // Redirect based on role
        if (data.role === 'admin') {
            window.location.href = 'admin_profile.html'; // Fixed typo in admin profile path
        } else {
            window.location.href = 'user_profile.html';
        }
        
    } catch (error) {
        console.error('Login error:', error);
        document.getElementById('passwordError').textContent = 'An error occurred. Please try again.';
    }
});