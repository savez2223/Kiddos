// Import Firebase App and Realtime Database modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getDatabase, ref, push, set, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js';

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

// Handle form submission
document.getElementById('jobApplicationForm').addEventListener('submit', async function(e) {
  e.preventDefault(); // Prevent default form submission

  // Get form values
  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const email = document.getElementById('email').value;
  const position = document.getElementById('position').value;

  try {
    // Create a unique ID for the application
    const applicationRef = ref(database, 'jobApplications/' + push(ref(database, 'jobApplications')).key);

    // Save data to Realtime Database
    await set(applicationRef, {
      name: name,
      phone: phone,
      email: email,
      position: position,
      timestamp: serverTimestamp()
    });

    alert('Job application submitted successfully!');
    document.getElementById('jobApplicationForm').reset(); // Reset form
  } catch (error) {
    console.error('Error submitting application:', error);
    alert('Failed to submit application: ' + error.message);
  }
});