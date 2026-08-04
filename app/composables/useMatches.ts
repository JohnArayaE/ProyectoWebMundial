import {
  where,
  type Timestamp
} from "firebase/firestore"

import { useFirestore } from "./useFirestore"

export type MatchStatus =
  | "Programado"
  | "En Vivo"
  | "Finalizado"

export type MatchStage =
  | "Fase de grupos"
  | "Dieciseisavos"
  | "Octavos"
  | "Cuartos"
  | "Semifinal"
  | "Tercer lugar"
  | "Final"

export interface Match {
  id: string

  homeTeamId: string
  homeTeam: string

  awayTeamId: string
  awayTeam: string

  group: string
  stage: MatchStage
  stadium: string
  city: string
  kickoff: Timestamp
  homeScore: number
  awayScore: number
  status: MatchStatus

  createdAt?: unknown
  updatedAt?: unknown
}

export type MatchInput = Omit<
  Match,
  "id" | "createdAt" | "updatedAt"
>

export function useMatches() {
  const {
    getCollection,
    getDocument,
    createDocument,
    updateDocument,
    deleteDocument
  } = useFirestore()

  const matches = useState<Match[]>(
    "matches",
    () => []
  )

  const loading = useState<boolean>(
    "matches-loading",
    () => false
  )

  const error = useState<string | null>(
    "matches-error",
    () => null
  )

  /**
   * Ordena los partidos desde el más próximo
   * hasta el más lejano.
   */
  function sortMatchesByKickoff(
    matchesToSort: Match[]
  ): Match[] {
    return [...matchesToSort].sort(
      (firstMatch, secondMatch) => {
        return (
          firstMatch.kickoff.toMillis() -
          secondMatch.kickoff.toMillis()
        )
      }
    )
  }

  /**
   * Obtiene todos los partidos.
   */
  async function fetchMatches(): Promise<Match[]> {
    loading.value = true
    error.value = null

    try {
      const result = await getCollection(
        "matches"
      ) as Match[]

      matches.value = sortMatchesByKickoff(
        result
      )

      return matches.value
    } catch (caughtError) {
      error.value =
        "No se pudieron cargar los partidos."

      console.error(
        "[useMatches] fetchMatches:",
        caughtError
      )

      matches.value = []

      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Busca un partido mediante su ID.
   *
   * Se utiliza en la ruta:
   * /matches/[id]
   */
  async function fetchMatchById(
    id: string
  ): Promise<Match | null> {
    loading.value = true
    error.value = null

    try {
      return await getDocument(
        "matches",
        id
      ) as Match | null
    } catch (caughtError) {
      error.value =
        "No se pudo cargar el partido."

      console.error(
        "[useMatches] fetchMatchById:",
        caughtError
      )

      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene los partidos de un grupo
   * utilizando where().
   */
  async function fetchMatchesByGroup(
    group: string
  ): Promise<Match[]> {
    loading.value = true
    error.value = null

    try {
      const result = await getCollection(
        "matches",
        [
          where(
            "group",
            "==",
            group
          )
        ]
      ) as Match[]

      matches.value = sortMatchesByKickoff(
        result
      )

      return matches.value
    } catch (caughtError) {
      error.value =
        "No se pudieron cargar los partidos del grupo."

      console.error(
        "[useMatches] fetchMatchesByGroup:",
        caughtError
      )

      matches.value = []

      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene los partidos de una fase
   * utilizando where().
   */
  async function fetchMatchesByStage(
    stage: MatchStage
  ): Promise<Match[]> {
    loading.value = true
    error.value = null

    try {
      const result = await getCollection(
        "matches",
        [
          where(
            "stage",
            "==",
            stage
          )
        ]
      ) as Match[]

      matches.value = sortMatchesByKickoff(
        result
      )

      return matches.value
    } catch (caughtError) {
      error.value =
        "No se pudieron cargar los partidos de la fase."

      console.error(
        "[useMatches] fetchMatchesByStage:",
        caughtError
      )

      matches.value = []

      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene los partidos según su estado
   * utilizando where().
   */
  async function fetchMatchesByStatus(
    status: MatchStatus
  ): Promise<Match[]> {
    loading.value = true
    error.value = null

    try {
      const result = await getCollection(
        "matches",
        [
          where(
            "status",
            "==",
            status
          )
        ]
      ) as Match[]

      matches.value = sortMatchesByKickoff(
        result
      )

      return matches.value
    } catch (caughtError) {
      error.value =
        "No se pudieron cargar los partidos por estado."

      console.error(
        "[useMatches] fetchMatchesByStatus:",
        caughtError
      )

      matches.value = []

      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene todos los partidos de una selección.
   *
   * Consulta tanto homeTeamId como awayTeamId
   * utilizando el ID del documento del equipo.
   */
  async function fetchMatchesByTeam(
    teamId: string
  ): Promise<Match[]> {
    loading.value = true
    error.value = null

    try {
      const [
        homeMatches,
        awayMatches
      ] = await Promise.all([
        getCollection(
          "matches",
          [
            where(
              "homeTeamId",
              "==",
              teamId
            )
          ]
        ) as Promise<Match[]>,

        getCollection(
          "matches",
          [
            where(
              "awayTeamId",
              "==",
              teamId
            )
          ]
        ) as Promise<Match[]>
      ])

      /*
       * Map evita que un mismo partido aparezca
       * duplicado en el resultado.
       */
      const uniqueMatches = new Map<
        string,
        Match
      >()

      for (
        const match of [
          ...homeMatches,
          ...awayMatches
        ]
      ) {
        uniqueMatches.set(
          match.id,
          match
        )
      }

      matches.value = sortMatchesByKickoff(
        Array.from(
          uniqueMatches.values()
        )
      )

      return matches.value
    } catch (caughtError) {
      error.value =
        "No se pudieron cargar los partidos de la selección."

      console.error(
        "[useMatches] fetchMatchesByTeam:",
        caughtError
      )

      matches.value = []

      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene únicamente los partidos
   * finalizados de la fase de grupos.
   *
   * Esta consulta se utilizará posteriormente
   * para calcular las tablas de posiciones.
   */
  async function fetchFinishedGroupMatches(
    group: string
  ): Promise<Match[]> {
    loading.value = true
    error.value = null

    try {
      const result = await getCollection(
        "matches",
        [
          where(
            "group",
            "==",
            group
          ),
          where(
            "stage",
            "==",
            "Fase de grupos"
          ),
          where(
            "status",
            "==",
            "Finalizado"
          )
        ]
      ) as Match[]

      return sortMatchesByKickoff(
        result
      )
    } catch (caughtError) {
      error.value =
        "No se pudieron cargar los resultados finalizados del grupo."

      console.error(
        "[useMatches] fetchFinishedGroupMatches:",
        caughtError
      )

      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Crea un partido.
   */
  async function createMatch(
    data: MatchInput
  ): Promise<string> {
    loading.value = true
    error.value = null

    try {
      const createdMatch =
        await createDocument(
          "matches",
          {
            ...data
          }
        )

      await fetchMatches()

      return createdMatch.id
    } catch (caughtError) {
      error.value =
        "No se pudo crear el partido."

      console.error(
        "[useMatches] createMatch:",
        caughtError
      )

      throw caughtError
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualiza un partido existente.
   */
  async function updateMatch(
    id: string,
    data: Partial<MatchInput>
  ): Promise<void> {
    loading.value = true
    error.value = null

    try {
      await updateDocument(
        "matches",
        id,
        {
          ...data,
          updatedAt: new Date()
        }
      )

      await fetchMatches()
    } catch (caughtError) {
      error.value =
        "No se pudo actualizar el partido."

      console.error(
        "[useMatches] updateMatch:",
        caughtError
      )

      throw caughtError
    } finally {
      loading.value = false
    }
  }

  /**
   * Elimina un partido.
   */
  async function deleteMatch(
    id: string
  ): Promise<void> {
    loading.value = true
    error.value = null

    try {
      await deleteDocument(
        "matches",
        id
      )

      matches.value =
        matches.value.filter(
          match => match.id !== id
        )
    } catch (caughtError) {
      error.value =
        "No se pudo eliminar el partido."

      console.error(
        "[useMatches] deleteMatch:",
        caughtError
      )

      throw caughtError
    } finally {
      loading.value = false
    }
  }

  /**
   * Vuelve a cargar todos los partidos.
   */
  async function refetchMatches(): Promise<void> {
    await fetchMatches()
  }

  return {
    matches,
    loading,
    error,
    fetchMatches,
    fetchMatchById,
    fetchMatchesByGroup,
    fetchMatchesByStage,
    fetchMatchesByStatus,
    fetchMatchesByTeam,
    fetchFinishedGroupMatches,
    createMatch,
    updateMatch,
    deleteMatch,
    refetchMatches
  }
}