import { ref } from "vue"

import {
  arrayRemove,
  arrayUnion,
  doc,
  serverTimestamp,
  updateDoc
} from "firebase/firestore"

import { db } from "../../auth/auth"

const loadingFavorites = ref(false)
const errorFavorites = ref<string | null>(null)

const getErrorMessage = (
  error: unknown,
  defaultMessage: string
): string => {
  if (error instanceof Error) {
    return error.message
  }

  return defaultMessage
}

export const useFavorites = () => {
  const { currentUser } = useAuth()

  /**
   * Comprueba si un partido ya está guardado
   * en los favoritos del usuario.
   */
  const isMatchFavorite = (
    matchId: string
  ): boolean => {
    return (
      currentUser.value?.favoriteMatches.includes(
        matchId
      ) ?? false
    )
  }

  /**
   * Agrega un partido al arreglo favoriteMatches.
   */
  const addMatchToFavorites = async (
    matchId: string
  ): Promise<boolean> => {
    if (!currentUser.value) {
      errorFavorites.value =
        "Debes iniciar sesión para guardar favoritos"

      return false
    }

    try {
      loadingFavorites.value = true
      errorFavorites.value = null

      const userReference = doc(
        db,
        "users",
        currentUser.value.uid
      )

      await updateDoc(userReference, {
        favoriteMatches: arrayUnion(matchId),
        updatedAt: serverTimestamp()
      })

      if (
        !currentUser.value.favoriteMatches.includes(
          matchId
        )
      ) {
        currentUser.value = {
          ...currentUser.value,

          favoriteMatches: [
            ...currentUser.value.favoriteMatches,
            matchId
          ]
        }
      }

      return true
    } catch (error: unknown) {
      console.error(error)

      errorFavorites.value = getErrorMessage(
        error,
        "No se pudo agregar el partido a favoritos"
      )

      return false
    } finally {
      loadingFavorites.value = false
    }
  }

  /**
   * Elimina un partido del arreglo favoriteMatches.
   */
  const removeMatchFromFavorites = async (
    matchId: string
  ): Promise<boolean> => {
    if (!currentUser.value) {
      errorFavorites.value =
        "Debes iniciar sesión para modificar favoritos"

      return false
    }

    try {
      loadingFavorites.value = true
      errorFavorites.value = null

      const userReference = doc(
        db,
        "users",
        currentUser.value.uid
      )

      await updateDoc(userReference, {
        favoriteMatches: arrayRemove(matchId),
        updatedAt: serverTimestamp()
      })

      currentUser.value = {
        ...currentUser.value,

        favoriteMatches:
          currentUser.value.favoriteMatches.filter(
            (favoriteMatchId) =>
              favoriteMatchId !== matchId
          )
      }

      return true
    } catch (error: unknown) {
      console.error(error)

      errorFavorites.value = getErrorMessage(
        error,
        "No se pudo quitar el partido de favoritos"
      )

      return false
    } finally {
      loadingFavorites.value = false
    }
  }

  /**
   * Agrega o elimina el partido dependiendo
   * de su estado actual.
   */
  const toggleMatchFavorite = async (
    matchId: string
  ): Promise<boolean> => {
    if (isMatchFavorite(matchId)) {
      return await removeMatchFromFavorites(
        matchId
      )
    }

    return await addMatchToFavorites(matchId)
  }

  return {
    loadingFavorites,
    errorFavorites,
    isMatchFavorite,
    addMatchToFavorites,
    removeMatchFromFavorites,
    toggleMatchFavorite
  }
}