// PDF Export Functionality using jsPDF
// Requires: jsPDF and jsPDF-AutoTable

function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4'); // Portrait, millimeters, A4

  // --- 1. Header (Same as Image) ---
  doc.setFillColor(45, 154, 140); // Teal color
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.text('MyScore', 105, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text('MSBTE Diploma Percentage Calculator', 105, 30, { align: 'center' });

  // --- 2. Student Info ---
  const userEmail = localStorage.getItem('userEmail') || 'Student';
  const currentDate = new Date().toLocaleDateString('en-IN');

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.text(`Student Email: ${userEmail}`, 15, 55);
  doc.text(`Date: ${currentDate}`, 15, 62);
  doc.text(`Semester: 6`, 15, 69);

  // Line separator
  doc.setDrawColor(45, 154, 140);
  doc.setLineWidth(0.5);
  doc.line(15, 75, 195, 75);

  // --- 3. Detailed Table ---

  // Define Table Headers
  const head = [
    [
      { content: 'Sr', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
      { content: 'Course Title', rowSpan: 2, styles: { valign: 'middle', halign: 'left' } },
      { content: 'Abbr', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
      { content: 'Code', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
      { content: 'Theory (Final)', colSpan: 2, styles: { halign: 'center' } },
      { content: 'Theory (UT)', colSpan: 2, styles: { halign: 'center' } },
      { content: 'Practical (FA-PR)', colSpan: 2, styles: { halign: 'center' } },
      { content: 'Practical (SA-PR)', colSpan: 2, styles: { halign: 'center' } },
      { content: 'SLA', colSpan: 2, styles: { halign: 'center' } },
      { content: 'Subject\nTotal', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
    ],
    [
      { content: 'Max', styles: { halign: 'center' } },
      { content: 'Obt', styles: { halign: 'center' } },
      { content: 'Max', styles: { halign: 'center' } },
      { content: 'Obt', styles: { halign: 'center' } },
      { content: 'Max', styles: { halign: 'center' } },
      { content: 'Obt', styles: { halign: 'center' } },
      { content: 'Max', styles: { halign: 'center' } },
      { content: 'Obt', styles: { halign: 'center' } },
      { content: 'Max', styles: { halign: 'center' } },
      { content: 'Obt', styles: { halign: 'center' } },
    ]
  ];

  // Collect Table Body Data
  const body = [];
  document.querySelectorAll('tbody tr').forEach((row, index) => {
    const rowData = [];

    // Sr
    rowData.push(index + 1);

    // Course Title
    rowData.push(row.querySelector('.course-title').innerText.trim());

    // Abbr
    rowData.push(row.querySelector('.course-abbr').innerText.trim());

    // Code
    rowData.push(row.querySelector('.course-code').innerText.trim());

    // Marks columns (Iterate over input cells or empty cells)
    // The structure is fixed: 
    // 1. Theory Final Max (class max-marks)
    // 2. Theory Final Obt (input)
    // ...

    // We can just grab all cells from index 4 to end-1 (excluding first 4 and last 1)
    const cells = Array.from(row.children);

    // Theory Final
    rowData.push(getCellValue(cells[4])); // Max
    rowData.push(getInputOrText(cells[5])); // Obt

    // Theory UT
    rowData.push(getCellValue(cells[6])); // Max
    rowData.push(getInputOrText(cells[7])); // Obt

    // Practical FA-PR
    rowData.push(getCellValue(cells[8])); // Max
    rowData.push(getInputOrText(cells[9])); // Obt

    // Practical SA-PR
    rowData.push(getCellValue(cells[10])); // Max
    rowData.push(getInputOrText(cells[11])); // Obt

    // SLA
    rowData.push(getCellValue(cells[12])); // Max
    rowData.push(getInputOrText(cells[13])); // Obt

    // Total
    rowData.push(row.querySelector('.subject-total').innerText.trim());

    body.push(rowData);
  });

  // Helper to get text from cell (handling inputs and plain text)
  function getCellValue(cell) {
    return cell.innerText.trim();
  }

  function getInputOrText(cell) {
    const input = cell.querySelector('input');
    if (input) {
      return input.value || '-'; // Show entered value or dash
    }
    return cell.innerText.trim();
  }

  // Generate Table
  doc.autoTable({
    startY: 85,
    head: head,
    body: body,
    theme: 'grid',
    styles: {
      fontSize: 7, // Smaller font for detailed table
      cellPadding: 1,
      overflow: 'linebreak',
      halign: 'center'
    },
    columnStyles: {
      1: { halign: 'left', cellWidth: 40 }, // Course Title
    },
    headStyles: {
      fillColor: [45, 154, 140],
      textColor: 255,
      fontStyle: 'bold',
      lineWidth: 0.1,
      lineColor: 200
    },
    margin: { top: 85, left: 10, right: 10 },
    didDrawPage: function (data) {
      // Header is drawn manually above
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      const text = `Generated by MyScore - Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${pageCount}`;
      doc.text(text, 105, 285, { align: 'center' });
    }
  });

  // --- 4. Results Summary (After Table) ---
  const finalY = doc.lastAutoTable.finalY + 10;
  const totalObtained = document.getElementById('totalObtained').textContent;
  const percentage = document.getElementById('percentage').textContent;

  // Box for results
  doc.setFillColor(240, 240, 240); // Light Gray
  doc.setDrawColor(200, 200, 200);
  doc.rect(15, finalY, 180, 30, 'FD');

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Results Summary', 105, finalY + 10, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text(`Total Marks Obtained: ${totalObtained} / 850`, 25, finalY + 20);

  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(45, 154, 140); // Teal
  doc.text(`Percentage: ${percentage}`, 130, finalY + 20);

  // Save PDF
  doc.save(`MyScore_Semester6_${currentDate.replace(/\//g, '-')}.pdf`);
}