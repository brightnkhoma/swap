// lib/firebase/firebase.js
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import { initializeApp } from "firebase/app";

import {getFirestore} from "firebase/firestore"


export const firebaseConfig = {
  apiKey: "AIzaSyDigNqre1I2lgWNVUmxV6zmCfEc4XT9toc",
  authDomain: "wews-7fc10.firebaseapp.com",
  projectId: "wews-7fc10",
  storageBucket: "wews-7fc10.appspot.com",
  messagingSenderId: "883100704316",
  appId: "1:883100704316:web:5b025ed3152ec4de936d39",
  measurementId: "G-K4PHTC6N2Y"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();
const app = initializeApp(firebaseConfig);
export const firestoredb = getFirestore(app) 


export default firebase;