document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const loginBtn = document.querySelector(".login-btn");
    const fingerprint = document.querySelector(".fingerprint");
  
    // Traditional Login Form Submission
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        simulateLogin();
    });
  
    // Simulate login process
    function simulateLogin() {
        loginBtn.disabled = true;
        loginBtn.innerHTML = "AUTHENTICATING...";
  
        setTimeout(() => {
            loginBtn.style.background = "var(--success-color)";
            loginBtn.innerHTML = "ACCESS GRANTED";
  
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1000);
        }, 3000);
    }
  
    // Google Sign-In Handler
    window.handleGoogleSignIn = function (response) {
        console.log("Google Login Success:", response);
        const credential = response.credential;
        
        // Decode the JWT token to extract user info
        const user = JSON.parse(atob(credential.split('.')[1]));
        console.log("User Info:", user);
  
        // Store user data in local storage
        localStorage.setItem("user", JSON.stringify(user));
  
        // Redirect after successful login
        window.location.href = "index.html";
    };
  
    // Alternative Login Options (Google, Microsoft, Apple, Phone)
    const loginOptions = document.querySelectorAll(".login-option");
    loginOptions.forEach((option) => {
        option.addEventListener("click", (e) => {
            e.preventDefault();
            const provider = option.classList[1]; // Get provider class (phone, google, etc.)
            simulateAlternativeLogin(provider);
        });
    });
  
    function simulateAlternativeLogin(provider) {
        const button = document.querySelector(`.login-option.${provider}`);
        const originalText = button.textContent;
  
        button.disabled = true;
        button.textContent = "Connecting...";
  
        setTimeout(() => {
            button.textContent = "Authenticating...";
  
            setTimeout(() => {
                button.style.background = "var(--success-color)";
                button.textContent = "Success!";
  
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 1000);
            }, 2000);
        }, 2000);
    }
  });
  