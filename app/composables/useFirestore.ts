import {
  initializeApp,
  getApp,
  getApps,
  type FirebaseApp
} from 'firebase/app'

import {
  getAuth,
  type Auth
} from 'firebase/auth'

import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  type Firestore,
  type QueryConstraint
} from 'firebase/firestore'

import { firebaseConfig } from '../../auth/auth'

let firebaseApp: FirebaseApp | null = null

function getFirebaseApp(): FirebaseApp | null {
  if (!import.meta.client) {
    return null
  }

  if (!firebaseApp) {
    firebaseApp = getApps().length
      ? getApp()
      : initializeApp(firebaseConfig)
  }

  return firebaseApp
}

export function useFirestore() {
  const app = getFirebaseApp()

  const auth: Auth | null = app
    ? getAuth(app)
    : null

  const firestore: Firestore | null = app
    ? getFirestore(app)
    : null

  async function getCollection(
    name: string,
    constraints: QueryConstraint[] = []
  ) {
    if (!firestore) {
      throw new Error('Firestore no disponible')
    }

    const collectionReference = collection(firestore, name)
    const collectionQuery = query(collectionReference, ...constraints)
    const snapshot = await getDocs(collectionQuery)

    return snapshot.docs.map(documentSnapshot => ({
      id: documentSnapshot.id,
      ...documentSnapshot.data()
    }))
  }

  async function getDocument(name: string, id: string) {
    if (!firestore) {
      throw new Error('Firestore no disponible')
    }

    const documentReference = doc(firestore, name, id)
    const snapshot = await getDoc(documentReference)

    if (!snapshot.exists()) {
      return null
    }

    return {
      id: snapshot.id,
      ...snapshot.data()
    }
  }

  async function createDocument(
    name: string,
    data: Record<string, any>,
    customId?: string
  ) {
    if (!firestore) {
      throw new Error('Firestore no disponible')
    }

    const documentData = {
      ...data,
      createdAt: new Date()
    }

    if (customId) {
      const documentReference = doc(firestore, name, customId)

      await setDoc(documentReference, documentData)

      return {
        id: customId,
        ...data
      }
    }

    const collectionReference = collection(firestore, name)
    const documentReference = await addDoc(
      collectionReference,
      documentData
    )

    return {
      id: documentReference.id,
      ...data
    }
  }

  async function updateDocument(
    name: string,
    id: string,
    data: Record<string, any>
  ) {
    if (!firestore) {
      throw new Error('Firestore no disponible')
    }

    const documentReference = doc(firestore, name, id)

    await updateDoc(documentReference, data)

    return {
      id,
      ...data
    }
  }

  async function deleteDocument(name: string, id: string) {
    if (!firestore) {
      throw new Error('Firestore no disponible')
    }

    const documentReference = doc(firestore, name, id)

    await deleteDoc(documentReference)

    return id
  }

  return {
    app,
    auth,
    firestore,
    getCollection,
    getDocument,
    createDocument,
    updateDocument,
    deleteDocument
  }
}