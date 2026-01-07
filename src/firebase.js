import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyApUoRXUM8kk_Gj6HXhupJP-lsRVgV9F58",
  authDomain: "riaz-bakers-588e6.firebaseapp.com",
  projectId: "riaz-bakers-588e6",
  storageBucket: "riaz-bakers-588e6.firebasestorage.app",
  messagingSenderId: "442442412144",
  appId: "1:442442412144:web:40480836489731ce8d44b5",
  measurementId: "G-D7B0HT3G00",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
