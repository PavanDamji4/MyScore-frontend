// Get form elements
const signupForm = document.getElementById('signupForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const signupBtn = document.getElementById('signupBtn');
const alertBox = document.getElementById('alert');

// Show alert function
function showAlert(message, type) {
  alertBox.textContent = message;
  alertBox.className = `alert alert-${type}`; // Uses styles defined in style.css (alert-error or alert-success)
  alertBox.style.display = 'block';

  // Auto hide after 5 seconds
  setTimeout(() => {
    alertBox.style.display = 'none';
  }, 5000);
}

// Handle form submission
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  // Validation
  if (!email || !password || !confirmPassword) {
    showAlert('Please fill in all fields', 'error');
    return;
  }

  if (password.length < 6) {
    showAlert('Password must be at least 6 characters', 'error');
    return;
  }

  if (password !== confirmPassword) {
    showAlert('Passwords do not match', 'error');
    return;
  }

  // Disable button and show loading
  signupBtn.disabled = true;
  signupBtn.textContent = 'Creating Account...';

  try {
    // Call backend API
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.success) {
      showAlert('Account created successfully! Redirecting to login...', 'success');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    } else {
      showAlert(data.message || 'Failed to create account', 'error');
      signupBtn.disabled = false;
      signupBtn.textContent = 'Create Account';
    }

  } catch (error) {
    console.error('Signup error:', error);
    showAlert('Network error. Please try again.', 'error');
    signupBtn.disabled = false;
    signupBtn.textContent = 'Create Account';
  }
});