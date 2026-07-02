import { initializeApp } from "firebase/app";
import { getAuth,GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCTiS5DcVoYVJCUkKqveI5P7Gx6UgBS8bY",
  authDomain: "yourtube-8d6c0.firebaseapp.com",
  projectId: "yourtube-8d6c0",
  storageBucket: "yourtube-8d6c0.firebasestorage.app",
  messagingSenderId: "196005304078",
  appId: "1:196005304078:web:2394cf8ca202339c06695f",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { auth, provider };
