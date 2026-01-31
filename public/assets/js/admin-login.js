// Get form elements
const adminLoginForm = document.getElementById('adminLoginForm');
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
adminLoginForm.addEventListener('submit', async (e) => {
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
    // Call backend admin login API
    const response = await fetch(`${API_BASE_URL}/auth/admin-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.success) {
      // Sign in with custom token
      const userCredential = await auth.signInWithCustomToken(data.adminToken);

      // Get ID Token
      const idToken = await userCredential.user.getIdToken();

      // Store admin data in localStorage
      localStorage.setItem('adminId', data.adminId);
      localStorage.setItem('adminEmail', email);
      localStorage.setItem('adminToken', idToken); // Store ID Token, NOT custom token
      localStorage.setItem('isAdmin', 'true');

      showAlert('Admin login successful! Redirecting...', 'success');

      // Redirect to admin dashboard
      setTimeout(() => {
        window.location.href = 'admin-dashboard.html';
      }, 1500);
    } else {
      showAlert(data.message || 'Invalid admin credentials', 'error');
      loginBtn.disabled = false;
      loginBtn.textContent = 'Sign In as Admin';
    }

  } catch (error) {
    console.error('Admin login error:', error);
    showAlert('Network error. Please try again.', 'error');
    loginBtn.disabled = false;
    loginBtn.textContent = 'Sign In as Admin';
  }
});

console.log('✅ Admin login page loaded');