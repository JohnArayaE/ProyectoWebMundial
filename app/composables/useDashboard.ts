import type {
  DashboardStats,
  DashboardTopUser
} from "../types/dashboard"

import type {
  Match
} from "./useMatches"

import {
  WORLD_CUP_GROUPS,
  useStandings,
  type Standing
} from "./useStandings"

type DashboardUserDocument = {
  id: string
  uid?: unknown
  name?: unknown
  email?: unknown
  points?: unknown
}

type DashboardPredictionDocument = {
  id: string
}

const createEmptyStats = (): DashboardStats => {
  return {
    matchesPlayed: 0,
    matchesPending: 0,
    totalGoals: 0,
    qualifiedTeams: 0,
    totalPredictions: 0,
    topUser: null
  }
}

export function useDashboard() {
  const {
    getCollection
  } = useFirestore()

  const {
    getQualificationSummary
  } = useStandings()

  const stats = useState<DashboardStats>(
    "dashboard-stats",
    createEmptyStats
  )

  const loading = useState<boolean>(
    "dashboard-loading",
    () => false
  )

  const error = useState<string | null>(
    "dashboard-error",
    () => null
  )

  const hasData = useState<boolean>(
    "dashboard-has-data",
    () => false
  )

  const lastUpdated = useState<string | null>(
    "dashboard-last-updated",
    () => null
  )

  function getSafeNumber(
    value: unknown
  ): number {
    const parsedValue = Number(value)

    if (!Number.isFinite(parsedValue)) {
      return 0
    }

    return Math.max(0, parsedValue)
  }

  function getUserName(
    user: DashboardUserDocument
  ): string {
    if (
      typeof user.name === "string" &&
      user.name.trim()
    ) {
      return user.name.trim()
    }

    if (
      typeof user.email === "string" &&
      user.email.trim()
    ) {
      return user.email.trim()
    }

    return "Usuario sin nombre"
  }

  function getTopUser(
    users: DashboardUserDocument[]
  ): DashboardTopUser | null {
    if (users.length === 0) {
      return null
    }

    const sortedUsers = users
      .map(user => {
        return {
          userId:
            typeof user.uid === "string" &&
            user.uid.trim()
              ? user.uid
              : user.id,

          name: getUserName(user),
          points: getSafeNumber(user.points)
        }
      })
      .sort((firstUser, secondUser) => {
        const pointsDifference =
          secondUser.points - firstUser.points

        if (pointsDifference !== 0) {
          return pointsDifference
        }

        return firstUser.name.localeCompare(
          secondUser.name,
          "es"
        )
      })

    return sortedUsers[0] ?? null
  }

  function getTotalGoals(
    matches: Match[]
  ): number {
    return matches
      .filter(match => {
        return (
          match.status === "Finalizado" ||
          match.status === "En Vivo"
        )
      })
      .reduce((total, match) => {
        return (
          total +
          getSafeNumber(match.homeScore) +
          getSafeNumber(match.awayScore)
        )
      }, 0)
  }

  function getQualifiedTeamsCount(
    standings: Standing[]
  ): number {
    const qualificationSummary =
      getQualificationSummary(standings)

    const directQualifiers =
      qualificationSummary.completedGroups * 2

    const bestThirdPlaces =
      qualificationSummary.completedGroups ===
      WORLD_CUP_GROUPS.length
        ? 8
        : 0

    return directQualifiers + bestThirdPlaces
  }

  async function fetchDashboard():
    Promise<DashboardStats | null> {
    loading.value = true
    error.value = null

    try {
      const [
        matches,
        standings,
        users,
        predictions
      ] = await Promise.all([
        getCollection("matches") as Promise<Match[]>,

        getCollection("standings") as Promise<Standing[]>,

        getCollection("users") as Promise<
          DashboardUserDocument[]
        >,

        getCollection("predictions") as Promise<
          DashboardPredictionDocument[]
        >
      ])

      stats.value = {
        matchesPlayed:
          matches.filter(match => {
            return match.status === "Finalizado"
          }).length,

        matchesPending:
          matches.filter(match => {
            return match.status === "Programado"
          }).length,

        totalGoals: getTotalGoals(matches),

        qualifiedTeams:
          getQualifiedTeamsCount(standings),

        totalPredictions: predictions.length,

        topUser: getTopUser(users)
      }

      hasData.value =
        matches.length > 0 ||
        standings.length > 0 ||
        predictions.length > 0

      lastUpdated.value =
        new Date().toISOString()

      return stats.value
    } catch (caughtError) {
      error.value =
        "No se pudieron cargar los datos del dashboard."

      console.error(
        "[useDashboard] fetchDashboard:",
        caughtError
      )

      if (!lastUpdated.value) {
        stats.value = createEmptyStats()
        hasData.value = false
      }

      return null
    } finally {
      loading.value = false
    }
  }

  return {
    stats,
    loading,
    error,
    hasData,
    lastUpdated,
    fetchDashboard
  }
}
