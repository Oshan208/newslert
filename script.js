// Import the necessary Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, push, set, onValue } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAGtd7tZyrr6FNMDdH6KGJMgQJ9qkyDWI0",
  authDomain: "newwebapp-17077.firebaseapp.com",
  databaseURL: "https://newwebapp-17077-default-rtdb.firebaseio.com",
  projectId: "newwebapp-17077",
  storageBucket: "newwebapp-17077.appspot.com",
  messagingSenderId: "34654677405",
  appId: "1:34654677405:web:dcfe8f03fe689cef1be774",
  measurementId: "G-VHK511TH19"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Get references to UI elements
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const logoutBtn = document.getElementById("logoutBtn");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const userEmailSpan = document.getElementById("userEmail");
const authSection = document.getElementById("authSection");
const userSection = document.getElementById("userSection");
const postAlertBtn = document.getElementById("postAlertBtn");
const alertMessageInput = document.getElementById("alertMessage");
const alertsContainer = document.getElementById("alertsContainer");

// Register new users
registerBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      alert("Registration successful! You can now log in.");
    })
    .catch((error) => {
      alert(error.message);
    });
});

// Login existing users
loginBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      alert("Login successful!");
    })
    .catch((error) => {
      alert(error.message);
    });
});

// Logout users
logoutBtn.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      alert("Logged out successfully!");
      userSection.style.display = "none";
      authSection.style.display = "block";
    })
    .catch((error) => {
      alert(error.message);
    });
});

// Post a new news alert
postAlertBtn.addEventListener("click", () => {
  const alertMessage = alertMessageInput.value;
  const user = auth.currentUser;

  if (user && alertMessage) {
    const timestamp = new Date().toLocaleString();
    const alertRef = ref(db, 'alerts');
    const newAlertRef = push(alertRef);

    set(newAlertRef, {
      username: user.email,
      message: alertMessage,
      timestamp: timestamp
    }).then(() => {
      alertMessageInput.value = ''; // Clear the input
    }).catch((error) => {
      alert("Failed to post alert: " + error.message);
    });
  } else {
    alert("Please log in and type a message.");
  }
});

// Listen for real-time updates of alerts
onValue(ref(db, 'alerts'), (snapshot) => {
  alertsContainer.innerHTML = "<h2>News Alerts</h2>"; // Reset the container
  const alerts = snapshot.val();
  if (alerts) {
    Object.keys(alerts).forEach((key) => {
      const alert = alerts[key];
      const alertDiv = document.createElement('div');
      alertDiv.className = 'alert-item';
      alertDiv.innerHTML = `<p><strong>${alert.username}</strong> (${alert.timestamp})</p><p>${alert.message}</p>`;
      alertsContainer.appendChild(alertDiv);
    });
  }
});

// Authentication state observer
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    userEmailSpan.textContent = user.email;
    userSection.style.display = "block";
    authSection.style.display = "none";
  } else {
    // No user is signed in
    userSection.style.display = "none";
    authSection.style.display = "block";
  }
});
