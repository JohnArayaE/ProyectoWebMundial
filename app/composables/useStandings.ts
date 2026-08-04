import {
  where
} from "firebase/firestore"

import type { Team } from "../types/team"

import {
  useFirestore
} from "./useFirestore"

import {
  useTeams
} from "./useTeams"

import {
  useMatches,
  type Match
} from "./useMatches"

export const WORLD_CUP_GROUPS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L"
] as const

export type WorldCupGroup =
  typeof WORLD_CUP_GROUPS[number]

export interface Standing {
  id: string
  group: string

  teamId: string
  teamName: string
  flag: string
  fifaRanking: number

  played: number
  wins: number
  draws: number
  losses: number

  goalsFor: number
  goalsAgainst: number
  goalDifference: number

  points: number

  createdAt?: unknown
  updatedAt?: unknown
}

export type StandingInput = Omit<
  Standing,
  "id" | "createdAt" | "updatedAt"
>

export type QualificationType =
  | "Ganador de grupo"
  | "Segundo de grupo"
  | "Mejor tercero"

export interface QualifiedTeam extends Standing {
  groupPosition: 1 | 2 | 3
  qualificationType: QualificationType
  thirdPlaceRank?: number
}

export interface ThirdPlacedTeam extends Standing {
  groupPosition: 3
  thirdPlaceRank: number
  qualified: boolean
}

export interface QualificationSummary {
  groupsWithStandings: number
  completedGroups: number
  groupWinners: number
  groupRunnersUp: number
  thirdPlaceCandidates: number
  bestThirdPlaces: number
  directQualifiers: number
  totalQualified: number
  isReadyForBracket: boolean
}

type TeamWithId = Team & {
  id: string
}

export function useStandings() {
  const {
    getCollection,
    createDocument,
    deleteDocument
  } = useFirestore()

  const {
    teams,
    fetchTeams
  } = useTeams()

  const {
    fetchFinishedGroupMatches
  } = useMatches()

  const standings = useState<Standing[]>(
    "standings",
    () => []
  )

  const loading = useState<boolean>(
    "standings-loading",
    () => false
  )

  const error = useState<string | null>(
    "standings-error",
    () => null
  )

  function normalizeGroup(
    group: unknown
  ): string {
    return String(group ?? "")
      .trim()
      .toUpperCase()
  }

  function isValidWorldCupGroup(
    group: string
  ): group is WorldCupGroup {
    return WORLD_CUP_GROUPS.includes(
      group as WorldCupGroup
    )
  }

  function hasValidTeamId(
    team: Team
  ): team is TeamWithId {
    return (
      typeof team.id === "string" &&
      team.id.trim() !== ""
    )
  }

  function getValidRanking(
    ranking: unknown
  ): number {
    const parsedRanking = Number(ranking)

    if (
      Number.isFinite(parsedRanking) &&
      parsedRanking > 0
    ) {
      return parsedRanking
    }

    return 999
  }

  function getValidScore(
    score: unknown
  ): number {
    const parsedScore = Number(score)

    if (!Number.isFinite(parsedScore)) {
      return 0
    }

    return Math.trunc(
      Math.max(0, parsedScore)
    )
  }

  function createEmptyStanding(
    team: TeamWithId,
    group: string
  ): Standing {
    return {
      id: `${group}_${team.id}`,
      group,

      teamId: team.id,

      teamName:
        String(
          team.name ??
          "Selección sin nombre"
        ),

      flag:
        typeof team.flag === "string"
          ? team.flag
          : "",

      fifaRanking:
        getValidRanking(
          team.fifaRanking
        ),

      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,

      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,

      points: 0
    }
  }

  function createStandingInput(
    standing: Standing
  ): StandingInput {
    return {
      group: standing.group,

      teamId: standing.teamId,
      teamName: standing.teamName,
      flag: standing.flag,
      fifaRanking:
        standing.fifaRanking,

      played: standing.played,
      wins: standing.wins,
      draws: standing.draws,
      losses: standing.losses,

      goalsFor:
        standing.goalsFor,

      goalsAgainst:
        standing.goalsAgainst,

      goalDifference:
        standing.goalDifference,

      points: standing.points
    }
  }

  /**
   * Orden de desempate:
   *
   * 1. Puntos.
   * 2. Diferencia de goles.
   * 3. Goles a favor.
   * 4. Victorias.
   * 5. Ranking FIFA.
   * 6. Nombre.
   */
  function compareStandings(
    firstStanding: Standing,
    secondStanding: Standing
  ): number {
    if (
      secondStanding.points !==
      firstStanding.points
    ) {
      return (
        secondStanding.points -
        firstStanding.points
      )
    }

    if (
      secondStanding.goalDifference !==
      firstStanding.goalDifference
    ) {
      return (
        secondStanding.goalDifference -
        firstStanding.goalDifference
      )
    }

    if (
      secondStanding.goalsFor !==
      firstStanding.goalsFor
    ) {
      return (
        secondStanding.goalsFor -
        firstStanding.goalsFor
      )
    }

    if (
      secondStanding.wins !==
      firstStanding.wins
    ) {
      return (
        secondStanding.wins -
        firstStanding.wins
      )
    }

    if (
      firstStanding.fifaRanking !==
      secondStanding.fifaRanking
    ) {
      return (
        firstStanding.fifaRanking -
        secondStanding.fifaRanking
      )
    }

    return firstStanding.teamName.localeCompare(
      secondStanding.teamName,
      "es"
    )
  }

  function sortStandings(
    standingsToSort: Standing[]
  ): Standing[] {
    return [...standingsToSort].sort(
      compareStandings
    )
  }

  function sortAllStandings(
    standingsToSort: Standing[]
  ): Standing[] {
    return [...standingsToSort].sort(
      (
        firstStanding,
        secondStanding
      ) => {
        const groupComparison =
          firstStanding.group.localeCompare(
            secondStanding.group
          )

        if (groupComparison !== 0) {
          return groupComparison
        }

        return compareStandings(
          firstStanding,
          secondStanding
        )
      }
    )
  }

  function replaceGroupInState(
    group: string,
    groupStandings: Standing[]
  ): void {
    const normalizedGroup =
      normalizeGroup(group)

    const otherGroups =
      standings.value.filter(
        standing => {
          return (
            normalizeGroup(
              standing.group
            ) !== normalizedGroup
          )
        }
      )

    standings.value =
      sortAllStandings([
        ...otherGroups,
        ...groupStandings
      ])
  }

  async function fetchStandingsByGroup(
    group: string
  ): Promise<Standing[]> {
    loading.value = true
    error.value = null

    try {
      const normalizedGroup =
        normalizeGroup(group)

      const result = await getCollection(
        "standings",
        [
          where(
            "group",
            "==",
            normalizedGroup
          )
        ]
      ) as Standing[]

      const sortedStandings =
        sortStandings(result)

      replaceGroupInState(
        normalizedGroup,
        sortedStandings
      )

      return sortedStandings
    } catch (caughtError) {
      error.value =
        "No se pudo cargar la tabla de posiciones."

      console.error(
        "[useStandings] fetchStandingsByGroup:",
        caughtError
      )

      return []
    } finally {
      loading.value = false
    }
  }

  async function fetchAllStandings():
    Promise<Standing[]> {
    loading.value = true
    error.value = null

    try {
      const result = await getCollection(
        "standings"
      ) as Standing[]

      const sortedResult =
        sortAllStandings(result)

      standings.value = sortedResult

      return sortedResult
    } catch (caughtError) {
      error.value =
        "No se pudieron cargar las tablas de posiciones."

      console.error(
        "[useStandings] fetchAllStandings:",
        caughtError
      )

      standings.value = []

      return []
    } finally {
      loading.value = false
    }
  }

  function calculateStandings(
    group: string,
    groupTeams: TeamWithId[],
    finishedMatches: Match[]
  ): Standing[] {
    const normalizedGroup =
      normalizeGroup(group)

    const standingsMap = new Map<
      string,
      Standing
    >()

    for (const team of groupTeams) {
      standingsMap.set(
        team.id,
        createEmptyStanding(
          team,
          normalizedGroup
        )
      )
    }

    for (const match of finishedMatches) {
      const matchGroup =
        normalizeGroup(match.group)

      if (
        match.stage !==
          "Fase de grupos" ||
        match.status !==
          "Finalizado" ||
        matchGroup !== normalizedGroup
      ) {
        continue
      }

      const homeStanding =
        standingsMap.get(
          match.homeTeamId
        )

      const awayStanding =
        standingsMap.get(
          match.awayTeamId
        )

      if (
        !homeStanding ||
        !awayStanding
      ) {
        console.warn(
          "[useStandings] Partido ignorado:",
          match.id
        )

        continue
      }

      const homeScore =
        getValidScore(
          match.homeScore
        )

      const awayScore =
        getValidScore(
          match.awayScore
        )

      homeStanding.played += 1
      awayStanding.played += 1

      homeStanding.goalsFor +=
        homeScore

      homeStanding.goalsAgainst +=
        awayScore

      awayStanding.goalsFor +=
        awayScore

      awayStanding.goalsAgainst +=
        homeScore

      if (homeScore > awayScore) {
        homeStanding.wins += 1
        homeStanding.points += 3

        awayStanding.losses += 1

        continue
      }

      if (awayScore > homeScore) {
        awayStanding.wins += 1
        awayStanding.points += 3

        homeStanding.losses += 1

        continue
      }

      homeStanding.draws += 1
      awayStanding.draws += 1

      homeStanding.points += 1
      awayStanding.points += 1
    }

    for (
      const standing of
      standingsMap.values()
    ) {
      standing.goalDifference =
        standing.goalsFor -
        standing.goalsAgainst
    }

    return sortStandings(
      Array.from(
        standingsMap.values()
      )
    )
  }

  async function deleteOldStandings(
    group: string,
    currentStandings: Standing[]
  ): Promise<void> {
    const normalizedGroup =
      normalizeGroup(group)

    const storedStandings =
      await getCollection(
        "standings",
        [
          where(
            "group",
            "==",
            normalizedGroup
          )
        ]
      ) as Standing[]

    const currentIds = new Set(
      currentStandings.map(
        standing => standing.id
      )
    )

    const standingsToDelete =
      storedStandings.filter(
        standing => {
          return !currentIds.has(
            standing.id
          )
        }
      )

    await Promise.all(
      standingsToDelete.map(
        standing => {
          return deleteDocument(
            "standings",
            standing.id
          )
        }
      )
    )
  }

  async function saveStandings(
    group: string,
    calculatedStandings: Standing[]
  ): Promise<void> {
    const normalizedGroup =
      normalizeGroup(group)

    await deleteOldStandings(
      normalizedGroup,
      calculatedStandings
    )

    await Promise.all(
      calculatedStandings.map(
        async standing => {
          const standingData =
            createStandingInput(
              standing
            )

          await createDocument(
            "standings",
            {
              ...standingData,
              updatedAt: new Date()
            },
            standing.id
          )
        }
      )
    )
  }

  async function calculateAndSaveGroup(
    group: string
  ): Promise<Standing[]> {
    const normalizedGroup =
      normalizeGroup(group)

    if (
      !isValidWorldCupGroup(
        normalizedGroup
      )
    ) {
      throw new Error(
        `El grupo ${normalizedGroup} no es válido.`
      )
    }

    const groupTeams =
      teams.value.filter(
        (
          team
        ): team is TeamWithId => {
          return (
            hasValidTeamId(team) &&
            normalizeGroup(
              team.group
            ) === normalizedGroup
          )
        }
      )

    if (groupTeams.length === 0) {
      throw new Error(
        `No existen equipos registrados en el grupo ${normalizedGroup}.`
      )
    }

    const finishedMatches =
      await fetchFinishedGroupMatches(
        normalizedGroup
      )

    const calculatedStandings =
      calculateStandings(
        normalizedGroup,
        groupTeams,
        finishedMatches
      )

    await saveStandings(
      normalizedGroup,
      calculatedStandings
    )

    return calculatedStandings
  }

  async function recalculateGroupStandings(
    group: string
  ): Promise<Standing[]> {
    loading.value = true
    error.value = null

    try {
      const normalizedGroup =
        normalizeGroup(group)

      await fetchTeams()

      const calculatedStandings =
        await calculateAndSaveGroup(
          normalizedGroup
        )

      replaceGroupInState(
        normalizedGroup,
        calculatedStandings
      )

      return calculatedStandings
    } catch (caughtError) {
      error.value =
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudo recalcular la tabla."

      console.error(
        "[useStandings] recalculateGroupStandings:",
        caughtError
      )

      throw caughtError
    } finally {
      loading.value = false
    }
  }

  async function recalculateAllStandings():
    Promise<Standing[]> {
    loading.value = true
    error.value = null

    try {
      await fetchTeams()

      const teamsWithId =
        teams.value.filter(
          hasValidTeamId
        )

      const registeredGroups = new Set(
        teamsWithId.map(team => {
          return normalizeGroup(
            team.group
          )
        })
      )

      const availableGroups =
        WORLD_CUP_GROUPS.filter(
          group => {
            return registeredGroups.has(
              group
            )
          }
        )

      if (
        availableGroups.length === 0
      ) {
        throw new Error(
          "No existen grupos registrados."
        )
      }

      const allStandings: Standing[] = []

      for (
        const group of
        availableGroups
      ) {
        const groupStandings =
          await calculateAndSaveGroup(
            group
          )

        allStandings.push(
          ...groupStandings
        )
      }

      standings.value =
        sortAllStandings(
          allStandings
        )

      return standings.value
    } catch (caughtError) {
      error.value =
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudieron recalcular las tablas."

      console.error(
        "[useStandings] recalculateAllStandings:",
        caughtError
      )

      throw caughtError
    } finally {
      loading.value = false
    }
  }

  function getStandingsByGroup(
    group: string,
    source: Standing[] =
      standings.value
  ): Standing[] {
    const normalizedGroup =
      normalizeGroup(group)

    return sortStandings(
      source.filter(
        standing => {
          return (
            normalizeGroup(
              standing.group
            ) === normalizedGroup
          )
        }
      )
    )
  }

  function getTeamByPosition(
    group: string,
    position: number,
    source: Standing[] =
      standings.value
  ): Standing | null {
    if (position < 1) {
      return null
    }

    const groupStandings =
      getStandingsByGroup(
        group,
        source
      )

    return (
      groupStandings[
        position - 1
      ] ?? null
    )
  }

  function buildStandingsByGroup(
    source: Standing[] =
      standings.value
  ): Record<string, Standing[]> {
    const groupedStandings: Record<
      string,
      Standing[]
    > = {}

    for (const standing of source) {
      const group =
        normalizeGroup(
          standing.group
        )

      if (!group) {
        continue
      }

      const currentStandings =
        groupedStandings[group] ?? []

      currentStandings.push(
        standing
      )

      groupedStandings[group] =
        currentStandings
    }

    for (
      const group of
      Object.keys(groupedStandings)
    ) {
      const groupStandings =
        groupedStandings[group]

      if (!groupStandings) {
        continue
      }

      groupedStandings[group] =
        sortStandings(
          groupStandings
        )
    }

    return groupedStandings
  }

  /**
   * Un grupo está terminado cuando:
   *
   * - Tiene cuatro equipos.
   * - Cada equipo jugó tres partidos.
   */
  function isGroupComplete(
    group: string,
    source: Standing[] =
      standings.value
  ): boolean {
    const groupStandings =
      getStandingsByGroup(
        group,
        source
      )

    return (
      groupStandings.length === 4 &&
      groupStandings.every(
        standing => {
          return standing.played === 3
        }
      )
    )
  }

  function getGroupWinners(
    source: Standing[] =
      standings.value
  ): QualifiedTeam[] {
    const winners: QualifiedTeam[] = []

    for (
      const group of
      WORLD_CUP_GROUPS
    ) {
      const standing =
        getTeamByPosition(
          group,
          1,
          source
        )

      if (!standing) {
        continue
      }

      winners.push({
        ...standing,
        groupPosition: 1,
        qualificationType:
          "Ganador de grupo"
      })
    }

    return winners
  }

  function getGroupRunnersUp(
    source: Standing[] =
      standings.value
  ): QualifiedTeam[] {
    const runnersUp: QualifiedTeam[] = []

    for (
      const group of
      WORLD_CUP_GROUPS
    ) {
      const standing =
        getTeamByPosition(
          group,
          2,
          source
        )

      if (!standing) {
        continue
      }

      runnersUp.push({
        ...standing,
        groupPosition: 2,
        qualificationType:
          "Segundo de grupo"
      })
    }

    return runnersUp
  }

  /**
   * Compara los 12 terceros entre sí.
   */
  function getThirdPlacedTeams(
    source: Standing[] =
      standings.value
  ): ThirdPlacedTeam[] {
    const thirdPlaces: Standing[] = []

    for (
      const group of
      WORLD_CUP_GROUPS
    ) {
      const standing =
        getTeamByPosition(
          group,
          3,
          source
        )

      if (standing) {
        thirdPlaces.push(
          standing
        )
      }
    }

    const sortedThirdPlaces =
      [...thirdPlaces].sort(
        (
          firstStanding,
          secondStanding
        ) => {
          const comparison =
            compareStandings(
              firstStanding,
              secondStanding
            )

          if (comparison !== 0) {
            return comparison
          }

          return firstStanding.group.localeCompare(
            secondStanding.group
          )
        }
      )

    return sortedThirdPlaces.map(
      (
        standing,
        index
      ) => {
        return {
          ...standing,
          groupPosition: 3,
          thirdPlaceRank:
            index + 1,
          qualified:
            index < 8
        }
      }
    )
  }

  function getBestThirdPlacedTeams(
    source: Standing[] =
      standings.value
  ): QualifiedTeam[] {
    return getThirdPlacedTeams(
      source
    )
      .filter(
        standing => {
          return standing.qualified
        }
      )
      .slice(0, 8)
      .map(standing => {
        return {
          id: standing.id,
          group: standing.group,

          teamId: standing.teamId,
          teamName:
            standing.teamName,

          flag: standing.flag,

          fifaRanking:
            standing.fifaRanking,

          played: standing.played,
          wins: standing.wins,
          draws: standing.draws,
          losses: standing.losses,

          goalsFor:
            standing.goalsFor,

          goalsAgainst:
            standing.goalsAgainst,

          goalDifference:
            standing.goalDifference,

          points: standing.points,

          createdAt:
            standing.createdAt,

          updatedAt:
            standing.updatedAt,

          groupPosition: 3,

          qualificationType:
            "Mejor tercero",

          thirdPlaceRank:
            standing.thirdPlaceRank
        }
      })
  }

  function getQualifiedTeams(
    source: Standing[] =
      standings.value
  ): QualifiedTeam[] {
    return [
      ...getGroupWinners(source),
      ...getGroupRunnersUp(source),
      ...getBestThirdPlacedTeams(source)
    ]
  }

  function getQualificationSummary(
    source: Standing[] =
      standings.value
  ): QualificationSummary {
    const groupedStandings =
      buildStandingsByGroup(source)

    const groupsWithStandings =
      WORLD_CUP_GROUPS.filter(
        group => {
          return Boolean(
            groupedStandings[group]?.length
          )
        }
      ).length

    const completedGroups =
      WORLD_CUP_GROUPS.filter(
        group => {
          return isGroupComplete(
            group,
            source
          )
        }
      ).length

    const winners =
      getGroupWinners(source)

    const runnersUp =
      getGroupRunnersUp(source)

    const thirdPlaces =
      getThirdPlacedTeams(source)

    const bestThirdPlaces =
      getBestThirdPlacedTeams(source)

    const directQualifiers =
      winners.length +
      runnersUp.length

    const totalQualified =
      directQualifiers +
      bestThirdPlaces.length

    return {
      groupsWithStandings,
      completedGroups,

      groupWinners:
        winners.length,

      groupRunnersUp:
        runnersUp.length,

      thirdPlaceCandidates:
        thirdPlaces.length,

      bestThirdPlaces:
        bestThirdPlaces.length,

      directQualifiers,
      totalQualified,

      isReadyForBracket:
        completedGroups === 12 &&
        winners.length === 12 &&
        runnersUp.length === 12 &&
        bestThirdPlaces.length === 8 &&
        totalQualified === 32
    }
  }

  async function refetchStandingsByGroup(
    group: string
  ): Promise<void> {
    await fetchStandingsByGroup(
      group
    )
  }

  const standingsByGroup = computed<
    Record<string, Standing[]>
  >(() => {
    return buildStandingsByGroup(
      standings.value
    )
  })

  const groupWinners = computed<
    QualifiedTeam[]
  >(() => {
    return getGroupWinners(
      standings.value
    )
  })

  const groupRunnersUp = computed<
    QualifiedTeam[]
  >(() => {
    return getGroupRunnersUp(
      standings.value
    )
  })

  const thirdPlacedTeams = computed<
    ThirdPlacedTeam[]
  >(() => {
    return getThirdPlacedTeams(
      standings.value
    )
  })

  const bestThirdPlacedTeams = computed<
    QualifiedTeam[]
  >(() => {
    return getBestThirdPlacedTeams(
      standings.value
    )
  })

  const qualifiedTeams = computed<
    QualifiedTeam[]
  >(() => {
    return getQualifiedTeams(
      standings.value
    )
  })

  const qualificationSummary = computed<
    QualificationSummary
  >(() => {
    return getQualificationSummary(
      standings.value
    )
  })

  return {
    standings,
    standingsByGroup,

    groupWinners,
    groupRunnersUp,
    thirdPlacedTeams,
    bestThirdPlacedTeams,
    qualifiedTeams,
    qualificationSummary,

    loading,
    error,

    fetchStandingsByGroup,
    fetchAllStandings,

    recalculateGroupStandings,
    recalculateAllStandings,

    getStandingsByGroup,
    getTeamByPosition,

    getGroupWinners,
    getGroupRunnersUp,
    getThirdPlacedTeams,
    getBestThirdPlacedTeams,
    getQualifiedTeams,
    getQualificationSummary,

    isGroupComplete,
    sortStandings,

    refetchStandingsByGroup
  }
}