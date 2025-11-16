import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDe3WgQwKiPEsOkSK9JwQsDWj46Vtw3Pbs",
  authDomain: "gamersguide-1beef.firebaseapp.com",
  projectId: "gamersguide-1beef",
  storageBucket: "gamersguide-1beef.firebasestorage.app",
  messagingSenderId: "299007970534",
  appId: "1:299007970534:web:269bec27325d4038553f27",
  measurementId: "G-RPBO1HDHWN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
