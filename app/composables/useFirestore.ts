import { collection, doc, getDoc, getDocs, query, addDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { useFirebase } from '~/composables/useFirebase'

export function useFirestore() {
  const { firestore } = useFirebase()

  const getCollection = async (name: string, constraints: any[] = []) => {
    if (!firestore) return []
    const collectionRef = collection(firestore, name)
    const q = query(collectionRef, ...constraints)
    const snapshot = await getDocs(q)
    return snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }))
  }

  const getDocument = async (name: string, id: string) => {
    if (!firestore) return null
    const documentRef = doc(firestore, name, id)
    const snapshot = await getDoc(documentRef)
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
  }

  const createDocument = async (name: string, data: any, customId?: string) => {
    if (!firestore) throw new Error('Firestore no disponible')
    if (customId) {
      const documentRef = doc(firestore, name, customId)
      await setDoc(documentRef, { ...data, createdAt: new Date() })
      return { id: customId, ...data }
    } else {
      const collectionRef = collection(firestore, name)
      const docRef = await addDoc(collectionRef, { ...data, createdAt: new Date() })
      return { id: docRef.id, ...data }
    }
  }

  const updateDocument = async (name: string, id: string, data: any) => {
    if (!firestore) throw new Error('Firestore no disponible')
    const documentRef = doc(firestore, name, id)
    await updateDoc(documentRef, data)
    return { id, ...data }
  }

  const deleteDocument = async (name: string, id: string) => {
    if (!firestore) throw new Error('Firestore no disponible')
    const documentRef = doc(firestore, name, id)
    await deleteDoc(documentRef)
    return id
  }

  return {
    getCollection,
    getDocument,
    createDocument,
    updateDocument,
    deleteDocument
  }
}