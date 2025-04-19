import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getDatabase, ref, onValue, remove } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js';

const { jsPDF } = window.jspdf;

const firebaseConfig = {
  apiKey: "AIzaSyDATlDp9us459JwKlB3obDFlLXqQ2BrbBo",
  authDomain: "kiddos-65959.firebaseapp.com",
  projectId: "kiddos-65959",
  storageBucket: "kiddos-65959.firebasestorage.app",
  messagingSenderId: "475249839192",
  appId: "1:475249839192:web:b62023a856436a1bf50e2d",
  databaseURL: "https://kiddos-65959-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const admissionsRef = ref(database, 'admissions');
const quotesRef = ref(database, 'quotes');
const applicationsRef = ref(database, 'jobApplications');

let loadedSections = {
  admissions: false,
  quotes: false,
  applications: false
};

let allAdmissions = [];
let allQuotes = [];
let allApplications = [];
let dateStart = null;
let dateEnd = null;
let nameFilter = '';

function updateLoading() {
  const loading = document.getElementById('loading');
  if (loadedSections.admissions && loadedSections.quotes && loadedSections.applications) {
    loading.style.display = 'none';
  }
}

function formatDate(timestamp) {
  if (!timestamp) return 'N/A';
  try {
    return new Date(timestamp).toLocaleString();
  } catch {
    return 'Invalid';
  }
}

function filterByDateAndName(data, nameField, secondaryNameField = null) {
  return Object.entries(data || {}).filter(([_, entry]) => {
    // Date filter
    const timestamp = entry.timestamp || null;
    let dateMatch = true;
    if (timestamp && (dateStart || dateEnd)) {
      const entryDate = new Date(timestamp);
      if (dateStart && entryDate < new Date(dateStart)) dateMatch = false;
      if (dateEnd && entryDate > new Date(dateEnd + 'T23:59:59')) dateMatch = false;
    }

    // Name filter
    let nameMatch = true;
    if (nameFilter) {
      const searchTerm = nameFilter.toLowerCase();
      const primaryName = entry[nameField] ? entry[nameField].toLowerCase() : '';
      const secondaryName = secondaryNameField && entry[secondaryNameField] ? entry[secondaryNameField].toLowerCase() : '';
      nameMatch = primaryName.includes(searchTerm) || (secondaryName && secondaryName.includes(searchTerm));
    }

    return dateMatch && nameMatch;
  });
}

function renderAdmissions() {
  const tableBody = document.getElementById('admissionsTableBody');
  const table = document.getElementById('admissionsTable');
  tableBody.innerHTML = '';

  const filteredAdmissions = filterByDateAndName(allAdmissions, 'guardianName');
  if (filteredAdmissions.length > 0) {
    table.style.display = 'table';
    filteredAdmissions.forEach(([key, admission]) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${admission.guardianName || 'N/A'}</td>
        <td>${admission.phoneNumber || 'N/A'}</td>
        <td>${admission.selectedClass || 'N/A'}</td>
        <td>${formatDate(admission.timestamp)}</td>
        <td>
          <button onclick='generatePDF(${JSON.stringify(admission)}, "Admission", "${key}")'>Download</button>
          <button onclick='deleteEntry("admissions", "${key}", "Admission")' style="background: #dc3545; margin-left: 5px;">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  } else {
    tableBody.innerHTML = '<tr><td colspan="5">No admissions found</td></tr>';
    table.style.display = 'table';
  }
}

function renderQuotes() {
  const tableBody = document.getElementById('quoteTableBody');
  const table = document.getElementById('quoteTable');
  tableBody.innerHTML = '';

  const filteredQuotes = filterByDateAndName(allQuotes, 'childName', 'fatherName');
  if (filteredQuotes.length > 0) {
    table.style.display = 'table';
    filteredQuotes.forEach(([key, quote]) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${quote.childName || 'N/A'}</td>
        <td>${quote.fatherName || 'N/A'}</td>
        <td>${quote.program || 'N/A'}</td>
        <td>${quote.phone || 'N/A'}</td>
        <td>${quote.email || 'N/A'}</td>
        <td>${quote.gender || 'N/A'}</td>
        <td>${quote.address || 'N/A'}</td>
        <td>${quote.message || 'N/A'}</td>
        <td>${formatDate(quote.timestamp)}</td>
        <td>
          <button onclick='generatePDF(${JSON.stringify(quote)}, "Quote", "${key}")'>Download PDF</button>
          <button onclick='deleteEntry("quotes", "${key}", "Quote")' style="background: #dc3545; margin-left: 5px;">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  } else {
    table.style.display = 'none';
  }
}

function renderApplications() {
  const tableBody = document.getElementById('applicationTableBody');
  const table = document.getElementById('applicationTable');
  tableBody.innerHTML = '';

  const filteredApplications = filterByDateAndName(allApplications, 'name');
  if (filteredApplications.length > 0) {
    table.style.display = 'table';
    filteredApplications.forEach(([key, application]) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${application.name || 'N/A'}</td>
        <td>${application.phone || 'N/A'}</td>
        <td>${application.email || 'N/A'}</td>
        <td>${application.position || 'N/A'}</td>
        <td>${formatDate(application.timestamp)}</td>
        <td>
          <button onclick='generatePDF(${JSON.stringify(application)}, "Application", "${key}")'>Download PDF</button>
          <button onclick='deleteEntry("jobApplications", "${key}", "Application")' style="background: #dc3545; margin-left: 5px;">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  } else {
    table.style.display = 'none';
  }
}

onValue(admissionsRef, (snapshot) => {
  allAdmissions = snapshot.val() || {};
  renderAdmissions();
  loadedSections.admissions = true;
  updateLoading();
}, (error) => {
  console.error('Error fetching admissions:', error);
  document.getElementById('loading').textContent = 'Error loading data: ' + error.message;
});

onValue(quotesRef, (snapshot) => {
  allQuotes = snapshot.val() || {};
  renderQuotes();
  loadedSections.quotes = true;
  updateLoading();
}, (error) => {
  console.error('Error fetching quotes:', error);
  document.getElementById('loading').textContent = 'Error loading data: ' + error.message;
});

onValue(applicationsRef, (snapshot) => {
  allApplications = snapshot.val() || {};
  renderApplications();
  loadedSections.applications = true;
  updateLoading();
}, (error) => {
  console.error('Error fetching applications:', error);
  document.getElementById('loading').textContent = 'Error loading data: ' + error.message;
});

function generatePDF(data, type, key = '') {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(
    type === 'Quote' ? 'Quote Request' :
    type === 'Application' ? 'Job Application' : 'Admission Form',
    10, 10
  );

  let y = 20;
  for (const [field, value] of Object.entries(data)) {
    if (field !== 'timestamp') {
      doc.text(`${field}: ${value || 'N/A'}`, 10, y);
      y += 10;
    }
  }
  if (data.timestamp) {
    doc.text(`Timestamp: ${formatDate(data.timestamp)}`, 10, y);
  }

  const filename = `${type}_${key}_${Date.now()}.pdf`;
  doc.save(filename);
}

function deleteEntry(node, key, type) {
  if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

  const entryRef = ref(database, `${node}/${key}`);
  remove(entryRef)
    .then(() => {
      alert(`${type} deleted successfully!`);
    })
    .catch((error) => {
      console.error(`Error deleting ${type}:`, error);
      alert(`Failed to delete ${type}: ${error.message}`);
    });
}

function setupFilters() {
  const contentDiv = document.getElementById('content');
  const filterDiv = document.createElement('div');
  filterDiv.style = 'margin-bottom: 20px; display: flex; gap: 10px; flex-wrap: wrap;';
  filterDiv.innerHTML = `
    <div>
      <label style="margin-right: 5px;">Start Date:</label>
      <input type="date" id="dateStart" style="padding: 5px;">
    </div>
    <div>
      <label style="margin-right: 5px;">End Date:</label>
      <input type="date" id="dateEnd" style="padding: 5px;">
    </div>
    <div>
      <label style="margin-right: 5px;">Name:</label>
      <input type="text" id="nameFilter" placeholder="Enter name..." style="padding: 5px;">
    </div>
  `;
  contentDiv.insertBefore(filterDiv, contentDiv.querySelector('h1'));

  document.getElementById('dateStart').addEventListener('change', (e) => {
    dateStart = e.target.value;
    renderAdmissions();
    renderQuotes();
    renderApplications();
  });

  document.getElementById('dateEnd').addEventListener('change', (e) => {
    dateEnd = e.target.value;
    renderAdmissions();
    renderQuotes();
    renderApplications();
  });

  document.getElementById('nameFilter').addEventListener('input', (e) => {
    nameFilter = e.target.value;
    renderAdmissions();
    renderQuotes();
    renderApplications();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupFilters();
});

window.generatePDF = generatePDF;
window.deleteEntry = deleteEntry;