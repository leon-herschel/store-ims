import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAvqJ4AzNn94U4h3WZWXYoIQfx4jXwuOLE",
  authDomain: "store-ims.firebaseapp.com",
  projectId: "store-ims",
  storageBucket: "store-ims.appspot.com",
  messagingSenderId: "318218675710",
  appId: "1:318218675710:web:e6a2db888ed913d59a8caf",
  measurementId: "G-WFFXJNC089"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
export const auth = getAuth(app)
export const db = getFirestore(app)