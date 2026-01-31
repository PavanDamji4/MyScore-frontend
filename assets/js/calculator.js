// Check authentication
const userId = localStorage.getItem('userId');
const userEmail = localStorage.getItem('userEmail');

if (!userId || !userEmail) {
  window.location.href = 'login.html';
}

// Get all input fields
const inputs = document.querySelectorAll('.marks-input');
const totalObtainedEl = document.getElementById('totalObtained');
const percentageEl = document.getElementById('percentage');
const clearBtn = document.getElementById('clearBtn');
const printBtn = document.getElementById('printBtn');
const backBtn = document.getElementById('backBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Constants
const TOTAL_MAX_MARKS = 850;

// Calculate subject total for a row
function calculateSubjectTotal(row) {
  const rowInputs = row.querySelectorAll('.marks-input');
  let total = 0;

  rowInputs.forEach(input => {
    const value = parseInt(input.value) || 0;
    total += value;
  });

  const totalCell = row.querySelector('.subject-total');
  totalCell.textContent = total;

  return total;
}

// Calculate grand total and percentage
function calculateGrandTotal() {
  const rows = document.querySelectorAll('tbody tr');
  let grandTotal = 0;

  rows.forEach(row => {
    const subjectTotal = calculateSubjectTotal(row);
    grandTotal += subjectTotal;
  });

  // Update total obtained
  totalObtainedEl.textContent = grandTotal;

  // Calculate percentage
  const percentage = ((grandTotal / TOTAL_MAX_MARKS) * 100).toFixed(2);
  percentageEl.textContent = percentage + '%';

  return { grandTotal, percentage };
}

// Validate input
function validateInput(input) {
  const max = parseInt(input.getAttribute('data-max'));
  let value = parseInt(input.value);

  if (isNaN(value)) {
    input.value = '';
    return;
  }

  if (value < 0) {
    input.value = 0;
  } else if (value > max) {
    input.value = max;
    alert(`Maximum marks for this field is ${max}`);
  }

  calculateGrandTotal();
}

// Add event listeners to all inputs
inputs.forEach(input => {
  input.addEventListener('input', () => validateInput(input));
  input.addEventListener('change', () => validateInput(input));
});

// Clear all inputs
clearBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to clear all marks?')) {
    inputs.forEach(input => {
      input.value = '';
    });
    calculateGrandTotal();
  }
});

// Print functionality
printBtn.addEventListener('click', () => {
  window.print();
});

// Back button
backBtn.addEventListener('click', () => {
  window.location.href = 'dashboard.html';
});

// Logout
logoutBtn.addEventListener('click', () => {
  localStorage.clear();
  auth.signOut().then(() => {
    window.location.href = 'login.html';
  });
});

// Save calculation to Firestore (optional - auto-save on change)
let saveTimeout;
function autoSave() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    const { grandTotal, percentage } = calculateGrandTotal();

    if (grandTotal > 0) {
      try {
        // Collect all marks data
        const subjects = [];
        document.querySelectorAll('tbody tr').forEach(row => {
          const subjectName = row.querySelector('.course-title').textContent.trim();
          const subjectInputs = row.querySelectorAll('.marks-input');
          const marks = [];

          subjectInputs.forEach(input => {
            marks.push(parseInt(input.value) || 0);
          });

          subjects.push({
            name: subjectName,
            marks: marks,
            total: calculateSubjectTotal(row)
          });
        });

        // Save to Firestore via API
        const response = await fetch(`${API_BASE_URL}/calculator/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            semester: 6,
            subjects: subjects,
            totalObtained: grandTotal,
            totalMax: TOTAL_MAX_MARKS,
            percentage: parseFloat(percentage)
          })
        });

        const data = await response.json();
        console.log('Auto-saved:', data);
      } catch (error) {
        console.error('Auto-save error:', error);
      }
    }
  }, 2000); // Save 2 seconds after user stops typing
}

// PDF Export button click
const pdfBtn = document.getElementById('pdfBtn');
if (pdfBtn) {
  pdfBtn.addEventListener('click', () => {
    const totalObtained = parseInt(document.getElementById('totalObtained').textContent);

    if (totalObtained === 0) {
      alert('Please enter some marks before exporting PDF');
      return;
    }

    generatePDF();
  });
}

// Add auto-save to inputs
inputs.forEach(input => {
  input.addEventListener('input', autoSave);
});

// Initial calculation
calculateGrandTotal();