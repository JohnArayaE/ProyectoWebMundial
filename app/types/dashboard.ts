export interface DashboardTopUser {
  userId: string
  name: string
  points: number
}

export interface DashboardStats {
  matchesPlayed: number
  matchesPending: number
  totalGoals: number
  qualifiedTeams: number
  totalPredictions: number
  topUser: DashboardTopUser | null
}