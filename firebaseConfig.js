import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getAuth, getReactNativePersistence, browserLocalPersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyB-2wbN-hnYRPY2qoED05666h--k5IcipY",
  authDomain: "potholeapi.firebaseapp.com",
  projectId: "potholeapi",
  storageBucket: "potholeapi.firebasestorage.app",
  messagingSenderId: "753581199147",
  appId: "1:753581199147:web:fd87bef65bd7741a5b7f6e",
  measurementId: "G-N1ZKXL8TV3"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

let authPersistence;
if (Platform.OS === 'web') {
  // Use localStorage for web
  authPersistence = browserLocalPersistence;
} else {
  // Use AsyncStorage for React Native
  authPersistence = getReactNativePersistence(ReactNativeAsyncStorage);
}

const auth = initializeAuth(app, {
  persistence: authPersistence,
});

export { db, auth };
