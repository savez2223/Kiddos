// Import Firebase App and Realtime Database modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getDatabase, ref, push, set, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDATlDp9us459JwKlB3obDFlLXqQ2BrbBo",
  authDomain: "kiddos-65959.firebaseapp.com",
  projectId: "kiddos-65959",
  storageBucket: "kiddos-65959.firebasestorage.app",
  messagingSenderId: "475249839192",
  appId: "1:475249839192:web:b62023a856436a1bf50e2d",
  databaseURL: "https://kiddos-65959-default-rtdb.firebaseio.com/"
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