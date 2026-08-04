<template>
  <div class="page-wrapper">
    <AppHeader
      :loading="loadingAuth || saving"
      @logout="logout"
    />

    <main class="manage-page">
      <section class="main-content">
        <NuxtLink
          to="/matches"
          class="back-link"
        >
          ← Volver a partidos
        </NuxtLink>

        <header class="page-header">
          <div>
            <span class="page-label">
              Administración
            </span>

            <h1>Gestionar partidos</h1>

            <p>
              Crea, modifica y elimina los partidos registrados
              para el Mundial 2026.
            </p>
          </div>
        </header>

        <section class="manage-grid">
          <!-- Formulario -->
          <article class="form-card">
            <div class="card-header">
              <div>
                <span class="card-label">
                  {{
                    editingId
                      ? "Editar partido"
                      : "Nuevo partido"
                  }}
                </span>

                <h2>
                  {{
                    editingId
                      ? "Actualizar información"
                      : "Registrar encuentro"
                  }}
                </h2>
              </div>

              <div class="card-icon">
                ⚽
              </div>
            </div>

            <form
              class="match-form"
              @submit.prevent="saveMatch"
            >
              <!-- Fase y grupo -->
              <div class="two-columns">
                <div class="form-group">
                  <label for="stage">
                    Fase
                  </label>

                  <select
                    id="stage"
                    v-model="form.stage"
                    :disabled="saving"
                  >
                    <option value="">
                      Selecciona una fase
                    </option>

                    <option
                      v-for="stage in stages"
                      :key="stage"
                      :value="stage"
                    >
                      {{ stage }}
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="group">
                    Grupo
                  </label>

                  <select
                    id="group"
                    v-model="form.group"
                    :disabled="
                      saving ||
                      form.stage !== 'Fase de grupos'
                    "
                  >
                    <option value="">
                      {{
                        form.stage === "Fase de grupos"
                          ? "Selecciona un grupo"
                          : "No aplica"
                      }}
                    </option>

                    <option
                      v-for="group in groups"
                      :key="group"
                      :value="group"
                    >
                      Grupo {{ group }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Selecciones -->
              <div class="two-columns">
                <div class="form-group">
                  <label for="homeTeamId">
                    Selección local
                  </label>

                  <select
                    id="homeTeamId"
                    v-model="form.homeTeamId"
                    :disabled="
                      saving ||
                      loadingTeams ||
                      requiresGroupSelection
                    "
                  >
                    <option value="">
                      {{
                        requiresGroupSelection
                          ? "Selecciona primero un grupo"
                          : "Selecciona el equipo local"
                      }}
                    </option>

                    <option
                      v-for="team in availableHomeTeams"
                      :key="team.id"
                      :value="team.id"
                    >
                      {{ team.name }}
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="awayTeamId">
                    Selección visitante
                  </label>

                  <select
                    id="awayTeamId"
                    v-model="form.awayTeamId"
                    :disabled="
                      saving ||
                      loadingTeams ||
                      requiresGroupSelection
                    "
                  >
                    <option value="">
                      {{
                        requiresGroupSelection
                          ? "Selecciona primero un grupo"
                          : "Selecciona el equipo visitante"
                      }}
                    </option>

                    <option
                      v-for="team in availableAwayTeams"
                      :key="team.id"
                      :value="team.id"
                    >
                      {{ team.name }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Estadio y ciudad -->
              <div class="two-columns">
                <div class="form-group">
                  <label for="stadium">
                    Estadio
                  </label>

                  <input
                    id="stadium"
                    v-model.trim="form.stadium"
                    type="text"
                    placeholder="Ejemplo: MetLife Stadium"
                    :disabled="saving"
                  >
                </div>

                <div class="form-group">
                  <label for="city">
                    Ciudad
                  </label>

                  <input
                    id="city"
                    v-model.trim="form.city"
                    type="text"
                    placeholder="Ejemplo: Nueva York"
                    :disabled="saving"
                  >
                </div>
              </div>

              <!-- Fecha y hora -->
              <div class="two-columns">
                <div class="form-group">
                  <label for="kickoffDate">
                    Fecha
                  </label>

                  <input
                    id="kickoffDate"
                    v-model="form.kickoffDate"
                    type="date"
                    :disabled="saving"
                  >
                </div>

                <div class="form-group">
                  <label for="kickoffTime">
                    Hora
                  </label>

                  <input
                    id="kickoffTime"
                    v-model="form.kickoffTime"
                    type="time"
                    :disabled="saving"
                  >
                </div>
              </div>

              <!-- Estado -->
              <div class="form-group">
                <label for="status">
                  Estado
                </label>

                <select
                  id="status"
                  v-model="form.status"
                  :disabled="saving"
                >
                  <option
                    v-for="status in statuses"
                    :key="status"
                    :value="status"
                  >
                    {{ status }}
                  </option>
                </select>
              </div>

              <!-- Marcador -->
              <div class="two-columns">
                <div class="form-group">
                  <label for="homeScore">
                    Goles del local
                  </label>

                  <input
                    id="homeScore"
                    v-model.number="form.homeScore"
                    type="number"
                    min="0"
                    :disabled="
                      saving ||
                      form.status === 'Programado'
                    "
                  >
                </div>

                <div class="form-group">
                  <label for="awayScore">
                    Goles del visitante
                  </label>

                  <input
                    id="awayScore"
                    v-model.number="form.awayScore"
                    type="number"
                    min="0"
                    :disabled="
                      saving ||
                      form.status === 'Programado'
                    "
                  >
                </div>
              </div>

              <div
                v-if="formError"
                class="message error-message"
                role="alert"
              >
                <span>!</span>
                <p>{{ formError }}</p>
              </div>

              <div
                v-if="matchesError"
                class="message error-message"
                role="alert"
              >
                <span>!</span>
                <p>{{ matchesError }}</p>
              </div>

              <div
                v-if="standingsSyncError"
                class="message warning-message"
                role="alert"
              >
                <span>!</span>
                <p>{{ standingsSyncError }}</p>
              </div>
              
              <div
                v-if="predictionSyncError"
                class="message warning-message"
                role="alert"
              >
                <span>!</span>
                <p>{{ predictionSyncError }}</p>
              </div>

              <div
                v-if="successMessage"
                class="message success-message"
                role="status"
              >
                <span>✓</span>
                <p>{{ successMessage }}</p>
              </div>

              <div class="form-actions">
                <button
                  v-if="editingId"
                  type="button"
                  class="cancel-button"
                  :disabled="saving"
                  @click="resetForm"
                >
                  Cancelar edición
                </button>

                <button
                  type="submit"
                  class="save-button"
                  :disabled="
                    saving ||
                    loadingTeams
                  "
                >
                  {{
                    saving
                      ? "Guardando y actualizando tabla..."
                      : editingId
                        ? "Actualizar partido"
                        : "Crear partido"
                  }}
                </button>
              </div>
            </form>
          </article>

          <!-- Lista -->
          <aside class="matches-card">
            <div class="card-header">
              <div>
                <span class="card-label">
                  Partidos registrados
                </span>

                <h2>Lista de encuentros</h2>
              </div>

              <button
                type="button"
                class="refresh-button"
                :disabled="loadingMatches || saving"
                @click="refetchMatches"
              >
                Recargar
              </button>
            </div>

            <div
              v-if="
                loadingMatches &&
                matches.length === 0
              "
              class="state-box"
            >
              <span class="spinner" />
              <p>Cargando partidos...</p>
            </div>

            <div
              v-else-if="
                matchesError &&
                matches.length === 0
              "
              class="state-box"
            >
              <strong>No se pudieron cargar</strong>
              <p>{{ matchesError }}</p>
            </div>

            <div
              v-else-if="matches.length === 0"
              class="state-box"
            >
              <span class="empty-icon">⚽</span>

              <strong>No hay partidos registrados</strong>

              <p>
                Utiliza el formulario para crear el primer
                encuentro.
              </p>
            </div>

            <div
              v-else
              class="matches-list"
            >
              <article
                v-for="match in matches"
                :key="match.id"
                class="match-item"
              >
                <div class="match-item-header">
                  <div>
                    <span>
                      {{ match.stage }}
                    </span>

                    <small v-if="match.group">
                      Grupo {{ match.group }}
                    </small>
                  </div>

                  <span
                    class="status"
                    :class="
                      getStatusClass(match.status)
                    "
                  >
                    {{ match.status }}
                  </span>
                </div>

                <div class="match-teams">
                  <strong>
                    {{ match.homeTeam }}
                  </strong>

                  <span>
                    {{
                      match.status === "Programado"
                        ? "VS"
                        : `${match.homeScore} - ${match.awayScore}`
                    }}
                  </span>

                  <strong>
                    {{ match.awayTeam }}
                  </strong>
                </div>

                <p class="match-location">
                  {{ match.stadium }} · {{ match.city }}
                </p>

                <p class="match-date">
                  {{ formatKickoff(match.kickoff) }}
                </p>

                <div class="item-actions">
                  <button
                    type="button"
                    class="edit-button"
                    :disabled="saving"
                    @click="startEditing(match)"
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    class="delete-button"
                    :disabled="saving"
                    @click="removeMatch(match)"
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            </div>
          </aside>
        </section>
      </section>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { Timestamp } from "firebase/firestore"

import { useAuth } from "../../composables/useAuth"
import { useTeams } from "../../composables/useTeams"
import { useStandings } from "../../composables/useStandings"
import { usePredictionScoring } from "../../composables/usePredictionScoring"

import {
  useMatches,
  type Match,
  type MatchInput,
  type MatchStage,
  type MatchStatus
} from "../../composables/useMatches"

type MatchForm = {
  homeTeamId: string
  awayTeamId: string
  group: string
  stage: MatchStage | ""
  stadium: string
  city: string
  kickoffDate: string
  kickoffTime: string
  homeScore: number
  awayScore: number
  status: MatchStatus
}

type MatchWithOptionalIds = Match & {
  homeTeamId?: string
  awayTeamId?: string
}

const {
  currentUser,
  loadingAuth,
  initAuth,
  logout
} = useAuth()

const {
  teams,
  loading: loadingTeams,
  fetchTeams
} = useTeams()

const {
  matches,
  loading: loadingMatches,
  error: matchesError,
  fetchMatches,
  createMatch,
  updateMatch,
  deleteMatch,
  refetchMatches
} = useMatches()

const {
  recalculateGroupStandings
} = useStandings()

const {
  evaluateMatchPredictions
} = usePredictionScoring()

const stages: MatchStage[] = [
  "Fase de grupos",
  "Dieciseisavos",
  "Octavos",
  "Cuartos",
  "Semifinal",
  "Tercer lugar",
  "Final"
]

const statuses: MatchStatus[] = [
  "Programado",
  "En Vivo",
  "Finalizado"
]

const groups = [
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
]

const createEmptyForm = (): MatchForm => ({
  homeTeamId: "",
  awayTeamId: "",
  group: "",
  stage: "",
  stadium: "",
  city: "",
  kickoffDate: "",
  kickoffTime: "",
  homeScore: 0,
  awayScore: 0,
  status: "Programado"
})

const form = reactive<MatchForm>(
  createEmptyForm()
)

const editingId = ref<string | null>(null)

/**
 * Guarda una copia del partido que se está editando.
 *
 * Esto permite recalcular el grupo anterior cuando:
 *
 * - El partido cambia de grupo.
 * - El partido deja de ser de fase de grupos.
 */
const originalEditingMatch = ref<Match | null>(
  null
)

const saving = ref(false)
const formError = ref("")
const successMessage = ref("")
const standingsSyncError = ref("")
const predictionSyncError = ref("")

const requiresGroupSelection = computed<boolean>(() => {
  return (
    form.stage === "Fase de grupos" &&
    !form.group
  )
})

const selectableTeams = computed(() => {
  if (
    form.stage === "Fase de grupos" &&
    form.group
  ) {
    return teams.value.filter(
      team => team.group === form.group
    )
  }

  return teams.value
})

const availableHomeTeams = computed(() => {
  return selectableTeams.value.filter(
    team => team.id !== form.awayTeamId
  )
})

const availableAwayTeams = computed(() => {
  return selectableTeams.value.filter(
    team => team.id !== form.homeTeamId
  )
})

const getTeamById = (
  teamId: string
) => {
  return teams.value.find(
    team => team.id === teamId
  )
}

const getTeamIdByName = (
  teamName: string
): string => {
  return (
    teams.value.find(
      team => team.name === teamName
    )?.id ?? ""
  )
}

/**
 * Devuelve el grupo que debe recalcularse
 * para un partido de fase de grupos.
 */
const getStandingGroup = (
  match: {
    stage: MatchStage
    group: string
  }
): string => {
  if (
    match.stage !== "Fase de grupos" ||
    !match.group
  ) {
    return ""
  }

  return match.group
    .trim()
    .toUpperCase()
}

/**
 * Recalcula todos los grupos afectados.
 *
 * Set evita recalcular dos veces el mismo grupo.
 */
const recalculateAffectedGroups = async (
  affectedGroups: string[]
): Promise<boolean> => {
  const uniqueGroups = [
    ...new Set(
      affectedGroups
        .map(group => {
          return group
            .trim()
            .toUpperCase()
        })
        .filter(group => group !== "")
    )
  ]

  if (uniqueGroups.length === 0) {
    return true
  }

  try {
    for (const group of uniqueGroups) {
      await recalculateGroupStandings(
        group
      )
    }

    return true
  } catch (caughtError) {
    standingsSyncError.value =
      "El partido sí fue guardado, pero no se pudo actualizar automáticamente la tabla de posiciones. Puedes recalcularla desde la página del grupo."

    console.error(
      "[manage matches] recalculateAffectedGroups:",
      caughtError
    )

    return false
  }
}

const getKickoffDate = (
  kickoff: unknown
): Date | null => {
  if (
    typeof kickoff === "object" &&
    kickoff !== null &&
    "toDate" in kickoff
  ) {
    const value = kickoff as {
      toDate?: () => Date
    }

    if (typeof value.toDate === "function") {
      return value.toDate()
    }
  }

  if (kickoff instanceof Date) {
    return kickoff
  }

  return null
}

const formatDateInput = (
  kickoff: unknown
): string => {
  const date = getKickoffDate(kickoff)

  if (!date) {
    return ""
  }

  const year = date.getFullYear()

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0")

  const day = String(
    date.getDate()
  ).padStart(2, "0")

  return `${year}-${month}-${day}`
}

const formatTimeInput = (
  kickoff: unknown
): string => {
  const date = getKickoffDate(kickoff)

  if (!date) {
    return ""
  }

  const hours = String(
    date.getHours()
  ).padStart(2, "0")

  const minutes = String(
    date.getMinutes()
  ).padStart(2, "0")

  return `${hours}:${minutes}`
}

const formatKickoff = (
  kickoff: unknown
): string => {
  const date = getKickoffDate(kickoff)

  if (!date) {
    return "Fecha no disponible"
  }

  return new Intl.DateTimeFormat(
    "es-CR",
    {
      dateStyle: "medium",
      timeStyle: "short"
    }
  ).format(date)
}

const validateForm = (): boolean => {
  formError.value = ""

  if (
    !form.homeTeamId ||
    !form.awayTeamId
  ) {
    formError.value =
      "Debes seleccionar ambos equipos."

    return false
  }

  if (
    form.homeTeamId ===
    form.awayTeamId
  ) {
    formError.value =
      "El equipo local y visitante deben ser diferentes."

    return false
  }

  const homeTeam = getTeamById(
    form.homeTeamId
  )

  const awayTeam = getTeamById(
    form.awayTeamId
  )

  if (!homeTeam || !awayTeam) {
    formError.value =
      "Una de las selecciones escogidas no existe."

    return false
  }

  if (!form.stage) {
    formError.value =
      "Debes seleccionar la fase del partido."

    return false
  }

  if (
    form.stage === "Fase de grupos" &&
    !form.group
  ) {
    formError.value =
      "Debes seleccionar el grupo del partido."

    return false
  }

  if (
    form.stage === "Fase de grupos" &&
    (
      homeTeam.group !== form.group ||
      awayTeam.group !== form.group
    )
  ) {
    formError.value =
      "Ambas selecciones deben pertenecer al grupo seleccionado."

    return false
  }

  if (!form.stadium.trim()) {
    formError.value =
      "Debes escribir el estadio."

    return false
  }

  if (!form.city.trim()) {
    formError.value =
      "Debes escribir la ciudad."

    return false
  }

  if (
    !form.kickoffDate ||
    !form.kickoffTime
  ) {
    formError.value =
      "Debes seleccionar la fecha y la hora."

    return false
  }

  if (
    form.homeScore < 0 ||
    form.awayScore < 0
  ) {
    formError.value =
      "Los marcadores no pueden ser negativos."

    return false
  }

  return true
}

const buildMatchData = (): MatchInput => {
  const homeTeam = getTeamById(
    form.homeTeamId
  )

  const awayTeam = getTeamById(
    form.awayTeamId
  )

  if (!homeTeam || !awayTeam) {
    throw new Error(
      "No se pudieron encontrar las selecciones."
    )
  }

  const kickoffDate = new Date(
    `${form.kickoffDate}T${form.kickoffTime}:00`
  )

  const matchData = {
    homeTeamId: homeTeam.id,
    homeTeam: homeTeam.name,

    awayTeamId: awayTeam.id,
    awayTeam: awayTeam.name,

    group:
      form.stage === "Fase de grupos"
        ? form.group
        : "",

    stage: form.stage as MatchStage,
    stadium: form.stadium.trim(),
    city: form.city.trim(),
    kickoff: Timestamp.fromDate(
      kickoffDate
    ),

    homeScore:
      form.status === "Programado"
        ? 0
        : Number(form.homeScore),

    awayScore:
      form.status === "Programado"
        ? 0
        : Number(form.awayScore),

    status: form.status
  }

  return matchData as MatchInput
}

const resetForm = (): void => {
  Object.assign(
    form,
    createEmptyForm()
  )

  editingId.value = null
  originalEditingMatch.value = null

  formError.value = ""
  standingsSyncError.value = ""
  predictionSyncError.value = ""
  successMessage.value = ""
}

/**
 * Calcula o corrige los puntos obtenidos
 * por las predicciones del partido guardado.
 */
const evaluateSavedMatchPredictions = async (
  match: Match
): Promise<boolean> => {
  try {
    await evaluateMatchPredictions(match)

    return true
  } catch (caughtError) {
    predictionSyncError.value =
      "El partido fue guardado, pero no se pudieron actualizar automáticamente los puntos de las predicciones."

    console.error(
      "[manage matches] evaluateSavedMatchPredictions:",
      caughtError
    )

    return false
  }
}

const saveMatch = async (): Promise<void> => {
  successMessage.value = ""
  standingsSyncError.value = ""
  predictionSyncError.value = ""

  if (!validateForm()) {
    return
  }

  try {
    saving.value = true

    const matchData = buildMatchData()
    const affectedGroups: string[] = []

    if (editingId.value) {
      /*
       * Se conserva el ID en una constante porque
       * editingId puede cambiar después de guardar.
       */
      const matchId = editingId.value

      /**
       * Guarda el grupo anterior.
       *
       * Es necesario si el partido cambia
       * de grupo o de fase.
       */
      if (originalEditingMatch.value) {
        const previousGroup =
          getStandingGroup(
            originalEditingMatch.value
          )

        if (previousGroup) {
          affectedGroups.push(
            previousGroup
          )
        }
      }

      await updateMatch(
        matchId,
        matchData
      )

      /*
       * Construye el partido actualizado con su ID
       * para calcular los puntos de las predicciones.
       */
      const updatedMatch: Match = {
        id: matchId,
        ...matchData
      }

      const predictionPointsUpdated =
        await evaluateSavedMatchPredictions(
          updatedMatch
        )

      const newGroup =
        getStandingGroup(matchData)

      if (newGroup) {
        affectedGroups.push(
          newGroup
        )
      }

      const standingsUpdated =
        await recalculateAffectedGroups(
          affectedGroups
        )

      if (
        standingsUpdated &&
        predictionPointsUpdated
      ) {
        successMessage.value =
          "El partido, la tabla de posiciones y los puntos de las predicciones fueron actualizados correctamente."
      } else if (standingsUpdated) {
        successMessage.value =
          "El partido y la tabla de posiciones fueron actualizados correctamente."
      } else if (predictionPointsUpdated) {
        successMessage.value =
          "El partido y los puntos de las predicciones fueron actualizados correctamente."
      } else {
        successMessage.value =
          "El partido fue actualizado correctamente."
      }
    } else {
      await createMatch(matchData)

      const newGroup =
        getStandingGroup(matchData)

      if (newGroup) {
        affectedGroups.push(
          newGroup
        )
      }

      const standingsUpdated =
        await recalculateAffectedGroups(
          affectedGroups
        )

      successMessage.value =
        standingsUpdated
          ? "El partido fue creado y la tabla de posiciones fue actualizada."
          : "El partido fue creado correctamente."
    }

    Object.assign(
      form,
      createEmptyForm()
    )

    editingId.value = null
    originalEditingMatch.value = null
  } catch (caughtError) {
    formError.value =
      caughtError instanceof Error
        ? caughtError.message
        : "No se pudo guardar el partido."

    console.error(
      "[manage matches] saveMatch:",
      caughtError
    )
  } finally {
    saving.value = false
  }
}

const startEditing = (
  match: Match
): void => {
  const matchWithIds =
    match as MatchWithOptionalIds

  editingId.value = match.id

  /**
   * Conserva el grupo y la fase anteriores
   * antes de que el usuario los modifique.
   */
  originalEditingMatch.value = {
    ...match
  }

  form.group = match.group
  form.stage = match.stage

  form.homeTeamId =
    matchWithIds.homeTeamId ||
    getTeamIdByName(match.homeTeam)

  form.awayTeamId =
    matchWithIds.awayTeamId ||
    getTeamIdByName(match.awayTeam)

  form.stadium = match.stadium
  form.city = match.city

  form.kickoffDate =
    formatDateInput(match.kickoff)

  form.kickoffTime =
    formatTimeInput(match.kickoff)

  form.homeScore = match.homeScore
  form.awayScore = match.awayScore
  form.status = match.status

  formError.value = ""
  standingsSyncError.value = ""
  predictionSyncError.value = ""
  successMessage.value = ""

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  })
}

const removeMatch = async (
  match: Match
): Promise<void> => {
  const confirmed = window.confirm(
    `¿Deseas eliminar el partido ${match.homeTeam} vs ${match.awayTeam}?`
  )

  if (!confirmed) {
    return
  }

  successMessage.value = ""
  formError.value = ""
  standingsSyncError.value = ""
  predictionSyncError.value = ""

  try {
    saving.value = true

    const affectedGroup =
      getStandingGroup(match)

    await deleteMatch(match.id)

    const standingsUpdated =
      await recalculateAffectedGroups(
        affectedGroup
          ? [affectedGroup]
          : []
      )

    if (editingId.value === match.id) {
      Object.assign(
        form,
        createEmptyForm()
      )

      editingId.value = null
      originalEditingMatch.value = null
    }

    successMessage.value =
      standingsUpdated
        ? "El partido fue eliminado y la tabla de posiciones fue actualizada."
        : "El partido fue eliminado correctamente."
  } catch (caughtError) {
    formError.value =
      caughtError instanceof Error
        ? caughtError.message
        : "No se pudo eliminar el partido."

    console.error(
      "[manage matches] removeMatch:",
      caughtError
    )
  } finally {
    saving.value = false
  }
}

const getStatusClass = (
  status: MatchStatus
): string => {
  if (status === "En Vivo") {
    return "live-status"
  }

  if (status === "Finalizado") {
    return "finished-status"
  }

  return "scheduled-status"
}

watch(
  () => form.stage,
  stage => {
    if (stage !== "Fase de grupos") {
      form.group = ""
    }
  }
)

watch(
  () => form.group,
  group => {
    if (
      form.stage !== "Fase de grupos" ||
      !group
    ) {
      return
    }

    const homeTeam = getTeamById(
      form.homeTeamId
    )

    const awayTeam = getTeamById(
      form.awayTeamId
    )

    if (
      homeTeam &&
      homeTeam.group !== group
    ) {
      form.homeTeamId = ""
    }

    if (
      awayTeam &&
      awayTeam.group !== group
    ) {
      form.awayTeamId = ""
    }
  }
)

watch(
  () => form.status,
  status => {
    if (status === "Programado") {
      form.homeScore = 0
      form.awayScore = 0
    }
  }
)

watch(
  [loadingAuth, currentUser],
  async ([loading, user]) => {
    if (!loading && !user) {
      await navigateTo("/login")
    }
  }
)

useHead({
  title:
    "Gestionar partidos | World Cup Tracker 2026"
})

onMounted(async () => {
  initAuth()

  await Promise.all([
    fetchTeams(),
    fetchMatches()
  ])
})
</script>