// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBnwYYFy8KHprHosiyBsplo7TEFZKM0pGw",
  authDomain: "myscore-d4710.firebaseapp.com",
  projectId: "myscore-d4710",
  storageBucket: "myscore-d4710.firebasestorage.app",
  messagingSenderId: "998060664778",
  appId: "1:998060664778:web:889d4bbb85c1d374935133"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

// API Base URL - UPDATED WITH YOUR RAILWAY URL
const API_BASE_URL = 'https://myscore-backend-production.up.railway.app/api';

console.log('✅ Firebase initialized');
console.log('✅ API Base URL:', API_BASE_URL);