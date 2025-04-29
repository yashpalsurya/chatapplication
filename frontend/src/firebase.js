// Import firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your copied config
const firebaseConfig = {
    apiKey: "AIzaSyATq4MXnvj_z8rJxYss2_WzcarJo_v63ak",
    authDomain: "voicechatapp-bec24.firebaseapp.com",
    projectId: "voicechatapp-bec24",
    storageBucket: "voicechatapp-bec24.firebasestorage.app",
    messagingSenderId: "535104295343",
    appId: "1:535104295343:web:37760d6cd3d686f200df5a"
  };
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
