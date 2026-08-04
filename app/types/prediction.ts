export type PredictionType =
  | "match"
  | "champion"

export interface MatchPrediction {
  id: string
  predictionType: "match"
  userId: string
  matchId: string

  homeTeamId: string
  homeTeam: string
  awayTeamId: string
  awayTeam: string

  homePrediction: number
  awayPrediction: number

  pointsEarned?: number

  createdAt?: unknown
  updatedAt?: unknown
}

export interface ChampionPrediction {
  id: string
  predictionType: "champion"
  userId: string
  championTeamId: string
  championTeam: string

  createdAt?: unknown
  updatedAt?: unknown
}

export type Prediction =
  | MatchPrediction
  | ChampionPrediction