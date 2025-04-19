import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

const { jsPDF } = window.jspdf;

// Firebase configuration for kiddos-65959
const firebaseConfig = {
  apiKey: "AIzaSyDATlDp9us459JwKlB3obDFlLXqQ2BrbBo",
  authDomain: "kiddos-65959.firebaseapp.com",
  projectId: "kiddos-65959",
  storageBucket: "kiddos-65959.firebasestorage.app",
  messagingSenderId: "475249839192",
  appId: "1:475249839192:web:b62023a856436a1bf50e2d",
  databaseURL: "https://kiddos-65959-default-rtdb.firebaseio.com/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
console.log("Firebase initialized:");

// DOM Elements
const loading = document.getElementById("loading");
const admissionsTable = document.getElementById("admissionsTable");
const admissionsTableBody = document.getElementById("admissionsTableBody");

// Function to format timestamp
function formatTimestamp(timestamp) {
  if (!timestamp) return "N/A";
  try {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    return "Invalid";
  }
}

// Function to generate PDF
function generatePDF(data, type, id) {
  try {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`${type} Details`, 20, 20);
    doc.setFontSize(12);
    let y = 30;
    for (const [key, value] of Object.entries(data)) {
      doc.text(`${key}: ${value || "N/A"}`, 20, y);
      y += 10;
    }
    doc.save(`${type}_${id}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Failed to generate PDF: " + error.message);
  }
}

// Fetch and display admissions data
function loadAdmissionsData() {
  const admissionsRef = ref(database, "admissions");
  onValue(
    admissionsRef,
    (snapshot) => {
      try {
        admissionsTableBody.innerHTML = ""; // Clear table
        const data = snapshot.val();
        console.log("Fetched admissions data:", data); // Debug log
        if (data) {
          Object.entries(data).forEach(([id, entry]) => {
            const row = document.createElement("tr");
            row.innerHTML = `
              <td>${entry.guardianName || "N/A"}</td>
              <td>${entry.phoneNumber || "N/A"}</td>
              <td>${entry.selectedClass || "N/A"}</td>
              <td>${formatTimestamp(entry.timestamp)}</td>
              <td><button onclick="generatePDF(${JSON.stringify(entry)}, 'Admission', '${id}')">Download</button></td>
            `;
            admissionsTableBody.appendChild(row);
          });
          admissionsTable.style.display = "table";
        } else {
          admissionsTableBody.innerHTML = '<tr><td colspan="5">No admissions inquiries found.</td></tr>';
          admissionsTable.style.display = "table";
        }
        loading.style.display = "none";
      } catch (error) {
        console.error("Error processing admissions data:", error);
        admissionsTableBody.innerHTML = '<tr><td colspan="5">Error loading data: ' + error.message + '</td></tr>';
        admissionsTable.style.display = "table";
        loading.style.display = "none";
      }
    },
    (error) => {
      console.error("Firebase fetch error:", error);
      admissionsTableBody.innerHTML = '<tr><td colspan="5">Failed to fetch data: ' + error.message + '</td></tr>';
      admissionsTable.style.display = "table";
      loading.style.display = "none";
    }
  );
}

// Initialize data loading
document.addEventListener("DOMContentLoaded", () => {
  console.log("Initializing admissions data load..."); // Debug log
  loadAdmissionsData();
});

// Expose generatePDF to global scope for button onclick
window.generatePDF = generatePDF;
