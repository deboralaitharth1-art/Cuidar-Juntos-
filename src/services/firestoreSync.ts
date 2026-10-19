import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  getDocFromServer,
  writeBatch
} from 'firebase/firestore';
import { app, auth } from './firebaseAuth';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  PatientData,
  PatientProfile,
  UbsData,
  MedicationItem,
  HealthLogItem,
  MedicalAppointment
} from '../types';

// CRITICAL: Initialize Firestore using the configured database ID
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on startup as mandated by Firestore guidelines
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export interface CompleteUserData {
  patient: PatientData;
  patientList?: PatientProfile[];
  activePatientId?: string;
  ubs: UbsData;
  medications: MedicationItem[];
  healthLogs: HealthLogItem[];
  appointments: MedicalAppointment[];
}

/**
 * Save user data to Firestore under /users/{userId} and subcollections
 */
export async function saveUserDataToFirestore(
  userId: string,
  data: Partial<CompleteUserData>
): Promise<void> {
  if (!userId) return;

  const userDocRef = doc(db, 'users', userId);
  const now = new Date().toISOString();

  try {
    // 1. Save or update main user doc with patient and UBS
    const userPayload: Record<string, any> = {
      userId,
      email: auth.currentUser?.email || null,
      displayName: auth.currentUser?.displayName || null,
      updatedAt: now
    };

    if (data.patient) userPayload.patient = data.patient;
    if (data.patientList) userPayload.patientList = data.patientList;
    if (data.activePatientId) userPayload.activePatientId = data.activePatientId;
    if (data.ubs) userPayload.ubs = data.ubs;
    if (data.medications !== undefined) userPayload.medications = data.medications;
    if (data.healthLogs !== undefined) userPayload.healthLogs = data.healthLogs;
    if (data.appointments !== undefined) userPayload.appointments = data.appointments;

    await setDoc(userDocRef, userPayload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${userId}`);
  }

  // 2. Synchronize medications subcollection if provided
  if (data.medications && data.medications.length > 0) {
    try {
      const batch = writeBatch(db);
      for (const med of data.medications) {
        if (!med.id) continue;
        const medRef = doc(db, 'users', userId, 'medications', med.id);
        batch.set(medRef, {
          ...med,
          userId,
          updatedAt: now
        }, { merge: true });
      }
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${userId}/medications`);
    }
  }

  // 3. Synchronize health logs subcollection if provided
  if (data.healthLogs && data.healthLogs.length > 0) {
    try {
      const batch = writeBatch(db);
      for (const log of data.healthLogs) {
        if (!log.id) continue;
        const logRef = doc(db, 'users', userId, 'healthLogs', log.id);
        batch.set(logRef, {
          ...log,
          userId,
          updatedAt: now
        }, { merge: true });
      }
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${userId}/healthLogs`);
    }
  }

  // 4. Synchronize appointments subcollection if provided
  if (data.appointments && data.appointments.length > 0) {
    try {
      const batch = writeBatch(db);
      for (const app of data.appointments) {
        if (!app.id) continue;
        const appRef = doc(db, 'users', userId, 'appointments', app.id);
        batch.set(appRef, {
          ...app,
          userId,
          updatedAt: now
        }, { merge: true });
      }
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${userId}/appointments`);
    }
  }
}

/**
 * Load user data from Firestore when user logs in with Google
 */
export async function loadUserDataFromFirestore(
  userId: string
): Promise<Partial<CompleteUserData> | null> {
  if (!userId) return null;

  try {
    const userDocRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      return null;
    }

    const userData = userSnap.data();
    const result: Partial<CompleteUserData> = {};

    if (userData.patient) {
      result.patient = userData.patient as PatientData;
    }
    if (Array.isArray(userData.patientList) && userData.patientList.length > 0) {
      result.patientList = userData.patientList as PatientProfile[];
    }
    if (userData.activePatientId) {
      result.activePatientId = userData.activePatientId as string;
    }
    if (userData.ubs) {
      result.ubs = userData.ubs as UbsData;
    }

    // 1. Direct arrays on user document (primary source of truth)
    if (Array.isArray(userData.medications) && userData.medications.length > 0) {
      result.medications = userData.medications as MedicationItem[];
    } else {
      // Fallback: Load medications subcollection
      try {
        const medsRef = collection(db, 'users', userId, 'medications');
        const medsSnap = await getDocs(medsRef);
        if (!medsSnap.empty) {
          result.medications = medsSnap.docs.map(d => d.data() as MedicationItem);
        }
      } catch (e) {
        console.warn('Could not load medications from Firestore subcollection:', e);
      }
    }

    // 2. Direct health logs array
    if (Array.isArray(userData.healthLogs) && userData.healthLogs.length > 0) {
      result.healthLogs = userData.healthLogs as HealthLogItem[];
    } else {
      // Fallback: Load health logs subcollection
      try {
        const logsRef = collection(db, 'users', userId, 'healthLogs');
        const logsSnap = await getDocs(logsRef);
        if (!logsSnap.empty) {
          result.healthLogs = logsSnap.docs.map(d => d.data() as HealthLogItem);
        }
      } catch (e) {
        console.warn('Could not load health logs from Firestore subcollection:', e);
      }
    }

    // 3. Direct appointments array
    if (Array.isArray(userData.appointments) && userData.appointments.length > 0) {
      result.appointments = userData.appointments as MedicalAppointment[];
    } else {
      // Fallback: Load appointments subcollection
      try {
        const appsRef = collection(db, 'users', userId, 'appointments');
        const appsSnap = await getDocs(appsRef);
        if (!appsSnap.empty) {
          result.appointments = appsSnap.docs.map(d => d.data() as MedicalAppointment);
        }
      } catch (e) {
        console.warn('Could not load appointments from Firestore subcollection:', e);
      }
    }

    return result;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${userId}`);
    return null;
  }
}
