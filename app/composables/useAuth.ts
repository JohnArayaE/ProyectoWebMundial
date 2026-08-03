import { ref } from "vue"
import { useRouter } from "vue-router"
import type { User } from "firebase/auth"

import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth"

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "firebase/firestore"

import { auth, googleProvider, db } from "../../auth/auth"

type AuthUser = {
  uid: string
  name: string
  email: string
  favoriteTeam: string
  points: number
  createdAt?: unknown
  updatedAt?: unknown
}

const currentUser = ref<AuthUser | null>(null)
const loadingAuth = ref(false)
const errorAuth = ref<string | null>(null)

let authInitialized = false

/**
 * Convierte los datos guardados en Firestore
 * al formato utilizado por la aplicación.
 */
const mapFirestoreUser = (
  data: Record<string, unknown>
): AuthUser => {
  return {
    uid: typeof data.uid === "string" ? data.uid : "",
    name: typeof data.name === "string" ? data.name : "",
    email: typeof data.email === "string" ? data.email : "",
    favoriteTeam:
      typeof data.favoriteTeam === "string"
        ? data.favoriteTeam
        : "",
    points:
      typeof data.points === "number"
        ? data.points
        : 0,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  }
}

/**
 * Obtiene un mensaje seguro a partir de un error desconocido.
 */
const getErrorMessage = (
  error: unknown,
  defaultMessage: string
): string => {
  if (error instanceof Error) {
    return error.message
  }

  return defaultMessage
}

export const useAuth = () => {
  const router = useRouter()

  /**
   * Busca el perfil del usuario en Firestore.
   *
   * Si no existe, lo crea automáticamente.
   * Si ya existe, carga los datos guardados anteriormente.
   */
  const loadOrCreateUserProfile = async (
    user: User
  ): Promise<void> => {
    const userReference = doc(db, "users", user.uid)
    const userSnapshot = await getDoc(userReference)

    if (!userSnapshot.exists()) {
      await setDoc(userReference, {
        uid: user.uid,
        name: user.displayName ?? "",
        email: user.email ?? "",
        favoriteTeam: "",
        points: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    }

    const updatedSnapshot = await getDoc(userReference)

    if (updatedSnapshot.exists()) {
      currentUser.value = mapFirestoreUser(
        updatedSnapshot.data()
      )
    }
  }

  /**
   * Revisa si existe una sesión iniciada cuando
   * la aplicación abre o se recarga.
   */
  const initAuth = (): void => {
    if (!import.meta.client || authInitialized) {
      return
    }

    authInitialized = true
    loadingAuth.value = true
    errorAuth.value = null

    onAuthStateChanged(
      auth,

      async (user) => {
        try {
          if (user) {
            await loadOrCreateUserProfile(user)
          } else {
            currentUser.value = null
          }
        } catch (error: unknown) {
          console.error(error)

          errorAuth.value = getErrorMessage(
            error,
            "Error al validar la sesión"
          )
        } finally {
          loadingAuth.value = false
        }
      },

      (error) => {
        console.error(error)

        errorAuth.value = getErrorMessage(
          error,
          "Error al validar la sesión"
        )

        loadingAuth.value = false
      }
    )
  }

  /**
   * Inicia sesión utilizando Google.
   */
  const login = async (): Promise<void> => {
    try {
      loadingAuth.value = true
      errorAuth.value = null

      await setPersistence(
        auth,
        browserLocalPersistence
      )

      const result = await signInWithPopup(
        auth,
        googleProvider
      )

      await loadOrCreateUserProfile(result.user)

      await router.push("/")
    } catch (error: unknown) {
      console.error(error)

      errorAuth.value = getErrorMessage(
        error,
        "No se pudo iniciar sesión con Google"
      )
    } finally {
      loadingAuth.value = false
    }
  }

  /**
   * Cierra la sesión actual.
   */
  const logout = async (): Promise<void> => {
    try {
      loadingAuth.value = true
      errorAuth.value = null

      await signOut(auth)

      currentUser.value = null

      await router.push("/login")
    } catch (error: unknown) {
      console.error(error)

      errorAuth.value = getErrorMessage(
        error,
        "No se pudo cerrar sesión"
      )
    } finally {
      loadingAuth.value = false
    }
  }

  return {
    currentUser,
    loadingAuth,
    errorAuth,
    initAuth,
    login,
    logout
  }
}