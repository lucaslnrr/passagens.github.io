import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { getDatabase } from 'firebase/database'; 
// Import the Realtime Database module

const firebaseConfig = JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG);

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export function attachAuthListener(handler) {
  return onAuthStateChanged(auth, user => {
    handler(user);
  });
}


export async function signIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Optionally, return userCredential.user or perform other actions upon success
    return userCredential;
  } catch (error) {
    // Handle error
    console.error('Error signing in:', error);
    throw error;
  }
}

// Sign out current user
export async function signOut() {
  try {
    await firebaseSignOut(auth); // Use firebaseSignOut instead of signOut
    // Optionally, perform other actions upon successful sign out
  } catch (error) {
    // Handle error
    console.error('Error signing out:', error);
    throw error;
  }
}

// Export the initialize function
export function initialize() {
  
}
export { db };