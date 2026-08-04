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
  successMessage.value = ""
}

const saveMatch = async (): Promise<void> => {
  successMessage.value = ""
  standingsSyncError.value = ""

  if (!validateForm()) {
    return
  }

  try {
    saving.value = true

    const matchData = buildMatchData()
    const affectedGroups: string[] = []

    if (editingId.value) {
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
        editingId.value,
        matchData
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

      successMessage.value =
        standingsUpdated
          ? "El partido y la tabla de posiciones fueron actualizados correctamente."
          : "El partido fue actualizado correctamente."
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

<style scoped>
.page-wrapper {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  background: #eef1ec;
}

.manage-page {
  --black: #0b0d0c;
  --lime: #9dca53;
  --lime-dark: #729c34;
  --lime-soft: #edf6df;
  --white: #ffffff;
  --border: #dce1d9;
  --gray: #747c74;
  --text: #171a17;

  flex: 1;
  color: var(--text);
  background:
    radial-gradient(
      circle at 10% 10%,
      rgba(157, 202, 83, 0.11),
      transparent 25%
    ),
    #eef1ec;
}

.main-content {
  width: min(1250px, calc(100% - 48px));
  margin: 0 auto;
  padding: 45px 0 70px;
}

.back-link {
  display: inline-flex;
  margin-bottom: 30px;
  font-size: 12px;
  font-weight: 800;
  color: var(--lime-dark);
  text-decoration: none;
}

.page-header {
  margin-bottom: 35px;
}

.page-label,
.card-label {
  display: block;
  margin-bottom: 8px;
  font-size: 10px;
  font-weight: 900;
  color: var(--lime-dark);
  text-transform: uppercase;
  letter-spacing: 1.4px;
}

.page-header h1 {
  margin: 0 0 12px;
  font-size: clamp(38px, 5vw, 54px);
  letter-spacing: -2px;
}

.page-header p {
  max-width: 650px;
  margin: 0;
  color: var(--gray);
}

.manage-grid {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    minmax(350px, 0.8fr);
  gap: 24px;
  align-items: start;
}

.form-card,
.matches-card {
  padding: 30px;
  border: 1px solid var(--border);
  border-radius: 22px;
  background: var(--white);
  box-shadow: 0 14px 38px rgba(20, 25, 20, 0.07);
}

.card-header {
  display: flex;
  gap: 18px;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 22px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border);
}

.card-header h2 {
  margin: 0;
  font-size: 22px;
}

.card-icon {
  display: grid;
  width: 47px;
  height: 47px;
  place-items: center;
  border-radius: 14px;
  background: var(--lime-soft);
}

.match-form {
  display: grid;
  gap: 21px;
}

.two-columns {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.form-group {
  display: grid;
  gap: 8px;
}

.form-group label {
  font-size: 12px;
  font-weight: 800;
}

.form-group input,
.form-group select {
  width: 100%;
  min-height: 48px;
  padding: 11px 13px;
  font: inherit;
  font-size: 13px;
  border: 1px solid #d5dbd2;
  border-radius: 11px;
  background: var(--white);
}

.form-group input:focus,
.form-group select:focus {
  border-color: var(--lime-dark);
  outline: none;
  box-shadow: 0 0 0 4px rgba(157, 202, 83, 0.18);
}

.form-group input:disabled,
.form-group select:disabled {
  cursor: not-allowed;
  background: #f1f3ef;
}

.message {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 13px;
  border-radius: 11px;
}

.message span {
  display: grid;
  width: 22px;
  height: 22px;
  flex: 0 0 auto;
  font-size: 11px;
  font-weight: 900;
  place-items: center;
  border-radius: 50%;
}

.message p {
  margin: 0;
  font-size: 12px;
}

.error-message {
  color: #842e2e;
  border: 1px solid #efc4c4;
  background: #fff1f1;
}

.error-message span {
  color: white;
  background: #b83a3a;
}

.warning-message {
  color: #745b16;
  border: 1px solid #ead28a;
  background: #fff8df;
}

.warning-message span {
  color: white;
  background: #b28b26;
}

.success-message {
  color: #476325;
  border: 1px solid #cee2ad;
  background: #f0f7e5;
}

.success-message span {
  background: var(--lime);
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.form-actions button {
  min-height: 45px;
  padding: 10px 18px;
  font: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  border-radius: 11px;
}

.cancel-button {
  border: 1px solid var(--border);
  background: white;
}

.save-button {
  color: var(--black);
  border: 1px solid var(--lime);
  background: var(--lime);
}

.save-button:hover:not(:disabled) {
  color: white;
  border-color: var(--black);
  background: var(--black);
}

.form-actions button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.refresh-button {
  padding: 9px 12px;
  font: inherit;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: #f4f5f3;
}

.matches-list {
  display: grid;
  gap: 14px;
  max-height: 830px;
  overflow-y: auto;
}

.match-item {
  padding: 17px;
  border: 1px solid #e0e5dd;
  border-radius: 14px;
  background: #f9faf8;
}

.match-item-header {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.match-item-header > div {
  display: grid;
  gap: 3px;
}

.match-item-header > div > span {
  font-size: 11px;
  font-weight: 900;
  color: var(--lime-dark);
  text-transform: uppercase;
}

.match-item-header small {
  font-size: 10px;
  color: var(--gray);
}

.status {
  padding: 6px 9px;
  font-size: 9px;
  font-weight: 900;
  border-radius: 999px;
}

.scheduled-status {
  color: #596154;
  background: #e9ece6;
}

.live-status {
  color: #8b2929;
  background: #ffe3e3;
}

.finished-status {
  color: #496524;
  background: var(--lime-soft);
}

.match-teams {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 9px;
  align-items: center;
  padding: 18px 0 12px;
  text-align: center;
}

.match-teams strong {
  font-size: 13px;
  overflow-wrap: anywhere;
}

.match-teams span {
  font-size: 12px;
  font-weight: 900;
}

.match-location,
.match-date {
  margin: 4px 0;
  font-size: 10px;
  color: var(--gray);
  text-align: center;
}

.item-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 9px;
  margin-top: 15px;
}

.item-actions button {
  min-height: 38px;
  font: inherit;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  border-radius: 9px;
}

.edit-button {
  border: 1px solid var(--lime);
  background: var(--lime-soft);
}

.delete-button {
  color: #922f2f;
  border: 1px solid #efc5c5;
  background: #fff0f0;
}

.state-box {
  display: grid;
  min-height: 230px;
  text-align: center;
  place-content: center;
}

.state-box strong {
  margin-bottom: 7px;
}

.state-box p {
  max-width: 280px;
  margin: 0;
  font-size: 12px;
  color: var(--gray);
}

.spinner {
  width: 38px;
  height: 38px;
  margin: 0 auto 15px;
  border: 4px solid #dfe3dc;
  border-top-color: var(--lime-dark);
  border-radius: 50%;
  animation: spin 700ms linear infinite;
}

.empty-icon {
  margin-bottom: 13px;
  font-size: 30px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 950px) {
  .manage-grid {
    grid-template-columns: 1fr;
  }

  .matches-list {
    max-height: none;
  }
}

@media (max-width: 600px) {
  .main-content {
    width: min(100% - 28px, 1250px);
  }

  .two-columns {
    grid-template-columns: 1fr;
  }

  .form-card,
  .matches-card {
    padding: 21px;
  }

  .form-actions {
    display: grid;
  }

  .form-actions button {
    width: 100%;
  }
}
</style>