// Get form elements
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const alertBox = document.getElementById('alert');

// Show alert function
function showAlert(message, type) {
  alertBox.textContent = message;
  alertBox.className = `alert alert-${type}`;
  alertBox.style.display = 'block';
  
  setTimeout(() => {
    alertBox.style.display = 'none';
  }, 5000);
}

// Handle form submission
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  // Validation
  if (!email || !password) {
    showAlert('Please fill in all fields', 'error');
    return;
  }

  // Disable button and show loading
  loginBtn.disabled = true;
  loginBtn.textContent = 'Signing in...';

  try {
    // Call backend API
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.success) {
      // Sign in with custom token
      await auth.signInWithCustomToken(data.token);
      
      // Store user data in localStorage
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('userEmail', data.email);
      localStorage.setItem('token', data.token);
      
      showAlert('Login successful! Redirecting...', 'success');
      
      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1500);
    } else {
      showAlert(data.message || 'Login failed', 'error');
      loginBtn.disabled = false;
      loginBtn.textContent = 'Sign In';
    }

  } catch (error) {
    console.error('Login error:', error);
    showAlert('Network error. Please try again.', 'error');
    loginBtn.disabled = false;
    loginBtn.textContent = 'Sign In';
  }
});