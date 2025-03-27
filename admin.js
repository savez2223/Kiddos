// Import Firebase App and Realtime Database modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getDatabase, ref, onValue } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js';

// Get jsPDF from the global window object (loaded via CDN)
const { jsPDF } = window.jspdf;

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCAN1cgb86_9tZ7ZCQeU0jgQ8-b-m63pbw",
  authDomain: "kiddos-c84e1.firebaseapp.com",
  projectId: "kiddos-c84e1",
  storageBucket: "kiddos-c84e1.firebasestorage.app",
  messagingSenderId: "553799701005",
  appId: "1:553799701005:web:4fecb866121a099f43fb44",
  databaseURL: "https://kiddos-c84e1-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// References to Firebase nodes
const quotesRef = ref(database, 'quotes');
const applicationsRef = ref(database, 'jobApplications');

// Function to generate PDF
function generatePDF(data, type) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(type === 'quote' ? 'Quote Request' : 'Job Application', 10, 10);

  let y = 20;
  Object.keys(data).forEach((key) => {
    if (key !== 'timestamp') {
      doc.text(`${key}: ${data[key] || 'N/A'}`, 10, y);
      y += 10;
    }
  });
  doc.text(`Timestamp: ${new Date(data.timestamp).toLocaleString()}`, 10, y);

  doc.save(`${type}_${data.name || data.childName}_${Date.now()}.pdf`);
}

// Fetch and display Quote Requests
onValue(quotesRef, (snapshot) => {
  const data = snapshot.val();
  const tableBody = document.getElementById('quoteTableBody');
  const table = document.getElementById('quoteTable');
  const loading = document.getElementById('loading');

  tableBody.innerHTML = '';

  if (data) {
    table.style.display = 'table';
    Object.keys(data).forEach((key) => {
      const quote = data[key];
      const row = document.createElement('tr');
      const date = quote.timestamp ? new Date(quote.timestamp).toLocaleString() : 'N/A';

      row.innerHTML = `
        <td>${quote.childName || 'N/A'}</td>
        <td>${quote.fatherName || 'N/A'}</td>
        <td>${quote.program || 'N/A'}</td>
        <td>${quote.phone || 'N/A'}</td>
        <td>${quote.email || 'N/A'}</td>
        <td>${quote.gender || 'N/A'}</td>
        <td>${quote.address || 'N/A'}</td>
        <td>${quote.message || 'N/A'}</td>
        <td>${date}</td>
        <td><button onclick='generatePDF(${JSON.stringify(quote)}, "quote")'>Download PDF</button></td>
      `;
      tableBody.appendChild(row);
    });
  } else {
    table.style.display = 'none';
  }
  checkLoadingState();
}, (error) => {
  console.error('Error fetching quotes:', error);
  document.getElementById('loading').textContent = 'Error loading data: ' + error.message;
});

// Fetch and display Job Applications
onValue(applicationsRef, (snapshot) => {
  const data = snapshot.val();
  const tableBody = document.getElementById('applicationTableBody');
  const table = document.getElementById('applicationTable');
  const loading = document.getElementById('loading');

  tableBody.innerHTML = '';

  if (data) {
    table.style.display = 'table';
    Object.keys(data).forEach((key) => {
      const application = data[key];
      const row = document.createElement('tr');
      const date = application.timestamp ? new Date(application.timestamp).toLocaleString() : 'N/A';

      row.innerHTML = `
        <td>${application.name || 'N/A'}</td>
        <td>${application.phone || 'N/A'}</td>
        <td>${application.email || 'N/A'}</td>
        <td>${application.position || 'N/A'}</td>
        <td>${date}</td>
        <td><button onclick='generatePDF(${JSON.stringify(application)}, "application")'>Download PDF</button></td>
      `;
      tableBody.appendChild(row);
    });
  } else {
    table.style.display = 'none';
  }
  checkLoadingState();
}, (error) => {
  console.error('Error fetching applications:', error);
  document.getElementById('loading').textContent = 'Error loading data: ' + error.message;
});

// Check if both tables are loaded to hide loading message
function checkLoadingState() {
  const quoteTable = document.getElementById('quoteTable');
  const applicationTable = document.getElementById('applicationTable');
  const loading = document.getElementById('loading');

  if ((quoteTable.style.display === 'table' || !quoteTable.children[1].children.length) &&
      (applicationTable.style.display === 'table' || !applicationTable.children[1].children.length)) {
    loading.style.display = 'none';
  }
}

// Expose generatePDF to global scope for onclick
window.generatePDF = generatePDF;