
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAriCN0x2kCdoBwp3CurnUJGUNPlxFWE1s",
  authDomain: "flashcard-generator-4acd8.firebaseapp.com",
  projectId: "flashcard-generator-4acd8",
  storageBucket: "flashcard-generator-4acd8.firebasestorage.app",
  messagingSenderId: "435377389069",
  appId: "1:435377389069:web:b1214fe2db16555daedf44",
  measurementId: "G-SCWCW5NQY0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the auth service
const auth = getAuth(app)
export {auth}
