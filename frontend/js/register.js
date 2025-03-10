document.getElementById("registerForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    
    // Reset error messages
    document.getElementById("usernameError").textContent = "";
    document.getElementById("emailError").textContent = "";
    document.getElementById("passwordError").textContent = "";
    document.getElementById("errorMessage").style.display = "none";
    
    // Get form values
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.querySelector('input[name="role"]:checked').value;
    
    // Basic validation
    let hasError = false;
    
    if (!username) {
        document.getElementById("usernameError").textContent = "Username is required";
        hasError = true;
    }
    
    if (!email) {
        document.getElementById("emailError").textContent = "Email is required";
        hasError = true;
    }
    
    if (!password) {
        document.getElementById("passwordError").textContent = "Password is required";
        hasError = true;
    } else if (password.length < 6) {
        document.getElementById("passwordError").textContent = "Password must be at least 6 characters";
        hasError = true;
    }
    
    if (hasError) {
        document.getElementById("errorMessage").textContent = "Please fix the errors above";
        document.getElementById("errorMessage").style.display = "block";
        return;
    }
    
    try {
        console.log("Sending registration request with data:", { username, email, password, role });
        
        const response = await fetch("http://localhost:3000/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                email,
                password,
                role
            })
        });
        
        const data = await response.json();
        console.log("Registration response:", data);
        
        if (!response.ok) {
            throw new Error(data.error || "Registration failed");
        }

        // Show appropriate message based on role
        if (role === "admin") {
            alert("Registration successful. Please wait for admin approval before logging in.");
        } else {
            alert("Registration successful! Please login to continue.");
        }

        // Simple redirection
        //document.location.href = "http://127.0.0.1:5500/login.html";
        
    } catch (error) {
        console.error("Registration error:", error);
        document.getElementById("errorMessage").textContent = error.message;
        document.getElementById("errorMessage").style.display = "block";
    }
});