// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDr3LFPgVWGqp5VwbnLA__HrpG3k60ufqw",
  authDomain: "bike-csecu-server.firebaseapp.com",
  projectId: "bike-csecu-server",
  storageBucket: "bike-csecu-server.appspot.com",
  messagingSenderId: "555924591583",
  appId: "1:555924591583:web:07101e7c2282ba7dcfea6a",
  measurementId: "G-J4LBWXPXTN"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);