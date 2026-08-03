import { initializeApp, getApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { firebaseConfig } from '~/auth/auth'

let firebaseApp = null

function getFirebaseApp() {
  if (!process.client) {
    return null
  }

  if (!firebaseApp) {
    firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig)
  }

  return firebaseApp
}

export function useFirebase() {
  const app = getFirebaseApp()
  return {
    app,
    auth: app ? getAuth(app) : null,
    firestore: app ? getFirestore(app) : null
  }
}