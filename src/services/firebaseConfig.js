import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Adicione esta importação
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyA8_-uiJqcW4fCIj10_axS0GW4qfNQbXoQ",
  authDomain: "achameupet-ae8c6.firebaseapp.com",
  projectId: "achameupet-ae8c6",
  storageBucket: "achameupet-ae8c6.appspot.com",
  messagingSenderId: "582333314193",
  appId: "1:582333314193:web:d493b151abdbe355567b30",
  measurementId: "G-HS9Z7XPJVC"
};

// Inicialize o Firebase
const app = initializeApp(firebaseConfig);

// Configure a autenticação com persistência
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Inicialize o Firestore
const db = getFirestore(app);

export { auth, db }; // Exporte ambos