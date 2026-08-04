import {
  Timestamp,
  where
} from "firebase/firestore"

import {
  useFirestore
} from "./useFirestore"

import {
  useStandings,
  type QualifiedTeam
} from "./useStandings"

import {
  usePredictionScoring
} from "./usePredictionScoring"

import type {
  Match,
  MatchStage
} from "./useMatches"

export const BRACKET_STAGES = [
  "Dieciseisavos",
  "Octavos",
  "Cuartos",
  "Semifinal",
  "Tercer lugar",
  "Final"
] as const

export type BracketStage =
  typeof BRACKET_STAGES[number]

export type BracketPosition =
  | "home"
  | "away"

export interface BracketMatch
  extends Omit<Match, "stage"> {
  stage: BracketStage

  isBracketMatch: true

  bracketCode: string
  bracketOrder: number

  homeSource: string
  awaySource: string

  homePenaltyScore: number | null
  awayPenaltyScore: number | null

  winnerTeamId: string
  winnerTeam: string

  loserTeamId: string
  loserTeam: string

  nextMatchId: string
  nextMatchPosition:
    | BracketPosition
    | ""

  loserNextMatchId: string
  loserNextMatchPosition:
    | BracketPosition
    | ""
}

export interface BracketResultInput {
  homeScore: number
  awayScore: number

  homePenaltyScore?: number | null
  awayPenaltyScore?: number | null
}

interface BracketParticipant {
  teamId: string
  teamName: string
  group: string
  source: string
}

interface RoundOf32Pairing {
  homeTeam: QualifiedTeam
  awayTeam: QualifiedTeam
}

interface CreateBracketMatchOptions {
  id: string
  stage: BracketStage
  order: number

  homeTeam?: QualifiedTeam
  awayTeam?: QualifiedTeam

  homeSource: string
  awaySource: string

  nextMatchId?: string
  nextMatchPosition?: BracketPosition

  loserNextMatchId?: string
  loserNextMatchPosition?: BracketPosition
}

const STAGE_ORDER: Record<
  BracketStage,
  number
> = {
  Dieciseisavos: 1,
  Octavos: 2,
  Cuartos: 3,
  Semifinal: 4,
  "Tercer lugar": 5,
  Final: 6
}

export function useBracket() {
  const {
    getCollection,
    getDocument,
    createDocument,
    updateDocument,
    deleteDocument
  } = useFirestore()

  const {
    fetchAllStandings,

    groupWinners,
    groupRunnersUp,
    bestThirdPlacedTeams,

    qualificationSummary,
    sortStandings
  } = useStandings()

  const {
    evaluateMatchPredictions
  } = usePredictionScoring()

  const bracketMatches =
    useState<BracketMatch[]>(
      "bracket-matches",
      () => []
    )

  const loading = useState<boolean>(
    "bracket-loading",
    () => false
  )

  const error = useState<string | null>(
    "bracket-error",
    () => null
  )

  function padNumber(
    value: number
  ): string {
    return String(value).padStart(
      2,
      "0"
    )
  }

  function sortBracketMatches(
    matchesToSort: BracketMatch[]
  ): BracketMatch[] {
    return [...matchesToSort].sort(
      (
        firstMatch,
        secondMatch
      ) => {
        const stageDifference =
          STAGE_ORDER[firstMatch.stage] -
          STAGE_ORDER[secondMatch.stage]

        if (stageDifference !== 0) {
          return stageDifference
        }

        return (
          firstMatch.bracketOrder -
          secondMatch.bracketOrder
        )
      }
    )
  }

  function sortQualifiedTeams(
    teamsToSort: QualifiedTeam[]
  ): QualifiedTeam[] {
    return sortStandings(
      [...teamsToSort]
    ) as QualifiedTeam[]
  }

  function getQualificationSource(
    team: QualifiedTeam
  ): string {
    if (
      team.qualificationType ===
      "Ganador de grupo"
    ) {
      return `1.º del grupo ${team.group}`
    }

    if (
      team.qualificationType ===
      "Segundo de grupo"
    ) {
      return `2.º del grupo ${team.group}`
    }

    return `Mejor tercero del grupo ${team.group}`
  }

  function getScheduledKickoff(
    stage: BracketStage,
    order: number
  ): Timestamp {
    const baseDates: Record<
      BracketStage,
      string
    > = {
      Dieciseisavos:
        "2026-07-01T18:00:00",

      Octavos:
        "2026-07-10T18:00:00",

      Cuartos:
        "2026-07-15T18:00:00",

      Semifinal:
        "2026-07-19T18:00:00",

      "Tercer lugar":
        "2026-07-22T18:00:00",

      Final:
        "2026-07-23T18:00:00"
    }

    const kickoff = new Date(
      baseDates[stage]
    )

    if (
      stage !== "Final" &&
      stage !== "Tercer lugar"
    ) {
      const dayOffset =
        Math.floor(
          (order - 1) / 2
        )

      kickoff.setDate(
        kickoff.getDate() +
        dayOffset
      )
    }

    return Timestamp.fromDate(kickoff)
  }

  function createBracketMatch(
    options: CreateBracketMatchOptions
  ): BracketMatch {
    return {
      id: options.id,

      isBracketMatch: true,

      bracketCode: options.id,
      bracketOrder: options.order,

      homeTeamId:
        options.homeTeam?.teamId ??
        "",

      homeTeam:
        options.homeTeam?.teamName ??
        "",

      awayTeamId:
        options.awayTeam?.teamId ??
        "",

      awayTeam:
        options.awayTeam?.teamName ??
        "",

      homeSource:
        options.homeSource,

      awaySource:
        options.awaySource,

      group: "",
      stage: options.stage,

      stadium: "Por definir",
      city: "Por definir",

      kickoff:
        getScheduledKickoff(
          options.stage,
          options.order
        ),

      homeScore: 0,
      awayScore: 0,

      homePenaltyScore: null,
      awayPenaltyScore: null,

      status: "Programado",

      winnerTeamId: "",
      winnerTeam: "",

      loserTeamId: "",
      loserTeam: "",

      nextMatchId:
        options.nextMatchId ?? "",

      nextMatchPosition:
        options.nextMatchPosition ?? "",

      loserNextMatchId:
        options.loserNextMatchId ?? "",

      loserNextMatchPosition:
        options.loserNextMatchPosition ??
        ""
    }
  }

  /**
   * Regla de simulación:
   *
   * Bombo 1:
   * - 12 ganadores de grupo.
   * - 4 mejores segundos.
   *
   * Bombo 2:
   * - 8 segundos restantes.
   * - 8 mejores terceros.
   */
  function buildRoundOf32Pairings():
    RoundOf32Pairing[] {
    const winners =
      groupWinners.value

    const sortedRunnersUp =
      sortQualifiedTeams(
        groupRunnersUp.value
      )

    const bestFourRunnersUp =
      sortedRunnersUp.slice(0, 4)

    const remainingRunnersUp =
      sortedRunnersUp.slice(4)

    const seededTeams =
      sortQualifiedTeams([
        ...winners,
        ...bestFourRunnersUp
      ])

    /**
     * Se invierte para enfrentar,
     * aproximadamente, los mejores
     * sembrados contra los más bajos.
     */
    const unseededTeams =
      sortQualifiedTeams([
        ...remainingRunnersUp,
        ...bestThirdPlacedTeams.value
      ]).reverse()

    if (
      seededTeams.length !== 16 ||
      unseededTeams.length !== 16
    ) {
      throw new Error(
        "No se pudieron formar los dos bombos de 16 selecciones."
      )
    }

    const availableUnseededTeams = [
      ...unseededTeams
    ]

    const pairings:
      RoundOf32Pairing[] = []

    for (
      const seededTeam of
      seededTeams
    ) {
      let opponentIndex =
        availableUnseededTeams.findIndex(
          opponent => {
            return (
              opponent.group !==
              seededTeam.group
            )
          }
        )

      /**
       * Si no existe una opción de otro
       * grupo, utiliza el siguiente equipo
       * disponible.
       */
      if (opponentIndex < 0) {
        opponentIndex = 0
      }

      const opponent =
        availableUnseededTeams[
          opponentIndex
        ]

      if (!opponent) {
        throw new Error(
          "No se encontró un rival para uno de los clasificados."
        )
      }

      availableUnseededTeams.splice(
        opponentIndex,
        1
      )

      pairings.push({
        homeTeam: seededTeam,
        awayTeam: opponent
      })
    }

    return pairings
  }

  function buildRoundOf32Matches():
    BracketMatch[] {
    const pairings =
      buildRoundOf32Pairings()

    return pairings.map(
      (
        pairing,
        index
      ) => {
        const matchNumber =
          index + 1

        const nextMatchNumber =
          Math.ceil(
            matchNumber / 2
          )

        const nextPosition:
          BracketPosition =
            matchNumber % 2 === 1
              ? "home"
              : "away"

        return createBracketMatch({
          id:
            `R32_${padNumber(
              matchNumber
            )}`,

          stage:
            "Dieciseisavos",

          order:
            matchNumber,

          homeTeam:
            pairing.homeTeam,

          awayTeam:
            pairing.awayTeam,

          homeSource:
            getQualificationSource(
              pairing.homeTeam
            ),

          awaySource:
            getQualificationSource(
              pairing.awayTeam
            ),

          nextMatchId:
            `R16_${padNumber(
              nextMatchNumber
            )}`,

          nextMatchPosition:
            nextPosition
        })
      }
    )
  }

  function buildRoundOf16Matches():
    BracketMatch[] {
    return Array.from(
      { length: 8 },
      (
        _,
        index
      ) => {
        const matchNumber =
          index + 1

        const previousHome =
          matchNumber * 2 - 1

        const previousAway =
          matchNumber * 2

        const nextMatchNumber =
          Math.ceil(
            matchNumber / 2
          )

        const nextPosition:
          BracketPosition =
            matchNumber % 2 === 1
              ? "home"
              : "away"

        return createBracketMatch({
          id:
            `R16_${padNumber(
              matchNumber
            )}`,

          stage: "Octavos",
          order: matchNumber,

          homeSource:
            `Ganador R32-${padNumber(
              previousHome
            )}`,

          awaySource:
            `Ganador R32-${padNumber(
              previousAway
            )}`,

          nextMatchId:
            `QF_${padNumber(
              nextMatchNumber
            )}`,

          nextMatchPosition:
            nextPosition
        })
      }
    )
  }

  function buildQuarterFinalMatches():
    BracketMatch[] {
    return Array.from(
      { length: 4 },
      (
        _,
        index
      ) => {
        const matchNumber =
          index + 1

        const previousHome =
          matchNumber * 2 - 1

        const previousAway =
          matchNumber * 2

        const nextMatchNumber =
          Math.ceil(
            matchNumber / 2
          )

        const nextPosition:
          BracketPosition =
            matchNumber % 2 === 1
              ? "home"
              : "away"

        return createBracketMatch({
          id:
            `QF_${padNumber(
              matchNumber
            )}`,

          stage: "Cuartos",
          order: matchNumber,

          homeSource:
            `Ganador R16-${padNumber(
              previousHome
            )}`,

          awaySource:
            `Ganador R16-${padNumber(
              previousAway
            )}`,

          nextMatchId:
            `SF_${padNumber(
              nextMatchNumber
            )}`,

          nextMatchPosition:
            nextPosition
        })
      }
    )
  }

  function buildSemiFinalMatches():
    BracketMatch[] {
    return Array.from(
      { length: 2 },
      (
        _,
        index
      ) => {
        const matchNumber =
          index + 1

        const previousHome =
          matchNumber * 2 - 1

        const previousAway =
          matchNumber * 2

        const finalPosition:
          BracketPosition =
            matchNumber === 1
              ? "home"
              : "away"

        return createBracketMatch({
          id:
            `SF_${padNumber(
              matchNumber
            )}`,

          stage: "Semifinal",
          order: matchNumber,

          homeSource:
            `Ganador QF-${padNumber(
              previousHome
            )}`,

          awaySource:
            `Ganador QF-${padNumber(
              previousAway
            )}`,

          nextMatchId:
            "FINAL_01",

          nextMatchPosition:
            finalPosition,

          loserNextMatchId:
            "THIRD_01",

          loserNextMatchPosition:
            finalPosition
        })
      }
    )
  }

  function buildThirdPlaceMatch():
    BracketMatch {
    return createBracketMatch({
      id: "THIRD_01",

      stage: "Tercer lugar",
      order: 1,

      homeSource:
        "Perdedor SF-01",

      awaySource:
        "Perdedor SF-02"
    })
  }

  function buildFinalMatch():
    BracketMatch {
    return createBracketMatch({
      id: "FINAL_01",

      stage: "Final",
      order: 1,

      homeSource:
        "Ganador SF-01",

      awaySource:
        "Ganador SF-02"
    })
  }

  function buildCompleteBracket():
    BracketMatch[] {
    return [
      ...buildRoundOf32Matches(),
      ...buildRoundOf16Matches(),
      ...buildQuarterFinalMatches(),
      ...buildSemiFinalMatches(),
      buildThirdPlaceMatch(),
      buildFinalMatch()
    ]
  }

  async function fetchBracketMatches():
    Promise<BracketMatch[]> {
    loading.value = true
    error.value = null

    try {
      const result =
        await getCollection(
          "matches",
          [
            where(
              "isBracketMatch",
              "==",
              true
            )
          ]
        ) as BracketMatch[]

      bracketMatches.value =
        sortBracketMatches(result)

      return bracketMatches.value
    } catch (caughtError) {
      error.value =
        "No se pudo cargar el bracket."

      console.error(
        "[useBracket] fetchBracketMatches:",
        caughtError
      )

      bracketMatches.value = []

      return []
    } finally {
      loading.value = false
    }
  }

  async function fetchBracketMatchById(
    id: string
  ): Promise<BracketMatch | null> {
    try {
      const match =
        await getDocument(
          "matches",
          id
        ) as BracketMatch | null

      if (
        !match ||
        match.isBracketMatch !== true
      ) {
        return null
      }

      return match
    } catch (caughtError) {
      console.error(
        "[useBracket] fetchBracketMatchById:",
        caughtError
      )

      return null
    }
  }

  async function generateBracket():
    Promise<BracketMatch[]> {
    loading.value = true
    error.value = null

    try {
      await fetchAllStandings()

      const summary =
        qualificationSummary.value

      if (
        !summary.isReadyForBracket
      ) {
        throw new Error(
          `El bracket todavía no puede generarse. Hay ${summary.completedGroups}/12 grupos terminados y ${summary.totalQualified}/32 clasificados.`
        )
      }

      const existingMatches =
        await getCollection(
          "matches",
          [
            where(
              "isBracketMatch",
              "==",
              true
            )
          ]
        ) as BracketMatch[]

      if (
        existingMatches.length > 0
      ) {
        throw new Error(
          "Ya existe un bracket generado. Debes reiniciarlo antes de crear otro."
        )
      }

      const generatedMatches =
        buildCompleteBracket()

      await Promise.all(
        generatedMatches.map(
          async match => {
            const {
              id,
              createdAt,
              updatedAt,
              ...matchData
            } = match

            await createDocument(
              "matches",
              matchData,
              id
            )
          }
        )
      )

      bracketMatches.value =
        sortBracketMatches(
          generatedMatches
        )

      return bracketMatches.value
    } catch (caughtError) {
      error.value =
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudo generar el bracket."

      console.error(
        "[useBracket] generateBracket:",
        caughtError
      )

      throw caughtError
    } finally {
      loading.value = false
    }
  }

  function validateScore(
    score: number,
    fieldName: string
  ): number {
    const validScore =
      Number(score)

    if (
      !Number.isInteger(validScore) ||
      validScore < 0
    ) {
      throw new Error(
        `${fieldName} debe ser un número entero mayor o igual a cero.`
      )
    }

    return validScore
  }

  function determineWinnerAndLoser(
    match: BracketMatch,
    result: BracketResultInput
  ): {
    winner: BracketParticipant
    loser: BracketParticipant
    homePenaltyScore: number | null
    awayPenaltyScore: number | null
  } {
    const homeScore =
      validateScore(
        result.homeScore,
        "El marcador local"
      )

    const awayScore =
      validateScore(
        result.awayScore,
        "El marcador visitante"
      )

    const homeParticipant:
      BracketParticipant = {
        teamId:
          match.homeTeamId,

        teamName:
          match.homeTeam,

        group: "",
        source:
          match.homeSource
      }

    const awayParticipant:
      BracketParticipant = {
        teamId:
          match.awayTeamId,

        teamName:
          match.awayTeam,

        group: "",
        source:
          match.awaySource
      }

    if (homeScore > awayScore) {
      return {
        winner:
          homeParticipant,

        loser:
          awayParticipant,

        homePenaltyScore: null,
        awayPenaltyScore: null
      }
    }

    if (awayScore > homeScore) {
      return {
        winner:
          awayParticipant,

        loser:
          homeParticipant,

        homePenaltyScore: null,
        awayPenaltyScore: null
      }
    }

    if (
      result.homePenaltyScore ===
        null ||
      result.homePenaltyScore ===
        undefined ||
      result.awayPenaltyScore ===
        null ||
      result.awayPenaltyScore ===
        undefined
    ) {
      throw new Error(
        "Un partido eliminatorio empatado necesita un resultado de penales."
      )
    }

    const homePenaltyScore =
      validateScore(
        result.homePenaltyScore,
        "Los penales del local"
      )

    const awayPenaltyScore =
      validateScore(
        result.awayPenaltyScore,
        "Los penales del visitante"
      )

    if (
      homePenaltyScore ===
      awayPenaltyScore
    ) {
      throw new Error(
        "La tanda de penales no puede terminar empatada."
      )
    }

    return {
      winner:
        homePenaltyScore >
        awayPenaltyScore
          ? homeParticipant
          : awayParticipant,

      loser:
        homePenaltyScore >
        awayPenaltyScore
          ? awayParticipant
          : homeParticipant,

      homePenaltyScore,
      awayPenaltyScore
    }
  }

  async function ensureTargetMatchCanChange(
    targetMatchId: string
  ): Promise<void> {
    if (!targetMatchId) {
      return
    }

    const targetMatch =
      await fetchBracketMatchById(
        targetMatchId
      )

    if (!targetMatch) {
      throw new Error(
        `No se encontró el partido ${targetMatchId}.`
      )
    }

    if (
      targetMatch.status !==
      "Programado"
    ) {
      throw new Error(
        `No se puede cambiar este resultado porque el partido ${targetMatchId} ya comenzó o finalizó.`
      )
    }
  }

  async function assignParticipant(
    targetMatchId: string,
    position:
      | BracketPosition
      | "",
    participant:
      BracketParticipant
  ): Promise<void> {
    if (
      !targetMatchId ||
      !position
    ) {
      return
    }

    await ensureTargetMatchCanChange(
      targetMatchId
    )

    if (position === "home") {
      await updateDocument(
        "matches",
        targetMatchId,
        {
          homeTeamId:
            participant.teamId,

          homeTeam:
            participant.teamName,

          updatedAt:
            new Date()
        }
      )

      return
    }

    await updateDocument(
      "matches",
      targetMatchId,
      {
        awayTeamId:
          participant.teamId,

        awayTeam:
          participant.teamName,

        updatedAt:
          new Date()
      }
    )
  }

  /**
   * Actualiza los puntos de las predicciones
   * sin interrumpir el funcionamiento del bracket.
   */
  async function syncBracketPredictionPoints(
    match: BracketMatch
  ): Promise<void> {
    try {
      await evaluateMatchPredictions(
        match
      )
    } catch (caughtError) {
      error.value =
        "El resultado se guardó, pero no se pudieron actualizar los puntos de las predicciones."

      console.error(
        "[useBracket] syncBracketPredictionPoints:",
        caughtError
      )
    }
  }

  async function saveBracketResult(
    matchId: string,
    result: BracketResultInput
  ): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const match =
        await fetchBracketMatchById(
          matchId
        )

      if (!match) {
        throw new Error(
          "No se encontró el partido del bracket."
        )
      }

      if (
        !match.homeTeamId ||
        !match.awayTeamId
      ) {
        throw new Error(
          "El partido todavía no tiene las dos selecciones asignadas."
        )
      }

      const {
        winner,
        loser,
        homePenaltyScore,
        awayPenaltyScore
      } = determineWinnerAndLoser(
        match,
        result
      )

      /**
       * Si ya existía un ganador diferente,
       * comprobamos que las siguientes rondas
       * todavía no hayan comenzado.
       */
      if (
        match.winnerTeamId &&
        match.winnerTeamId !==
          winner.teamId
      ) {
        await ensureTargetMatchCanChange(
          match.nextMatchId
        )

        await ensureTargetMatchCanChange(
          match.loserNextMatchId
        )
      }

      await updateDocument(
        "matches",
        matchId,
        {
          homeScore:
            validateScore(
              result.homeScore,
              "El marcador local"
            ),

          awayScore:
            validateScore(
              result.awayScore,
              "El marcador visitante"
            ),

          homePenaltyScore,
          awayPenaltyScore,

          winnerTeamId:
            winner.teamId,

          winnerTeam:
            winner.teamName,

          loserTeamId:
            loser.teamId,

          loserTeam:
            loser.teamName,

          status: "Finalizado",

          updatedAt:
            new Date()
        }
      )

      await assignParticipant(
        match.nextMatchId,
        match.nextMatchPosition,
        winner
      )

      await assignParticipant(
        match.loserNextMatchId,
        match.loserNextMatchPosition,
        loser
      )

      await fetchBracketMatches()

      const savedMatch: BracketMatch = {
        ...match,

        homeScore:
          validateScore(
            result.homeScore,
            "El marcador local"
          ),

        awayScore:
          validateScore(
            result.awayScore,
            "El marcador visitante"
          ),

        homePenaltyScore,
        awayPenaltyScore,

        winnerTeamId:
          winner.teamId,

        winnerTeam:
          winner.teamName,

        loserTeamId:
          loser.teamId,

        loserTeam:
          loser.teamName,

        status: "Finalizado"
      }

      await syncBracketPredictionPoints(
        savedMatch
      )
    } catch (caughtError) {
      error.value =
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudo guardar el resultado."

      console.error(
        "[useBracket] saveBracketResult:",
        caughtError
      )

      throw caughtError
    } finally {
      loading.value = false
    }
  }

  async function clearParticipant(
    targetMatchId: string,
    position:
      | BracketPosition
      | "",
    expectedTeamId: string
  ): Promise<void> {
    if (
      !targetMatchId ||
      !position ||
      !expectedTeamId
    ) {
      return
    }

    const targetMatch =
      await fetchBracketMatchById(
        targetMatchId
      )

    if (!targetMatch) {
      return
    }

    if (
      targetMatch.status !==
      "Programado"
    ) {
      throw new Error(
        `No se puede limpiar el resultado porque ${targetMatchId} ya comenzó o finalizó.`
      )
    }

    if (
      position === "home" &&
      targetMatch.homeTeamId ===
        expectedTeamId
    ) {
      await updateDocument(
        "matches",
        targetMatchId,
        {
          homeTeamId: "",
          homeTeam: "",
          updatedAt:
            new Date()
        }
      )

      return
    }

    if (
      position === "away" &&
      targetMatch.awayTeamId ===
        expectedTeamId
    ) {
      await updateDocument(
        "matches",
        targetMatchId,
        {
          awayTeamId: "",
          awayTeam: "",
          updatedAt:
            new Date()
        }
      )
    }
  }

  async function clearBracketResult(
    matchId: string
  ): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const match =
        await fetchBracketMatchById(
          matchId
        )

      if (!match) {
        throw new Error(
          "No se encontró el partido del bracket."
        )
      }

      await clearParticipant(
        match.nextMatchId,
        match.nextMatchPosition,
        match.winnerTeamId
      )

      await clearParticipant(
        match.loserNextMatchId,
        match.loserNextMatchPosition,
        match.loserTeamId
      )

      await updateDocument(
        "matches",
        matchId,
        {
          homeScore: 0,
          awayScore: 0,

          homePenaltyScore: null,
          awayPenaltyScore: null,

          winnerTeamId: "",
          winnerTeam: "",

          loserTeamId: "",
          loserTeam: "",

          status: "Programado",

          updatedAt:
            new Date()
        }
      )

      await fetchBracketMatches()

      const clearedMatch: BracketMatch = {
        ...match,

        homeScore: 0,
        awayScore: 0,

        homePenaltyScore: null,
        awayPenaltyScore: null,

        winnerTeamId: "",
        winnerTeam: "",

        loserTeamId: "",
        loserTeam: "",

        status: "Programado"
      }

      await syncBracketPredictionPoints(
        clearedMatch
      )
    } catch (caughtError) {
      error.value =
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudo limpiar el resultado."

      console.error(
        "[useBracket] clearBracketResult:",
        caughtError
      )

      throw caughtError
    } finally {
      loading.value = false
    }
  }

  async function resetBracket():
    Promise<void> {
    loading.value = true
    error.value = null

    try {
      const storedMatches =
        await getCollection(
          "matches",
          [
            where(
              "isBracketMatch",
              "==",
              true
            )
          ]
        ) as BracketMatch[]

      await Promise.all(
        storedMatches.map(
          match => {
            return deleteDocument(
              "matches",
              match.id
            )
          }
        )
      )

      bracketMatches.value = []
    } catch (caughtError) {
      error.value =
        "No se pudo reiniciar el bracket."

      console.error(
        "[useBracket] resetBracket:",
        caughtError
      )

      throw caughtError
    } finally {
      loading.value = false
    }
  }

  function getMatchesByStage(
    stage: BracketStage
  ): BracketMatch[] {
    return bracketMatches.value.filter(
      match => {
        return match.stage === stage
      }
    )
  }

  const bracketByStage = computed<
    Record<
      BracketStage,
      BracketMatch[]
    >
  >(() => {
    return {
      Dieciseisavos:
        getMatchesByStage(
          "Dieciseisavos"
        ),

      Octavos:
        getMatchesByStage(
          "Octavos"
        ),

      Cuartos:
        getMatchesByStage(
          "Cuartos"
        ),

      Semifinal:
        getMatchesByStage(
          "Semifinal"
        ),

      "Tercer lugar":
        getMatchesByStage(
          "Tercer lugar"
        ),

      Final:
        getMatchesByStage(
          "Final"
        )
    }
  })

  const bracketExists =
    computed<boolean>(() => {
      return (
        bracketMatches.value.length >
        0
      )
    })

  const champion =
    computed<string>(() => {
      const finalMatch =
        bracketByStage.value.Final[0]

      return (
        finalMatch?.winnerTeam ??
        ""
      )
    })

  return {
    bracketMatches,
    bracketByStage,

    bracketExists,
    champion,

    loading,
    error,

    fetchBracketMatches,
    fetchBracketMatchById,

    generateBracket,
    saveBracketResult,
    clearBracketResult,
    resetBracket,

    getMatchesByStage
  }
}