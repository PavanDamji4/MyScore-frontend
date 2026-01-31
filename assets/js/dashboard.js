// Check if user is logged in
const userId = localStorage.getItem('userId');
const userEmail = localStorage.getItem('userEmail');

if (!userId || !userEmail) {
  // Redirect to login if not logged in
  window.location.href = 'login.html';
}

// Display user email
document.getElementById('userEmail').textContent = userEmail;

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', () => {
  // Clear localStorage
  localStorage.removeItem('userId');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('token');
  
  // Sign out from Firebase
  auth.signOut().then(() => {
    window.location.href = 'login.html';
  });
});

// Semester 6 card click
document.getElementById('semester6Card').addEventListener('click', () => {
  window.location.href = 'calculator-sem6.html';
});

// Prevent clicking on disabled cards
document.querySelectorAll('.semester-card.disabled').forEach(card => {
  card.addEventListener('click', (e) => {
    e.preventDefault();
    alert('This semester is not available yet. Coming soon!');
  });
});

console.log('✅ Dashboard loaded');
console.log('User:', userEmail);