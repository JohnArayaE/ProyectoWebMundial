import {
  collection,
  doc,
  getDocs,
  increment,
  query,
  runTransaction,
  serverTimestamp,
  where
} from "firebase/firestore"

import type { Match } from "./useMatches"
import type { MatchPrediction } from "../types/prediction"

import { useFirestore } from "./useFirestore"

export const EXACT_SCORE_POINTS = 3
export const CORRECT_OUTCOME_POINTS = 1

type MatchOutcome =
  | "home"
  | "draw"
  | "away"

export type PredictionScoringSummary = {
  processedPredictions: number
  exactScores: number
  correctOutcomes: number
  pointsDifference: number
}

/**
 * Determina si ganó el local, el visitante
 * o si el partido terminó empatado.
 */
const getMatchOutcome = (
  homeScore: number,
  awayScore: number
): MatchOutcome => {
  if (homeScore > awayScore) {
    return "home"
  }

  if (awayScore > homeScore) {
    return "away"
  }

  return "draw"
}

/**
 * Convierte un puntaje guardado en un número seguro.
 *
 * Las predicciones antiguas pueden no tener todavía
 * la propiedad pointsEarned.
 */
const getStoredPoints = (
  value: unknown
): number => {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  )
    ? value
    : 0
}

/**
 * Calcula los puntos obtenidos por una predicción.
 *
 * Marcador exacto: 3 puntos.
 * Ganador o empate correcto: 1 punto.
 * Predicción incorrecta: 0 puntos.
 */
const calculatePredictionPoints = (
  prediction: MatchPrediction,
  match: Match
): {
  points: number
  isExactScore: boolean
  isCorrectOutcome: boolean
} => {
  const hasCurrentTeams =
    prediction.homeTeamId === match.homeTeamId &&
    prediction.awayTeamId === match.awayTeamId

  /*
   * Si el partido no está finalizado o cambiaron
   * sus selecciones, no se otorgan puntos.
   */
  if (
    match.status !== "Finalizado" ||
    !hasCurrentTeams
  ) {
    return {
      points: 0,
      isExactScore: false,
      isCorrectOutcome: false
    }
  }

  const isExactScore =
    prediction.homePrediction ===
      match.homeScore &&
    prediction.awayPrediction ===
      match.awayScore

  if (isExactScore) {
    return {
      points: EXACT_SCORE_POINTS,
      isExactScore: true,
      isCorrectOutcome: true
    }
  }

  const predictedOutcome = getMatchOutcome(
    prediction.homePrediction,
    prediction.awayPrediction
  )

  const realOutcome = getMatchOutcome(
    match.homeScore,
    match.awayScore
  )

  const isCorrectOutcome =
    predictedOutcome === realOutcome

  return {
    points: isCorrectOutcome
      ? CORRECT_OUTCOME_POINTS
      : 0,

    isExactScore: false,
    isCorrectOutcome
  }
}

export function usePredictionScoring() {
  const {
    firestore
  } = useFirestore()

  /**
   * Evalúa todas las predicciones relacionadas
   * con un partido.
   *
   * No modifica el documento del partido.
   * Solamente actualiza:
   *
   * predictions.pointsEarned
   * users.points
   */
  const evaluateMatchPredictions = async (
    match: Match
  ): Promise<PredictionScoringSummary> => {
    if (!firestore) {
      throw new Error(
        "Firestore no está disponible para calcular los puntos."
      )
    }

    const predictionsQuery = query(
      collection(
        firestore,
        "predictions"
      ),
      where(
        "matchId",
        "==",
        match.id
      )
    )

    const predictionsSnapshot = await getDocs(
      predictionsQuery
    )

    const summary: PredictionScoringSummary = {
      processedPredictions: 0,
      exactScores: 0,
      correctOutcomes: 0,
      pointsDifference: 0
    }

    for (
      const predictionDocument of
        predictionsSnapshot.docs
    ) {
      const transactionResult =
        await runTransaction(
          firestore,

          async transaction => {
            const latestPredictionSnapshot =
              await transaction.get(
                predictionDocument.ref
              )

            if (
              !latestPredictionSnapshot.exists()
            ) {
              return null
            }

            const prediction = {
              id: latestPredictionSnapshot.id,
              ...latestPredictionSnapshot.data()
            } as MatchPrediction

            if (
              prediction.predictionType !== "match" ||
              !prediction.userId?.trim()
            ) {
              return null
            }

            const userReference = doc(
              firestore,
              "users",
              prediction.userId
            )

            const userSnapshot =
              await transaction.get(
                userReference
              )

            if (!userSnapshot.exists()) {
              throw new Error(
                `No existe el usuario de la predicción ${prediction.id}.`
              )
            }

            const previousPoints =
              getStoredPoints(
                prediction.pointsEarned
              )

            const evaluation =
              calculatePredictionPoints(
                prediction,
                match
              )

            /*
             * Solo se aplica la diferencia.
             *
             * Esto evita duplicar puntos si el administrador
             * guarda el mismo resultado varias veces.
             */
            const pointsDifference =
              evaluation.points -
              previousPoints

            transaction.update(
              latestPredictionSnapshot.ref,
              {
                pointsEarned:
                  evaluation.points,

                isExactScore:
                  evaluation.isExactScore,

                isCorrectOutcome:
                  evaluation.isCorrectOutcome,

                evaluatedHomeScore:
                  match.status === "Finalizado"
                    ? match.homeScore
                    : null,

                evaluatedAwayScore:
                  match.status === "Finalizado"
                    ? match.awayScore
                    : null,

                evaluatedAt:
                  serverTimestamp()
              }
            )

            if (pointsDifference !== 0) {
              transaction.update(
                userReference,
                {
                  points: increment(
                    pointsDifference
                  ),

                  updatedAt:
                    serverTimestamp()
                }
              )
            }

            return {
              ...evaluation,
              pointsDifference
            }
          }
        )

      if (!transactionResult) {
        continue
      }

      summary.processedPredictions += 1

      summary.pointsDifference +=
        transactionResult.pointsDifference

      if (transactionResult.isExactScore) {
        summary.exactScores += 1
      } else if (
        transactionResult.isCorrectOutcome
      ) {
        summary.correctOutcomes += 1
      }
    }

    return summary
  }

  return {
    evaluateMatchPredictions
  }
}