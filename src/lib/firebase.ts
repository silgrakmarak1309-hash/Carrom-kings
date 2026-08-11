import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserAccount } from '../types';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Get Auth instance
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Get Firestore instance using databaseId if provided
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

/**
 * Sync user profile and stats with Firestore
 */
export async function syncUserDataToFirestore(userAcc: UserAccount): Promise<void> {
  if (!userAcc.id) return;
  try {
    const userRef = doc(db, 'users', userAcc.id);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        email: userAcc.email,
        displayName: userAcc.displayName,
        photoURL: userAcc.photoURL || null,
        provider: userAcc.provider,
        coins: userAcc.coins,
        matchesPlayed: userAcc.matchesPlayed,
        matchesWon: userAcc.matchesWon,
        puzzleLevel: userAcc.puzzleLevel,
        createdAt: userAcc.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else {
      const data = snap.data();
      // Update with latest stats
      await updateDoc(userRef, {
        coins: userAcc.coins ?? data.coins,
        matchesPlayed: userAcc.matchesPlayed ?? data.matchesPlayed,
        matchesWon: userAcc.matchesWon ?? data.matchesWon,
        puzzleLevel: userAcc.puzzleLevel ?? data.puzzleLevel,
        displayName: userAcc.displayName || data.displayName,
        photoURL: userAcc.photoURL || data.photoURL,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error('Firestore sync error:', err);
  }
}

/**
 * Fetch user stats from Firestore
 */
export async function getUserDataFromFirestore(userId: string): Promise<Partial<UserAccount> | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as Partial<UserAccount>;
    }
  } catch (err) {
    console.error('Firestore fetch error:', err);
  }
  return null;
}

/**
 * Google Popup Sign-In
 */
export async function signInWithGoogleFirebase(): Promise<UserAccount> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  
  const existingCloudData = await getUserDataFromFirestore(user.uid);

  const account: UserAccount = {
    id: user.uid,
    email: user.email || 'google_user@example.com',
    displayName: user.displayName || user.email?.split('@')[0] || 'Carrom Player',
    photoURL: user.photoURL || null,
    provider: 'google',
    coins: existingCloudData?.coins ?? 500,
    matchesPlayed: existingCloudData?.matchesPlayed ?? 0,
    matchesWon: existingCloudData?.matchesWon ?? 0,
    puzzleLevel: existingCloudData?.puzzleLevel ?? 1,
    createdAt: new Date().toISOString(),
  };

  await syncUserDataToFirestore(account);
  return account;
}

/**
 * Email/Password Sign-In or Sign-Up
 */
export async function signInWithEmailFirebase(
  emailStr: string,
  passStr: string,
  isSignUp: boolean,
  displayNameStr?: string,
  initialCoins = 500
): Promise<UserAccount> {
  let user: FirebaseUser;

  if (isSignUp) {
    const cred = await createUserWithEmailAndPassword(auth, emailStr, passStr);
    user = cred.user;
    if (displayNameStr) {
      await updateProfile(user, { displayName: displayNameStr });
    }
  } else {
    const cred = await signInWithEmailAndPassword(auth, emailStr, passStr);
    user = cred.user;
  }

  const existingCloudData = await getUserDataFromFirestore(user.uid);

  const account: UserAccount = {
    id: user.uid,
    email: user.email || emailStr,
    displayName: displayNameStr || user.displayName || emailStr.split('@')[0],
    photoURL: user.photoURL || null,
    provider: 'email',
    coins: existingCloudData?.coins ?? initialCoins,
    matchesPlayed: existingCloudData?.matchesPlayed ?? 0,
    matchesWon: existingCloudData?.matchesWon ?? 0,
    puzzleLevel: existingCloudData?.puzzleLevel ?? 1,
    createdAt: new Date().toISOString(),
  };

  await syncUserDataToFirestore(account);
  return account;
}

/**
 * Sign Out
 */
export async function signOutFirebase(): Promise<void> {
  await firebaseSignOut(auth);
}
