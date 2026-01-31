// Check if admin is logged in
const isAdmin = localStorage.getItem('isAdmin');
const adminToken = localStorage.getItem('adminToken');

if (!isAdmin || !adminToken) {
  window.location.href = 'admin-login.html';
}

// DOM Elements
const totalUsersEl = document.getElementById('totalUsers');
const newThisMonthEl = document.getElementById('newThisMonth');
const newThisWeekEl = document.getElementById('newThisWeek');
const usersTableBody = document.getElementById('usersTableBody');
const usersTable = document.getElementById('usersTable');
const loadingState = document.getElementById('loadingState');
const refreshBtn = document.getElementById('refreshBtn');
const logoutBtn = document.getElementById('logoutBtn');

let userGrowthChart = null;
let semesterUsageChart = null;

// Fetch Admin Stats
async function fetchStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    const data = await response.json();

    if (data.success) {
      totalUsersEl.textContent = data.stats.totalUsers;
      newThisMonthEl.textContent = data.stats.newThisMonth;
      newThisWeekEl.textContent = data.stats.newThisWeek;

      // Animate numbers
      animateValue(totalUsersEl, 0, data.stats.totalUsers, 1000);
      animateValue(newThisMonthEl, 0, data.stats.newThisMonth, 1000);
      animateValue(newThisWeekEl, 0, data.stats.newThisWeek, 1000);
    }
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
}

// Fetch Users List
async function fetchUsers() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    const data = await response.json();

    if (data.success) {
      displayUsers(data.users);
      createUserGrowthChart(data.users); // Pass users to chart
      // createSemesterUsageChart(data.users); // If we had semester data, we'd pass it here
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    loadingState.innerHTML = '<p class="text-danger">Error loading users</p>';
  }
}

// Display Users in Table
function displayUsers(users) {
  loadingState.style.display = 'none';
  usersTable.style.display = 'table';

  usersTableBody.innerHTML = '';

  users.forEach((user, index) => {
    const row = document.createElement('tr');

    const signupDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : 'N/A';
    const lastLogin = user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-IN') : 'Never';

    row.innerHTML = `
      <td>${index + 1}</td>
      <td class="user-email">${user.email}</td>
      <td class="date-text">${signupDate}</td>
      <td class="date-text">${lastLogin}</td>
    `;

    usersTableBody.appendChild(row);
  });
}

// Create User Growth Chart
function createUserGrowthChart(users) {
  const ctx = document.getElementById('userGrowthChart').getContext('2d');

  // Process users to get growth data by month (Last 6 months)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const today = new Date();
  const last6Months = [];
  const dataCounts = [0, 0, 0, 0, 0, 0];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    last6Months.push(months[d.getMonth()]);
  }

  // Count users per month
  users.forEach(user => {
    if (!user.createdAt) return;
    const date = new Date(user.createdAt);
    const monthDiff = (today.getFullYear() - date.getFullYear()) * 12 + (today.getMonth() - date.getMonth());
    if (monthDiff >= 0 && monthDiff < 6) {
      dataCounts[5 - monthDiff]++;
    }
  });

  // Cumulative for growth chart
  for (let i = 1; i < 6; i++) {
    dataCounts[i] += dataCounts[i - 1];
  }

  if (userGrowthChart) {
    userGrowthChart.destroy();
  }

  userGrowthChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: last6Months,
      datasets: [{
        label: 'Total Users',
        data: dataCounts,
        borderColor: '#0ea5e9', // Sky 500
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#0ea5e9',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 10
          }
        }
      }
    }
  });
}

// Create Semester Usage Chart
function createSemesterUsageChart() {
  const ctx = document.getElementById('semesterUsageChart').getContext('2d');

  // Sample data
  const data = [0, 0, 0, 0, 0, 100]; // Only Sem 6 is active
  const labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6'];

  if (semesterUsageChart) {
    semesterUsageChart.destroy();
  }

  semesterUsageChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: [
          '#E5E7EB',
          '#E5E7EB',
          '#E5E7EB',
          '#E5E7EB',
          '#E5E7EB',
          '#2D9A8C'
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

// Animate Number Counter
function animateValue(element, start, end, duration) {
  const range = end - start;
  const increment = end > start ? 1 : -1;
  const stepTime = Math.abs(Math.floor(duration / range));
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    element.textContent = current;
    if (current === end) {
      clearInterval(timer);
    }
  }, stepTime);
}

// Refresh Data
refreshBtn.addEventListener('click', () => {
  loadingState.style.display = 'flex';
  usersTable.style.display = 'none';
  fetchStats();
  fetchUsers();
});

// Logout
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('isAdmin');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminId');
  localStorage.removeItem('adminEmail');

  auth.signOut().then(() => {
    window.location.href = 'admin-login.html';
  });
});

// Initialize Dashboard
function initDashboard() {
  fetchStats();
  fetchUsers();
  createUserGrowthChart();
  createSemesterUsageChart();
}

// Load dashboard on page load
initDashboard();

console.log('✅ Admin dashboard loaded');