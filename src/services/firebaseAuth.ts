import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  onAuthStateChanged,
  User,
  signOut,
  updateProfile
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.compose'
];

const provider = new GoogleAuthProvider();
SCOPES.forEach(scope => provider.addScope(scope));

// Session key for active browser tab Google OAuth token
const SESSION_TOKEN_KEY = 'cuidar_juntos_google_access_token';
let isSigningIn = false;
let cachedAccessToken: string | null = (() => {
  try {
    return sessionStorage.getItem(SESSION_TOKEN_KEY);
  } catch {
    return null;
  }
})();

export interface AppUserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  providerId: 'google.com' | 'password' | 'anonymous' | 'local';
  isAnonymous?: boolean;
}

const LOCAL_USER_KEY = 'cuidar_juntos_user_profile';

export const getLocalUserProfile = (): AppUserProfile | null => {
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveLocalUserProfile = (profile: AppUserProfile | null): void => {
  try {
    if (profile) {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(LOCAL_USER_KEY);
    }
  } catch (e) {
    console.error('Error saving local user profile', e);
  }
};

// Listeners for auth changes across components
type AuthListener = (profile: AppUserProfile | null, user: User | null, token: string | null) => void;
const authListeners: Set<AuthListener> = new Set();

export const subscribeToAuthChanges = (listener: AuthListener): (() => void) => {
  authListeners.add(listener);
  return () => {
    authListeners.delete(listener);
  };
};

const notifyAuthListeners = (profile: AppUserProfile | null, user: User | null, token: string | null) => {
  authListeners.forEach(listener => {
    try {
      listener(profile, user, token);
    } catch (err) {
      console.error('Error in auth listener:', err);
    }
  });
};

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      const profile: AppUserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'Cuidador',
        photoURL: user.photoURL,
        providerId: (user.providerData[0]?.providerId as any) || (user.isAnonymous ? 'anonymous' : 'password'),
        isAnonymous: user.isAnonymous
      };
      saveLocalUserProfile(profile);

      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
        notifyAuthListeners(profile, user, cachedAccessToken);
      } else if (!isSigningIn) {
        // If logged in via email or anonymous without Google OAuth access token
        notifyAuthListeners(profile, user, null);
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      const local = getLocalUserProfile();
      if (local && local.providerId === 'local') {
        notifyAuthListeners(local, null, null);
      } else {
        cachedAccessToken = null;
        saveLocalUserProfile(null);
        notifyAuthListeners(null, null, null);
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

/**
 * 1. Google Sign-In with OAuth scopes (Calendar & Gmail)
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string; profile: AppUserProfile } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Falha ao obter o token de acesso do Google.');
    }

    cachedAccessToken = credential.accessToken;
    try {
      sessionStorage.setItem(SESSION_TOKEN_KEY, credential.accessToken);
    } catch {
      // sessionStorage might be restricted in some privacy modes
    }
    const profile: AppUserProfile = {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName || 'Cuidador Conectado',
      photoURL: result.user.photoURL,
      providerId: 'google.com',
      isAnonymous: false
    };
    saveLocalUserProfile(profile);
    notifyAuthListeners(profile, result.user, cachedAccessToken);
    return { user: result.user, accessToken: cachedAccessToken, profile };
  } catch (error) {
    console.error('Google Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * 2. Email & Password Sign In
 */
export const emailSignIn = async (email: string, pass: string): Promise<AppUserProfile> => {
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    const profile: AppUserProfile = {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName || email.split('@')[0],
      photoURL: cred.user.photoURL,
      providerId: 'password',
      isAnonymous: false
    };
    saveLocalUserProfile(profile);
    notifyAuthListeners(profile, cred.user, null);
    return profile;
  } catch (err: any) {
    // If Firebase operation is not allowed or failed, provide fallback local login
    if (err?.code === 'auth/operation-not-allowed' || err?.code === 'auth/network-request-failed') {
      const profile: AppUserProfile = {
        uid: 'local-' + Date.now(),
        email: email.trim(),
        displayName: email.split('@')[0],
        photoURL: null,
        providerId: 'local',
        isAnonymous: false
      };
      saveLocalUserProfile(profile);
      notifyAuthListeners(profile, null, null);
      return profile;
    }
    throw err;
  }
};

/**
 * 3. Email & Password Registration
 */
export const emailSignUp = async (email: string, pass: string, name: string): Promise<AppUserProfile> => {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (name.trim()) {
      try {
        await updateProfile(cred.user, { displayName: name.trim() });
      } catch (e) {
        console.warn('Could not update display name:', e);
      }
    }
    const profile: AppUserProfile = {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: name.trim() || email.split('@')[0],
      photoURL: null,
      providerId: 'password',
      isAnonymous: false
    };
    saveLocalUserProfile(profile);
    notifyAuthListeners(profile, cred.user, null);
    return profile;
  } catch (err: any) {
    if (err?.code === 'auth/operation-not-allowed' || err?.code === 'auth/network-request-failed') {
      const profile: AppUserProfile = {
        uid: 'local-' + Date.now(),
        email: email.trim(),
        displayName: name.trim() || email.split('@')[0],
        photoURL: null,
        providerId: 'local',
        isAnonymous: false
      };
      saveLocalUserProfile(profile);
      notifyAuthListeners(profile, null, null);
      return profile;
    }
    throw err;
  }
};

/**
 * 4. Guest / Anonymous Mode (Continuar como Convidado)
 */
export const guestSignIn = async (guestName?: string): Promise<AppUserProfile> => {
  try {
    const cred = await signInAnonymously(auth);
    const profile: AppUserProfile = {
      uid: cred.user.uid,
      email: null,
      displayName: guestName?.trim() || 'Cuidador Visitante',
      photoURL: null,
      providerId: 'anonymous',
      isAnonymous: true
    };
    saveLocalUserProfile(profile);
    notifyAuthListeners(profile, cred.user, null);
    return profile;
  } catch {
    // Local fallback
    const profile: AppUserProfile = {
      uid: 'guest-' + Date.now(),
      email: null,
      displayName: guestName?.trim() || 'Cuidador Visitante',
      photoURL: null,
      providerId: 'local',
      isAnonymous: true
    };
    saveLocalUserProfile(profile);
    notifyAuthListeners(profile, null, null);
    return profile;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Sign out warning:', e);
  }
  cachedAccessToken = null;
  try {
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
  } catch {}
  saveLocalUserProfile(null);
  notifyAuthListeners(null, null, null);
};
