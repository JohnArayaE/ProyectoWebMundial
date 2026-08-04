import {
  Timestamp
} from "firebase/firestore"

import {
  useFirestore
} from "./useFirestore"

import {
  WORLD_CUP_GROUPS,
  useStandings,
  type WorldCupGroup
} from "./useStandings"

import type {
  MatchInput
} from "./useMatches"

interface SimulationTeamSeed {
  name: string
  flag: string
  confederation: string
}

interface SimulationTeam {
  id: string
  name: string
  group: WorldCupGroup
  flag: string
  coach: string
  confederation: string
  fifaRanking: number
}

interface SimulationFixture {
  homeIndex: number
  awayIndex: number
  homeScore: number
  awayScore: number
}

export interface TournamentDataCounts {
  teams: number
  matches: number
  standings: number
}

export interface SimulationSummary {
  teamsCreated: number
  matchesCreated: number
  standingsCreated: number
  completedGroups: number
  qualifiedTeams: number
  isReadyForBracket: boolean
}

export interface GenerateSimulationOptions {
  replaceExistingData?: boolean
}

const SIMULATION_GROUP_TEAMS: Record<
  WorldCupGroup,
  SimulationTeamSeed[]
> = {
  A: [
    {
      name: "Argentina",
      flag: "🇦🇷",
      confederation: "CONMEBOL"
    },
    {
      name: "Colombia",
      flag: "🇨🇴",
      confederation: "CONMEBOL"
    },
    {
      name: "Costa Rica",
      flag: "🇨🇷",
      confederation: "CONCACAF"
    },
    {
      name: "Japón",
      flag: "🇯🇵",
      confederation: "AFC"
    }
  ],

  B: [
    {
      name: "Brasil",
      flag: "🇧🇷",
      confederation: "CONMEBOL"
    },
    {
      name: "México",
      flag: "🇲🇽",
      confederation: "CONCACAF"
    },
    {
      name: "Marruecos",
      flag: "🇲🇦",
      confederation: "CAF"
    },
    {
      name: "Corea del Sur",
      flag: "🇰🇷",
      confederation: "AFC"
    }
  ],

  C: [
    {
      name: "Francia",
      flag: "🇫🇷",
      confederation: "UEFA"
    },
    {
      name: "Estados Unidos",
      flag: "🇺🇸",
      confederation: "CONCACAF"
    },
    {
      name: "Senegal",
      flag: "🇸🇳",
      confederation: "CAF"
    },
    {
      name: "Australia",
      flag: "🇦🇺",
      confederation: "AFC"
    }
  ],

  D: [
    {
      name: "España",
      flag: "🇪🇸",
      confederation: "UEFA"
    },
    {
      name: "Uruguay",
      flag: "🇺🇾",
      confederation: "CONMEBOL"
    },
    {
      name: "Canadá",
      flag: "🇨🇦",
      confederation: "CONCACAF"
    },
    {
      name: "Camerún",
      flag: "🇨🇲",
      confederation: "CAF"
    }
  ],

  E: [
    {
      name: "Inglaterra",
      flag: "🏴",
      confederation: "UEFA"
    },
    {
      name: "Ecuador",
      flag: "🇪🇨",
      confederation: "CONMEBOL"
    },
    {
      name: "Nigeria",
      flag: "🇳🇬",
      confederation: "CAF"
    },
    {
      name: "Arabia Saudita",
      flag: "🇸🇦",
      confederation: "AFC"
    }
  ],

  F: [
    {
      name: "Alemania",
      flag: "🇩🇪",
      confederation: "UEFA"
    },
    {
      name: "Chile",
      flag: "🇨🇱",
      confederation: "CONMEBOL"
    },
    {
      name: "Túnez",
      flag: "🇹🇳",
      confederation: "CAF"
    },
    {
      name: "Nueva Zelanda",
      flag: "🇳🇿",
      confederation: "OFC"
    }
  ],

  G: [
    {
      name: "Portugal",
      flag: "🇵🇹",
      confederation: "UEFA"
    },
    {
      name: "Perú",
      flag: "🇵🇪",
      confederation: "CONMEBOL"
    },
    {
      name: "Egipto",
      flag: "🇪🇬",
      confederation: "CAF"
    },
    {
      name: "Irán",
      flag: "🇮🇷",
      confederation: "AFC"
    }
  ],

  H: [
    {
      name: "Países Bajos",
      flag: "🇳🇱",
      confederation: "UEFA"
    },
    {
      name: "Paraguay",
      flag: "🇵🇾",
      confederation: "CONMEBOL"
    },
    {
      name: "Ghana",
      flag: "🇬🇭",
      confederation: "CAF"
    },
    {
      name: "Catar",
      flag: "🇶🇦",
      confederation: "AFC"
    }
  ],

  I: [
    {
      name: "Bélgica",
      flag: "🇧🇪",
      confederation: "UEFA"
    },
    {
      name: "Panamá",
      flag: "🇵🇦",
      confederation: "CONCACAF"
    },
    {
      name: "Argelia",
      flag: "🇩🇿",
      confederation: "CAF"
    },
    {
      name: "Irak",
      flag: "🇮🇶",
      confederation: "AFC"
    }
  ],

  J: [
    {
      name: "Italia",
      flag: "🇮🇹",
      confederation: "UEFA"
    },
    {
      name: "Venezuela",
      flag: "🇻🇪",
      confederation: "CONMEBOL"
    },
    {
      name: "Costa de Marfil",
      flag: "🇨🇮",
      confederation: "CAF"
    },
    {
      name: "Uzbekistán",
      flag: "🇺🇿",
      confederation: "AFC"
    }
  ],

  K: [
    {
      name: "Croacia",
      flag: "🇭🇷",
      confederation: "UEFA"
    },
    {
      name: "Jamaica",
      flag: "🇯🇲",
      confederation: "CONCACAF"
    },
    {
      name: "Sudáfrica",
      flag: "🇿🇦",
      confederation: "CAF"
    },
    {
      name: "Jordania",
      flag: "🇯🇴",
      confederation: "AFC"
    }
  ],

  L: [
    {
      name: "Suiza",
      flag: "🇨🇭",
      confederation: "UEFA"
    },
    {
      name: "Honduras",
      flag: "🇭🇳",
      confederation: "CONCACAF"
    },
    {
      name: "Malí",
      flag: "🇲🇱",
      confederation: "CAF"
    },
    {
      name: "China",
      flag: "🇨🇳",
      confederation: "AFC"
    }
  ]
}

/**
 * Cada plantilla contiene los seis partidos
 * posibles de un grupo de cuatro equipos.
 *
 * Se utilizan varias plantillas para que los
 * mejores terceros no terminen todos con
 * exactamente los mismos resultados.
 */
const RESULT_TEMPLATES: SimulationFixture[][] = [
  [
    {
      homeIndex: 0,
      awayIndex: 1,
      homeScore: 2,
      awayScore: 1
    },
    {
      homeIndex: 0,
      awayIndex: 2,
      homeScore: 1,
      awayScore: 0
    },
    {
      homeIndex: 0,
      awayIndex: 3,
      homeScore: 2,
      awayScore: 2
    },
    {
      homeIndex: 1,
      awayIndex: 2,
      homeScore: 3,
      awayScore: 0
    },
    {
      homeIndex: 1,
      awayIndex: 3,
      homeScore: 1,
      awayScore: 1
    },
    {
      homeIndex: 2,
      awayIndex: 3,
      homeScore: 2,
      awayScore: 1
    }
  ],

  [
    {
      homeIndex: 0,
      awayIndex: 1,
      homeScore: 1,
      awayScore: 1
    },
    {
      homeIndex: 0,
      awayIndex: 2,
      homeScore: 2,
      awayScore: 0
    },
    {
      homeIndex: 0,
      awayIndex: 3,
      homeScore: 1,
      awayScore: 0
    },
    {
      homeIndex: 1,
      awayIndex: 2,
      homeScore: 2,
      awayScore: 2
    },
    {
      homeIndex: 1,
      awayIndex: 3,
      homeScore: 3,
      awayScore: 1
    },
    {
      homeIndex: 2,
      awayIndex: 3,
      homeScore: 2,
      awayScore: 0
    }
  ],

  [
    {
      homeIndex: 0,
      awayIndex: 1,
      homeScore: 3,
      awayScore: 0
    },
    {
      homeIndex: 0,
      awayIndex: 2,
      homeScore: 0,
      awayScore: 1
    },
    {
      homeIndex: 0,
      awayIndex: 3,
      homeScore: 2,
      awayScore: 0
    },
    {
      homeIndex: 1,
      awayIndex: 2,
      homeScore: 2,
      awayScore: 1
    },
    {
      homeIndex: 1,
      awayIndex: 3,
      homeScore: 1,
      awayScore: 0
    },
    {
      homeIndex: 2,
      awayIndex: 3,
      homeScore: 1,
      awayScore: 1
    }
  ],

  [
    {
      homeIndex: 0,
      awayIndex: 1,
      homeScore: 0,
      awayScore: 0
    },
    {
      homeIndex: 0,
      awayIndex: 2,
      homeScore: 1,
      awayScore: 1
    },
    {
      homeIndex: 0,
      awayIndex: 3,
      homeScore: 2,
      awayScore: 0
    },
    {
      homeIndex: 1,
      awayIndex: 2,
      homeScore: 2,
      awayScore: 0
    },
    {
      homeIndex: 1,
      awayIndex: 3,
      homeScore: 1,
      awayScore: 0
    },
    {
      homeIndex: 2,
      awayIndex: 3,
      homeScore: 3,
      awayScore: 1
    }
  ]
]

export function useTournamentSimulation() {
  const {
    getCollection,
    createDocument,
    deleteDocument
  } = useFirestore()

  const {
    standings,
    qualificationSummary,
    recalculateAllStandings,
    fetchAllStandings
  } = useStandings()

  const loading = useState<boolean>(
    "tournament-simulation-loading",
    () => false
  )

  const error = useState<string | null>(
    "tournament-simulation-error",
    () => null
  )

  const progress = useState<number>(
    "tournament-simulation-progress",
    () => 0
  )

  const progressMessage = useState<string>(
    "tournament-simulation-progress-message",
    () => ""
  )

  const dataCounts = useState<TournamentDataCounts>(
    "tournament-simulation-data-counts",
    () => ({
      teams: 0,
      matches: 0,
      standings: 0
    })
  )

  const simulationSummary =
    useState<SimulationSummary | null>(
      "tournament-simulation-summary",
      () => null
    )

  function setProgress(
    value: number,
    message: string
  ): void {
    progress.value = value
    progressMessage.value = message
  }

  /**
   * Ejecuta escrituras en grupos pequeños para
   * no enviar demasiadas solicitudes simultáneas
   * a Firestore.
   */
  async function runInBatches<T>(
    items: T[],
    action: (
      item: T,
      index: number
    ) => Promise<void>,
    batchSize = 20
  ): Promise<void> {
    for (
      let startIndex = 0;
      startIndex < items.length;
      startIndex += batchSize
    ) {
      const currentBatch = items.slice(
        startIndex,
        startIndex + batchSize
      )

      await Promise.all(
        currentBatch.map(
          async (
            item,
            batchIndex
          ) => {
            await action(
              item,
              startIndex + batchIndex
            )
          }
        )
      )
    }
  }

  function buildSimulationTeams():
    SimulationTeam[] {
    const generatedTeams:
      SimulationTeam[] = []

    let ranking = 1

    for (
      const group of
      WORLD_CUP_GROUPS
    ) {
      const groupSeeds =
        SIMULATION_GROUP_TEAMS[group]

      groupSeeds.forEach(
        (
          seed,
          index
        ) => {
          generatedTeams.push({
            id:
              `SIM_TEAM_${group}_${index + 1}`,

            name: seed.name,
            group,
            flag: seed.flag,

            coach:
              `Entrenador simulado ${index + 1}`,

            confederation:
              seed.confederation,

            fifaRanking:
              ranking
          })

          ranking += 1
        }
      )
    }

    return generatedTeams
  }

  function buildMatchKickoff(
    groupIndex: number,
    fixtureIndex: number
  ): Timestamp {
    const kickoff = new Date(
      2026,
      5,
      11,
      12,
      0,
      0
    )

    const groupDayOffset =
      groupIndex * 3

    const fixtureDayOffset =
      Math.floor(
        fixtureIndex / 2
      )

    kickoff.setDate(
      kickoff.getDate() +
      groupDayOffset +
      fixtureDayOffset
    )

    kickoff.setHours(
      fixtureIndex % 2 === 0
        ? 12
        : 18
    )

    return Timestamp.fromDate(
      kickoff
    )
  }

  function buildSimulationMatches(
    teams: SimulationTeam[]
  ): Array<{
    id: string
    data: MatchInput
  }> {
    const generatedMatches: Array<{
      id: string
      data: MatchInput
    }> = []

    WORLD_CUP_GROUPS.forEach(
      (
        group,
        groupIndex
      ) => {
        const groupTeams =
          teams.filter(
            team => {
              return team.group === group
            }
          )

        if (groupTeams.length !== 4) {
          throw new Error(
            `El grupo ${group} no tiene cuatro selecciones simuladas.`
          )
        }

        const resultTemplate =
          RESULT_TEMPLATES[
            groupIndex %
            RESULT_TEMPLATES.length
          ]

        if (!resultTemplate) {
          throw new Error(
            `No se encontró una plantilla de resultados para el grupo ${group}.`
          )
        }

        resultTemplate.forEach(
          (
            fixture,
            fixtureIndex
          ) => {
            const homeTeam =
              groupTeams[
                fixture.homeIndex
              ]

            const awayTeam =
              groupTeams[
                fixture.awayIndex
              ]

            if (
              !homeTeam ||
              !awayTeam
            ) {
              throw new Error(
                `No se pudieron encontrar los equipos del partido ${fixtureIndex + 1} del grupo ${group}.`
              )
            }

            const matchNumber =
              String(
                fixtureIndex + 1
              ).padStart(2, "0")

            generatedMatches.push({
              id:
                `SIM_GROUP_${group}_${matchNumber}`,

              data: {
                homeTeamId:
                  homeTeam.id,

                homeTeam:
                  homeTeam.name,

                awayTeamId:
                  awayTeam.id,

                awayTeam:
                  awayTeam.name,

                group,
                stage:
                  "Fase de grupos",

                stadium:
                  `Estadio simulado ${group}`,

                city:
                  `Ciudad simulada ${group}`,

                kickoff:
                  buildMatchKickoff(
                    groupIndex,
                    fixtureIndex
                  ),

                homeScore:
                  fixture.homeScore,

                awayScore:
                  fixture.awayScore,

                status:
                  "Finalizado"
              }
            })
          }
        )
      }
    )

    return generatedMatches
  }

  async function getCurrentDataCounts():
    Promise<TournamentDataCounts> {
    const [
      teamsResult,
      matchesResult,
      standingsResult
    ] = await Promise.all([
      getCollection("teams"),
      getCollection("matches"),
      getCollection("standings")
    ])

    const counts: TournamentDataCounts = {
      teams: teamsResult.length,
      matches: matchesResult.length,
      standings:
        standingsResult.length
    }

    dataCounts.value = counts

    return counts
  }

  async function deleteCollectionDocuments(
    collectionName: string
  ): Promise<number> {
    const documents =
      await getCollection(
        collectionName
      ) as Array<{
        id: string
      }>

    await runInBatches(
      documents,
      async document => {
        await deleteDocument(
          collectionName,
          document.id
        )
      }
    )

    return documents.length
  }

  /**
   * Limpia únicamente los datos relacionados
   * con la simulación del torneo.
   *
   * No elimina:
   * - users
   * - players
   * - favoritos
   */
  async function removeTournamentData():
    Promise<void> {
    setProgress(
      5,
      "Eliminando partidos anteriores..."
    )

    await deleteCollectionDocuments(
      "matches"
    )

    setProgress(
      10,
      "Eliminando posiciones anteriores..."
    )

    await deleteCollectionDocuments(
      "standings"
    )

    setProgress(
      15,
      "Eliminando selecciones anteriores..."
    )

    await deleteCollectionDocuments(
      "teams"
    )

    standings.value = []

    dataCounts.value = {
      teams: 0,
      matches: 0,
      standings: 0
    }

    simulationSummary.value = null
  }

  async function clearTournamentData():
    Promise<void> {
    loading.value = true
    error.value = null

    try {
      setProgress(
        0,
        "Preparando limpieza..."
      )

      await removeTournamentData()

      setProgress(
        100,
        "Datos del torneo eliminados."
      )
    } catch (caughtError) {
      error.value =
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudieron eliminar los datos del torneo."

      console.error(
        "[useTournamentSimulation] clearTournamentData:",
        caughtError
      )

      throw caughtError
    } finally {
      loading.value = false
    }
  }

  async function createSimulationTeams(
    teams: SimulationTeam[]
  ): Promise<void> {
    await runInBatches(
      teams,
      async team => {
        const {
          id,
          ...teamData
        } = team

        await createDocument(
          "teams",
          {
            ...teamData,
            isSimulationData: true
          },
          id
        )
      }
    )
  }

  async function createSimulationMatches(
    matches: Array<{
      id: string
      data: MatchInput
    }>
  ): Promise<void> {
    await runInBatches(
      matches,
      async match => {
        await createDocument(
          "matches",
          {
            ...match.data,
            isSimulationData: true
          },
          match.id
        )
      }
    )
  }

  async function generateTournamentSimulation(
    options: GenerateSimulationOptions = {}
  ): Promise<SimulationSummary> {
    loading.value = true
    error.value = null
    simulationSummary.value = null

    try {
      setProgress(
        0,
        "Revisando datos existentes..."
      )

      const currentCounts =
        await getCurrentDataCounts()

      const hasExistingData =
        currentCounts.teams > 0 ||
        currentCounts.matches > 0 ||
        currentCounts.standings > 0

      if (
        hasExistingData &&
        !options.replaceExistingData
      ) {
        throw new Error(
          "Ya existen equipos, partidos o posiciones. Confirma que deseas reemplazarlos antes de generar la simulación."
        )
      }

      if (hasExistingData) {
        await removeTournamentData()
      }

      const simulationTeams =
        buildSimulationTeams()

      const simulationMatches =
        buildSimulationMatches(
          simulationTeams
        )

      setProgress(
        25,
        "Creando las 48 selecciones..."
      )

      await createSimulationTeams(
        simulationTeams
      )

      setProgress(
        55,
        "Creando los 72 partidos de grupos..."
      )

      await createSimulationMatches(
        simulationMatches
      )

      setProgress(
        80,
        "Calculando las 12 tablas de posiciones..."
      )

      await recalculateAllStandings()

      setProgress(
        95,
        "Comprobando los clasificados..."
      )

      await fetchAllStandings()

      const summary =
        qualificationSummary.value

      const result:
        SimulationSummary = {
          teamsCreated:
            simulationTeams.length,

          matchesCreated:
            simulationMatches.length,

          standingsCreated:
            standings.value.length,

          completedGroups:
            summary.completedGroups,

          qualifiedTeams:
            summary.totalQualified,

          isReadyForBracket:
            summary.isReadyForBracket
        }

      if (
        result.teamsCreated !== 48 ||
        result.matchesCreated !== 72 ||
        result.standingsCreated !== 48 ||
        result.completedGroups !== 12 ||
        result.qualifiedTeams !== 32 ||
        !result.isReadyForBracket
      ) {
        throw new Error(
          "La simulación se generó, pero alguno de los totales esperados no coincide."
        )
      }

      simulationSummary.value = result

      dataCounts.value = {
        teams:
          result.teamsCreated,

        matches:
          result.matchesCreated,

        standings:
          result.standingsCreated
      }

      setProgress(
        100,
        "Simulación completada correctamente."
      )

      return result
    } catch (caughtError) {
      error.value =
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudo generar la simulación."

      console.error(
        "[useTournamentSimulation] generateTournamentSimulation:",
        caughtError
      )

      throw caughtError
    } finally {
      loading.value = false
    }
  }

  const hasTournamentData =
    computed<boolean>(() => {
      return (
        dataCounts.value.teams > 0 ||
        dataCounts.value.matches > 0 ||
        dataCounts.value.standings > 0
      )
    })

  return {
    loading,
    error,

    progress,
    progressMessage,

    dataCounts,
    hasTournamentData,

    simulationSummary,

    getCurrentDataCounts,
    generateTournamentSimulation,
    clearTournamentData
  }
}