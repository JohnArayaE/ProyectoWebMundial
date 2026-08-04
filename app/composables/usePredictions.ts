import { where } from "firebase/firestore"

import type { Match } from "./useMatches"
import type { Team } from "../types/team"

import type {
  ChampionPrediction,
  MatchPrediction,
  Prediction
} from "../types/prediction"

import { useFirestore } from "./useFirestore"

const PREDICTABLE_STATUSES = [
  "Programado",
  "En Vivo"
] as const

export function usePredictions() {
  const {
    getCollection,
    createDocument,
    updateDocument
  } = useFirestore()

  const matchPredictions = useState<
    MatchPrediction[]
  >(
    "match-predictions",
    () => []
  )

  const championPrediction = useState<
    ChampionPrediction | null
  >(
    "champion-prediction",
    () => null
  )

  const loadingPredictions = useState<boolean>(
    "predictions-loading",
    () => false
  )

  const savingPrediction = useState<boolean>(
    "prediction-saving",
    () => false
  )

  const predictionsError = useState<
    string | null
  >(
    "predictions-error",
    () => null
  )

  /**
   * Un partido permite predicciones solamente si está
   * Programado o En Vivo y ya tiene ambos equipos.
   */
  const isMatchPredictable = (
    match: Match
  ): boolean => {
    const hasValidStatus =
      PREDICTABLE_STATUSES.includes(
        match.status as (
          typeof PREDICTABLE_STATUSES
        )[number]
      )

    const hasBothTeams = Boolean(
      match.homeTeamId?.trim() &&
      match.awayTeamId?.trim() &&
      match.homeTeam?.trim() &&
      match.awayTeam?.trim()
    )

    return hasValidStatus && hasBothTeams
  }

  /**
   * Limpia los datos locales al cambiar o cerrar sesión.
   */
  const clearPredictions = (): void => {
    matchPredictions.value = []
    championPrediction.value = null
    predictionsError.value = null
  }

  /**
   * Carga únicamente las predicciones
   * del usuario actual.
   */
  const fetchPredictionsByUser = async (
    userId: string
  ): Promise<void> => {
    loadingPredictions.value = true
    predictionsError.value = null

    try {
      if (!userId.trim()) {
        throw new Error(
          "No hay un usuario autenticado."
        )
      }

      const result = await getCollection(
        "predictions",
        [
          where(
            "userId",
            "==",
            userId
          )
        ]
      ) as Prediction[]

      matchPredictions.value = result.filter(
        (
          prediction
        ): prediction is MatchPrediction => {
          return (
            prediction.predictionType === "match"
          )
        }
      )

      championPrediction.value =
        result.find(
          (
            prediction
          ): prediction is ChampionPrediction => {
            return (
              prediction.predictionType === "champion"
            )
          }
        ) ?? null
    } catch (caughtError) {
      console.error(
        "[usePredictions] fetchPredictionsByUser:",
        caughtError
      )

      matchPredictions.value = []
      championPrediction.value = null

      predictionsError.value =
        "No se pudieron cargar tus predicciones."
    } finally {
      loadingPredictions.value = false
    }
  }

  /**
   * Busca la predicción guardada
   * para un partido.
   */
  const getMatchPrediction = (
    matchId: string
  ): MatchPrediction | undefined => {
    return matchPredictions.value.find(
      prediction => {
        return prediction.matchId === matchId
      }
    )
  }

  /**
   * Valida que el marcador sea un número
   * entero entre 0 y 99.
   */
  const validateScore = (
    score: number
  ): void => {
    if (
      !Number.isInteger(score) ||
      score < 0 ||
      score > 99
    ) {
      throw new Error(
        "El marcador debe ser un número entero entre 0 y 99."
      )
    }
  }

  /**
   * Crea o actualiza la predicción de un partido.
   * No modifica el documento original del partido.
   */
  const saveMatchPrediction = async (
    userId: string,
    match: Match,
    homePrediction: number,
    awayPrediction: number
  ): Promise<MatchPrediction> => {
    savingPrediction.value = true
    predictionsError.value = null

    try {
      if (!userId.trim()) {
        throw new Error(
          "No hay un usuario autenticado."
        )
      }

      if (!isMatchPredictable(match)) {
        throw new Error(
          "Este partido no está disponible para predicciones."
        )
      }

      validateScore(homePrediction)
      validateScore(awayPrediction)

      const existingPrediction =
        getMatchPrediction(match.id)

      const updatedAt = new Date()

      const predictionData = {
        predictionType: "match" as const,
        userId,
        matchId: match.id,

        homeTeamId: match.homeTeamId,
        homeTeam: match.homeTeam,

        awayTeamId: match.awayTeamId,
        awayTeam: match.awayTeam,

        homePrediction,
        awayPrediction,
        updatedAt
      }

      const predictionId =
        existingPrediction?.id ??
        `match_${userId}_${match.id}`

      if (existingPrediction) {
        await updateDocument(
          "predictions",
          predictionId,
          predictionData
        )
      } else {
        await createDocument(
          "predictions",
          {
            ...predictionData,
            pointsEarned: 0
          },
          predictionId
        )
      }

      const savedPrediction: MatchPrediction = {
        ...existingPrediction,
        id: predictionId,
        ...predictionData,

        pointsEarned:
          existingPrediction?.pointsEarned ?? 0,

        createdAt:
          existingPrediction?.createdAt ??
          updatedAt
      }

      const predictionIndex =
        matchPredictions.value.findIndex(
          prediction => {
            return prediction.matchId === match.id
          }
        )

      if (predictionIndex >= 0) {
        matchPredictions.value =
          matchPredictions.value.map(
            (prediction, index) => {
              return index === predictionIndex
                ? savedPrediction
                : prediction
            }
          )
      } else {
        matchPredictions.value = [
          ...matchPredictions.value,
          savedPrediction
        ]
      }

      return savedPrediction
    } catch (caughtError) {
      console.error(
        "[usePredictions] saveMatchPrediction:",
        caughtError
      )

      predictionsError.value =
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudo guardar la predicción."

      throw caughtError
    } finally {
      savingPrediction.value = false
    }
  }

  /**
   * Crea o actualiza la selección
   * elegida como campeona.
   */
  const saveChampionPrediction = async (
    userId: string,
    team: Team
  ): Promise<ChampionPrediction> => {
    savingPrediction.value = true
    predictionsError.value = null

    try {
      if (!userId.trim()) {
        throw new Error(
          "No hay un usuario autenticado."
        )
      }

      const championTeamId = team.id?.trim()
      const championTeam = team.name?.trim()

      if (!championTeamId || !championTeam) {
        throw new Error(
          "Debes seleccionar una selección válida."
        )
      }

      const existingPrediction =
        championPrediction.value

      const updatedAt = new Date()

      const predictionData = {
        predictionType: "champion" as const,
        userId,
        championTeamId,
        championTeam,
        updatedAt
      }

      const predictionId =
        existingPrediction?.id ??
        `champion_${userId}`

      if (existingPrediction) {
        await updateDocument(
          "predictions",
          predictionId,
          predictionData
        )
      } else {
        await createDocument(
          "predictions",
          predictionData,
          predictionId
        )
      }

      const savedPrediction: ChampionPrediction = {
        id: predictionId,
        ...predictionData,

        createdAt:
          existingPrediction?.createdAt ??
          updatedAt
      }

      championPrediction.value = savedPrediction

      return savedPrediction
    } catch (caughtError) {
      console.error(
        "[usePredictions] saveChampionPrediction:",
        caughtError
      )

      predictionsError.value =
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudo guardar la selección campeona."

      throw caughtError
    } finally {
      savingPrediction.value = false
    }
  }

  return {
    matchPredictions,
    championPrediction,
    loadingPredictions,
    savingPrediction,
    predictionsError,

    isMatchPredictable,
    clearPredictions,
    fetchPredictionsByUser,
    getMatchPrediction,
    saveMatchPrediction,
    saveChampionPrediction
  }
}