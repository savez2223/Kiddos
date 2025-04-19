// Import Firebase App and Realtime Database modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

// Your Firebase configuration
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


// Handle form submission
document.getElementById("quoteForm").addEventListener("submit", function (e) {
  e.preventDefault(); // Prevent default form submission
  console.log("Form submitted!"); // Debug log

  // Get form values
  const childName = document.getElementById("childName").value;
  const fatherName = document.getElementById("fatherName").value;
  const program = document.getElementById("program").value;
  const phone = document.getElementById("phone").value;
  const email = document.getElementById("email").value;
  const gender = document.getElementById("gender").value;
  const address = document.getElementById("address").value;
  const message = document.getElementById("message").value;

  console.log("Form data:", {
    childName,
    fatherName,
    program,
    phone,
    email,
    gender,
    address,
    message,
  }); // Log form data

  // Create a unique ID for each submission
  const newQuoteRef = ref(
    database,
    "quotes/" + push(ref(database, "quotes")).key
  );

  // Send data to Firebase
  set(newQuoteRef, {
    childName: childName,
    fatherName: fatherName,
    program: program,
    phone: phone,
    email: email,
    gender: gender,
    address: address,
    message: message,
    timestamp: serverTimestamp(),
  })
    .then(() => {
      console.log("Data sent to Firebase successfully"); // Success log
      alert("Quote request submitted successfully!");
      document.getElementById("quoteForm").reset(); // Reset form
    })
    .catch((error) => {
      console.error("Error submitting quote:", error); // Error log
      alert("Failed to submit quote: " + error.message);
    });
});

