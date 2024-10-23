// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-storage.js";

// Firebase Configuration
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
const auth = getAuth();
const storage = getStorage();

// Handle User Registration and Email Verification
document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            userCredential.user.sendEmailVerification().then(() => {
                document.getElementById('message').textContent = 'Verification email sent!';
            });
        })
        .catch((error) => {
            document.getElementById('message').textContent = error.message;
        });
});

// Handle User Login and Email Verification Check
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            if (userCredential.user.emailVerified) {
                document.getElementById('loginMessage').textContent = 'Login successful!';
            } else {
                document.getElementById('loginMessage').textContent = 'Please verify your email first!';
            }
        })
        .catch((error) => {
            document.getElementById('loginMessage').textContent = error.message;
        });
});

// Handle Profile Setup (Name and Profile Picture)
document.getElementById('profileForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    const displayName = document.getElementById('displayName').value;
    const profilePicture = document.getElementById('profilePicture').files[0];

    if (user) {
        // Upload profile picture
        const storageRef = ref(storage, `profilePictures/${user.uid}`);
        uploadBytes(storageRef, profilePicture).then(() => {
            getDownloadURL(storageRef).then((downloadURL) => {
                user.updateProfile({
                    displayName: displayName,
                    photoURL: downloadURL
                }).then(() => {
                    document.getElementById('profileMessage').textContent = 'Profile updated successfully!';
                }).catch((error) => {
                    document.getElementById('profileMessage').textContent = error.message;
                });
            });
        });
    }
});
