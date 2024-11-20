// Importar Firebase usando las URLs completas
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBB6joJI6XtdpFZsd9kXmCfiOMLb-fIQsg",
    authDomain: "prototipo-arquitectura.firebaseapp.com",
    projectId: "prototipo-arquitectura",
    storageBucket: "prototipo-arquitectura.firebasestorage.app",
    messagingSenderId: "344159891600",
    appId: "1:344159891600:web:dc3d7421bfe50f3bd36815",
    measurementId: "G-4M1FSNS196"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db }; 