<template>
  <div class="page-wrapper">
    <AppHeader
      :loading="loadingAuth"
      @logout="logout"
    />

    <main class="predictions-page">
      <section class="main-content">
        <section
          v-if="pageLoading"
          class="state-card"
        >
          <span class="spinner" />

          <h1>Cargando predicciones</h1>

          <p>
            Estamos preparando los partidos disponibles y tus
            selecciones guardadas.
          </p>
        </section>

        <template v-else-if="currentUser">
          <header class="page-header">
            <div>
              <span class="page-label">
                Mundial 2026
              </span>

              <h1>Predicciones</h1>

              <p>
                Elige a la selección campeona y pronostica el
                marcador de los encuentros disponibles.
              </p>
            </div>

            <div class="user-badge">
              <span>{{ userInitial }}</span>

              <div>
                <small>Predicciones de</small>
                <strong>
                  {{ currentUser.name || "Usuario" }}
                </strong>
              </div>
            </div>
          </header>

          <section class="summary-grid">
            <article class="summary-card">
              <span class="summary-icon">⚽</span>

              <div>
                <strong>{{ predictableMatches.length }}</strong>
                <small>Partidos disponibles</small>
              </div>
            </article>

            <article class="summary-card">
              <span class="summary-icon">✓</span>

              <div>
                <strong>{{ matchPredictions.length }}</strong>
                <small>Marcadores guardados</small>
              </div>
            </article>

            <article class="summary-card champion-summary">
              <span class="summary-icon">♛</span>

              <div>
                <strong>{{ championSummary }}</strong>
                <small>Selección campeona</small>
              </div>
            </article>
          </section>

          <div
            v-if="displayError"
            class="message error-message"
            role="alert"
          >
            <span>!</span>
            <p>{{ displayError }}</p>
          </div>

          <div
            v-if="successMessage"
            class="message success-message"
            role="status"
          >
            <span>✓</span>
            <p>{{ successMessage }}</p>
          </div>

          <section class="champion-card">
            <div class="champion-copy">
              <span class="champion-label">
                Predicción general
              </span>

              <h2>¿Quién será campeón?</h2>

              <p>
                Selecciona una de las 48 selecciones. Puedes
                cambiar tu elección y volver a guardarla.
              </p>

              <div
                v-if="championPrediction"
                class="current-champion"
              >
                <span aria-hidden="true">
                  {{ championFlag }}
                </span>

                <p>
                  Tu selección actual:
                  <strong>
                    {{ championPrediction.championTeam }}
                  </strong>
                </p>
              </div>
            </div>

            <form
              class="champion-form"
              @submit.prevent="saveChampion"
            >
              <label for="championTeam">
                Selección campeona
              </label>

              <p
                v-if="loadingTeams"
                class="field-state"
              >
                Cargando selecciones...
              </p>

              <select
                v-else
                id="championTeam"
                v-model="selectedChampionId"
                :disabled="
                  savingPrediction ||
                  sortedTeams.length === 0
                "
              >
                <option value="">
                  Selecciona un equipo
                </option>

                <option
                  v-for="team in sortedTeams"
                  :key="team.id"
                  :value="team.id"
                >
                  {{ team.flag || "🏳️" }} {{ team.name }}
                </option>
              </select>

              <button
                type="submit"
                :disabled="
                  savingPrediction ||
                  !selectedChampionId ||
                  loadingTeams
                "
              >
                <span aria-hidden="true">♛</span>

                {{ championButtonText }}
              </button>
            </form>
          </section>

          <section class="matches-section">
            <header class="section-header">
              <div>
                <span class="section-label">
                  Marcadores
                </span>

                <h2>Partidos para predecir</h2>

                <p>
                  Se muestran únicamente encuentros Programados
                  o En Vivo que ya tengan ambos equipos.
                </p>
              </div>

              <div class="status-counts">
                <span>
                  <strong>{{ scheduledCount }}</strong>
                  Programados
                </span>

                <span class="live-count">
                  <strong>{{ liveCount }}</strong>
                  En Vivo
                </span>
              </div>
            </header>

            <section class="filters-card">
              <div class="filter-group search-group">
                <label for="predictionSearch">
                  Buscar partido
                </label>

                <input
                  id="predictionSearch"
                  v-model="search"
                  type="search"
                  placeholder="Selección, fase o estadio"
                >
              </div>

              <div class="filter-group">
                <label for="predictionStatus">
                  Estado
                </label>

                <select
                  id="predictionStatus"
                  v-model="selectedStatus"
                >
                  <option value="">
                    Todos los disponibles
                  </option>

                  <option value="Programado">
                    Programado
                  </option>

                  <option value="En Vivo">
                    En Vivo
                  </option>
                </select>
              </div>

              <button
                v-if="hasActiveFilters"
                type="button"
                class="clear-button"
                @click="clearFilters"
              >
                Limpiar
              </button>
            </section>

            <section
              v-if="loadingMatches"
              class="state-card compact-state"
            >
              <span class="spinner" />
              <h2>Cargando partidos</h2>
            </section>

            <section
              v-else-if="matchesError"
              class="state-card compact-state"
            >
              <span class="state-icon error-icon">!</span>

              <h2>No se pudieron cargar los partidos</h2>

              <p>{{ matchesError }}</p>

              <button
                type="button"
                class="retry-button"
                @click="fetchMatches"
              >
                Volver a intentar
              </button>
            </section>

            <section
              v-else-if="predictableMatches.length === 0"
              class="state-card compact-state"
            >
              <span class="state-icon">⚽</span>

              <h2>No hay partidos disponibles</h2>

              <p>
                En este momento no existen partidos Programados
                o En Vivo con ambos equipos asignados.
              </p>
            </section>

            <section
              v-else-if="filteredMatches.length === 0"
              class="state-card compact-state"
            >
              <span class="state-icon">⌕</span>

              <h2>No encontramos coincidencias</h2>

              <p>
                Cambia la búsqueda o limpia el filtro de estado.
              </p>

              <button
                type="button"
                class="retry-button"
                @click="clearFilters"
              >
                Limpiar filtros
              </button>
            </section>

            <section
              v-else
              class="matches-grid"
            >
              <article
                v-for="match in filteredMatches"
                :key="match.id"
                class="match-card"
              >
                <div class="match-card-header">
                  <div>
                    <span class="match-stage">
                      {{ match.stage }}
                    </span>

                    <small v-if="match.group">
                      Grupo {{ match.group }}
                    </small>
                  </div>

                  <span
                    class="status-badge"
                    :class="getStatusClass(match.status)"
                  >
                    {{ match.status }}
                  </span>
                </div>

                <div class="match-teams">
                  <div class="team-block">
                    <span class="team-flag">
                      {{ getTeamFlag(match.homeTeamId) }}
                    </span>

                    <small>Local</small>

                    <strong>{{ match.homeTeam }}</strong>
                  </div>

                  <span class="versus">VS</span>

                  <div class="team-block away-team">
                    <span class="team-flag">
                      {{ getTeamFlag(match.awayTeamId) }}
                    </span>

                    <small>Visitante</small>

                    <strong>{{ match.awayTeam }}</strong>
                  </div>
                </div>

                <div class="match-details">
                  <span>
                    <small>Fecha</small>
                    <strong>{{ formatDate(match.kickoff) }}</strong>
                  </span>

                  <span>
                    <small>Hora</small>
                    <strong>{{ formatTime(match.kickoff) }}</strong>
                  </span>

                  <span>
                    <small>Sede</small>
                    <strong>
                      {{ match.stadium || "Por definir" }}
                    </strong>
                  </span>
                </div>

                <div
                  v-if="hasChangedTeams(match)"
                  class="teams-warning"
                >
                  Los participantes cambiaron. Guarda un nuevo
                  marcador para este cruce.
                </div>

                <form
                  v-if="predictionDrafts[match.id]"
                  class="score-form"
                  @submit.prevent="saveMatch(match)"
                >
                  <div class="score-inputs">
                    <label>
                      <span>{{ match.homeTeam }}</span>

                      <input
                        v-model.number="
                          predictionDrafts[match.id]!.home
                        "
                        type="number"
                        min="0"
                        max="99"
                        step="1"
                        inputmode="numeric"
                        :aria-label="
                          `Goles pronosticados para ${match.homeTeam}`
                        "
                        :disabled="savingPrediction"
                        placeholder="0"
                      >
                    </label>

                    <span class="score-separator">-</span>

                    <label>
                      <span>{{ match.awayTeam }}</span>

                      <input
                        v-model.number="
                          predictionDrafts[match.id]!.away
                        "
                        type="number"
                        min="0"
                        max="99"
                        step="1"
                        inputmode="numeric"
                        :aria-label="
                          `Goles pronosticados para ${match.awayTeam}`
                        "
                        :disabled="savingPrediction"
                        placeholder="0"
                      >
                    </label>
                  </div>

                  <button
                    type="submit"
                    class="save-prediction-button"
                    :disabled="savingPrediction"
                  >
                    {{ getMatchButtonText(match) }}
                  </button>
                </form>
              </article>
            </section>
          </section>
        </template>
      </section>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import type { Timestamp } from "firebase/firestore"

import type { Match } from "../../composables/useMatches"

import { useAuth } from "../../composables/useAuth"
import { useMatches } from "../../composables/useMatches"
import { useTeams } from "../../composables/useTeams"
import { usePredictions } from "../../composables/usePredictions"

type PredictionDraft = {
  home: number | ""
  away: number | ""
}

const {
  currentUser,
  loadingAuth,
  initAuth,
  logout
} = useAuth()

const {
  matches,
  loading: loadingMatches,
  error: matchesError,
  fetchMatches
} = useMatches()

const {
  teams,
  loading: loadingTeams,
  error: teamsError,
  fetchTeams
} = useTeams()

const {
  matchPredictions,
  championPrediction,
  loadingPredictions,
  savingPrediction,
  predictionsError,
  isMatchPredictable,
  clearPredictions,
  fetchPredictionsByUser,
  getMatchPrediction,
  saveMatchPrediction,
  saveChampionPrediction
} = usePredictions()

const hydrated = ref(false)
const loadingUserData = ref(false)
const selectedChampionId = ref("")
const search = ref("")
const selectedStatus = ref("")
const localError = ref("")
const successMessage = ref("")
const savingMatchId = ref("")
const savingChampion = ref(false)

const predictionDrafts = reactive<
  Record<string, PredictionDraft>
>({})

let loadRequest = 0

const pageLoading = computed<boolean>(() => {
  return (
    !hydrated.value ||
    loadingAuth.value ||
    loadingUserData.value ||
    loadingPredictions.value
  )
})

const userInitial = computed<string>(() => {
  const name = currentUser.value?.name?.trim()

  return name
    ? name.charAt(0).toUpperCase()
    : "U"
})

const sortedTeams = computed(() => {
  return teams.value
    .filter(team => {
      return Boolean(
        team.id?.trim() &&
        team.name?.trim()
      )
    })
    .sort((firstTeam, secondTeam) => {
      return firstTeam.name.localeCompare(
        secondTeam.name,
        "es"
      )
    })
})

const predictableMatches = computed<Match[]>(() => {
  return matches.value.filter(isMatchPredictable)
})

const filteredMatches = computed<Match[]>(() => {
  const normalizedSearch = search.value
    .trim()
    .toLowerCase()

  return predictableMatches.value.filter(match => {
    const matchesStatus =
      selectedStatus.value === "" ||
      match.status === selectedStatus.value

    const searchableText = [
      match.homeTeam,
      match.awayTeam,
      match.stage,
      match.group,
      match.stadium,
      match.city
    ]
      .join(" ")
      .toLowerCase()

    const matchesSearch =
      normalizedSearch === "" ||
      searchableText.includes(normalizedSearch)

    return matchesStatus && matchesSearch
  })
})

const scheduledCount = computed<number>(() => {
  return predictableMatches.value.filter(match => {
    return match.status === "Programado"
  }).length
})

const liveCount = computed<number>(() => {
  return predictableMatches.value.filter(match => {
    return match.status === "En Vivo"
  }).length
})

const hasActiveFilters = computed<boolean>(() => {
  return Boolean(
    search.value ||
    selectedStatus.value
  )
})

const displayError = computed<string>(() => {
  return (
    localError.value ||
    predictionsError.value ||
    teamsError.value ||
    ""
  )
})

const championSummary = computed<string>(() => {
  return (
    championPrediction.value?.championTeam ??
    "Sin elegir"
  )
})

const championFlag = computed<string>(() => {
  if (!championPrediction.value) {
    return "🏳️"
  }

  return getTeamFlag(
    championPrediction.value.championTeamId
  )
})

const championButtonText = computed<string>(() => {
  if (savingChampion.value) {
    return "Guardando..."
  }

  return championPrediction.value
    ? "Actualizar elección"
    : "Guardar elección"
})

const getTeamFlag = (
  teamId: string
): string => {
  const team = teams.value.find(
    currentTeam => currentTeam.id === teamId
  )

  return team?.flag?.trim() || "🏳️"
}

const getDate = (
  kickoff: Timestamp | Date | string | number | unknown
): Date | null => {
  if (!kickoff) {
    return null
  }

  if (
    typeof kickoff === "object" &&
    kickoff !== null &&
    "toDate" in kickoff
  ) {
    const firestoreTimestamp = kickoff as {
      toDate?: () => Date
    }

    if (
      typeof firestoreTimestamp.toDate === "function"
    ) {
      return firestoreTimestamp.toDate()
    }
  }

  if (kickoff instanceof Date) {
    return kickoff
  }

  if (
    typeof kickoff !== "string" &&
    typeof kickoff !== "number"
  ) {
    return null
  }

  const date = new Date(kickoff)

  return Number.isNaN(date.getTime())
    ? null
    : date
}

const formatDate = (
  kickoff: Match["kickoff"]
): string => {
  const date = getDate(kickoff)

  if (!date) {
    return "Por definir"
  }

  return new Intl.DateTimeFormat(
    "es-CR",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  ).format(date)
}

const formatTime = (
  kickoff: Match["kickoff"]
): string => {
  const date = getDate(kickoff)

  if (!date) {
    return "Por definir"
  }

  return new Intl.DateTimeFormat(
    "es-CR",
    {
      hour: "2-digit",
      minute: "2-digit"
    }
  ).format(date)
}

const getStatusClass = (
  status: Match["status"]
): string => {
  return status === "En Vivo"
    ? "live-status"
    : "scheduled-status"
}

const hasChangedTeams = (
  match: Match
): boolean => {
  const prediction = getMatchPrediction(match.id)

  if (!prediction) {
    return false
  }

  return (
    prediction.homeTeamId !== match.homeTeamId ||
    prediction.awayTeamId !== match.awayTeamId
  )
}

const getMatchButtonText = (
  match: Match
): string => {
  if (
    savingPrediction.value &&
    savingMatchId.value === match.id
  ) {
    return "Guardando..."
  }

  return getMatchPrediction(match.id)
    ? "Actualizar predicción"
    : "Guardar predicción"
}

const clearMessages = (): void => {
  localError.value = ""
  successMessage.value = ""
}

const clearFilters = (): void => {
  search.value = ""
  selectedStatus.value = ""
}

const saveChampion = async (): Promise<void> => {
  clearMessages()

  const user = currentUser.value

  if (!user) {
    localError.value =
      "Debes iniciar sesión para guardar una predicción."
    return
  }

  const team = teams.value.find(
    currentTeam => {
      return currentTeam.id === selectedChampionId.value
    }
  )

  if (!team) {
    localError.value =
      "Debes seleccionar una selección campeona."
    return
  }

  savingChampion.value = true

  try {
    await saveChampionPrediction(
      user.uid,
      team
    )

    successMessage.value =
      `Guardaste a ${team.name} como selección campeona.`
  } catch {
    // El composable expone el mensaje mediante predictionsError.
  } finally {
    savingChampion.value = false
  }
}

const saveMatch = async (
  match: Match
): Promise<void> => {
  clearMessages()

  const user = currentUser.value
  const draft = predictionDrafts[match.id]

  if (!user) {
    localError.value =
      "Debes iniciar sesión para guardar una predicción."
    return
  }

  if (
    !draft ||
    draft.home === "" ||
    draft.away === ""
  ) {
    localError.value =
      "Debes completar los dos marcadores."
    return
  }

  const homePrediction = Number(draft.home)
  const awayPrediction = Number(draft.away)

  if (
    !Number.isInteger(homePrediction) ||
    !Number.isInteger(awayPrediction) ||
    homePrediction < 0 ||
    awayPrediction < 0 ||
    homePrediction > 99 ||
    awayPrediction > 99
  ) {
    localError.value =
      "Los marcadores deben ser números enteros entre 0 y 99."
    return
  }

  savingMatchId.value = match.id

  try {
    await saveMatchPrediction(
      user.uid,
      match,
      homePrediction,
      awayPrediction
    )

    successMessage.value =
      `Predicción guardada: ${match.homeTeam} ${homePrediction} - ${awayPrediction} ${match.awayTeam}.`
  } catch {
    // El composable expone el mensaje mediante predictionsError.
  } finally {
    savingMatchId.value = ""
  }
}

watch(
  () => currentUser.value?.uid ?? "",
  async userId => {
    const requestId = ++loadRequest

    if (!userId) {
      clearPredictions()
      loadingUserData.value = false
      return
    }

    loadingUserData.value = true

    await Promise.all([
      fetchMatches(),
      fetchTeams(),
      fetchPredictionsByUser(userId)
    ])

    if (requestId !== loadRequest) {
      clearPredictions()
      return
    }

    loadingUserData.value = false
  },
  {
    immediate: true
  }
)

watch(
  championPrediction,
  prediction => {
    selectedChampionId.value =
      prediction?.championTeamId ?? ""
  },
  {
    immediate: true
  }
)

watch(
  [predictableMatches, matchPredictions],
  ([currentMatches]) => {
    const currentMatchIds = new Set(
      currentMatches.map(match => match.id)
    )

    for (const matchId of Object.keys(
      predictionDrafts
    )) {
      if (!currentMatchIds.has(matchId)) {
        delete predictionDrafts[matchId]
      }
    }

    for (const match of currentMatches) {
      const prediction = getMatchPrediction(match.id)

      const hasCurrentTeams = Boolean(
        prediction &&
        prediction.homeTeamId === match.homeTeamId &&
        prediction.awayTeamId === match.awayTeamId
      )

      predictionDrafts[match.id] = {
        home: hasCurrentTeams
          ? prediction!.homePrediction
          : "",
        away: hasCurrentTeams
          ? prediction!.awayPrediction
          : ""
      }
    }
  },
  {
    immediate: true
  }
)

watch(
  [hydrated, loadingAuth, currentUser],
  async ([isHydrated, loading, user]) => {
    if (
      isHydrated &&
      !loading &&
      !user
    ) {
      await navigateTo("/login")
    }
  }
)

useHead({
  title: "Predicciones | World Cup Tracker 2026",
  meta: [
    {
      name: "description",
      content:
        "Guarda tus predicciones de partidos y elige a la selección campeona del Mundial 2026."
    }
  ]
})

onMounted(() => {
  initAuth()
  hydrated.value = true
})
</script>

<style scoped>
.page-wrapper {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  background: #eef1ec;
}

.predictions-page {
  --black: #0b0d0c;
  --lime: #9dca53;
  --lime-dark: #729c34;
  --lime-soft: #edf6df;
  --white: #ffffff;
  --background: #eef1ec;
  --border: #dce1d9;
  --gray: #747c74;
  --text: #171a17;
  --danger: #b93838;

  flex: 1;
  font-family: Inter, Arial, Helvetica, sans-serif;
  color: var(--text);
  background:
    radial-gradient(
      circle at 10% 5%,
      rgba(157, 202, 83, 0.15),
      transparent 26%
    ),
    var(--background);
}

.main-content {
  width: min(1180px, calc(100% - 48px));
  margin: 0 auto;
  padding: 58px 0 72px;
}

.page-header {
  display: flex;
  gap: 35px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
}

.page-label,
.section-label,
.champion-label {
  display: inline-block;
  padding: 7px 12px;
  margin-bottom: 14px;
  font-size: 10px;
  font-weight: 900;
  color: #547626;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  border-radius: 999px;
  background: #e5f1d3;
}

.page-header h1 {
  margin: 0 0 12px;
  font-size: clamp(38px, 5vw, 56px);
  line-height: 1.05;
  letter-spacing: -2.3px;
}

.page-header p,
.section-header p {
  max-width: 680px;
  margin: 0;
  font-size: 15px;
  line-height: 1.65;
  color: var(--gray);
}

.user-badge {
  display: flex;
  gap: 12px;
  align-items: center;
  min-width: 220px;
  padding: 13px 16px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--white);
  box-shadow: 0 12px 30px rgba(20, 25, 20, 0.06);
}

.user-badge > span {
  display: grid;
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  font-size: 17px;
  font-weight: 900;
  place-items: center;
  border-radius: 12px;
  background: var(--lime);
}

.user-badge div {
  display: grid;
  gap: 3px;
}

.user-badge small {
  font-size: 9px;
  color: var(--gray);
  text-transform: uppercase;
}

.user-badge strong {
  max-width: 150px;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 15px;
  margin-bottom: 25px;
}

.summary-card {
  display: flex;
  gap: 14px;
  align-items: center;
  min-height: 92px;
  padding: 18px;
  border: 1px solid var(--border);
  border-radius: 17px;
  background: var(--white);
}

.summary-icon {
  display: grid;
  width: 44px;
  height: 44px;
  flex: 0 0 auto;
  font-size: 18px;
  color: var(--black);
  place-items: center;
  border-radius: 13px;
  background: var(--lime-soft);
}

.summary-card div {
  display: grid;
  min-width: 0;
  gap: 3px;
}

.summary-card strong {
  font-size: 19px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.summary-card small {
  font-size: 10px;
  color: var(--gray);
}

.champion-summary {
  color: var(--white);
  border-color: var(--black);
  background: var(--black);
}

.champion-summary .summary-icon {
  background: var(--lime);
}

.champion-summary small {
  color: #bfc5bd;
}

.message {
  display: flex;
  gap: 11px;
  align-items: center;
  padding: 14px 16px;
  margin-bottom: 20px;
  border-radius: 13px;
}

.message > span {
  display: grid;
  width: 23px;
  height: 23px;
  flex: 0 0 auto;
  font-size: 12px;
  font-weight: 900;
  color: var(--white);
  place-items: center;
  border-radius: 50%;
}

.message p {
  margin: 0;
  font-size: 12px;
}

.error-message {
  color: #8f2626;
  border: 1px solid #efc1c1;
  background: #fff1f1;
}

.error-message > span {
  background: var(--danger);
}

.success-message {
  color: #45651f;
  border: 1px solid #c8dfa9;
  background: #f0f8e4;
}

.success-message > span {
  color: var(--black);
  background: var(--lime);
}

.champion-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(310px, 0.7fr);
  gap: 45px;
  align-items: center;
  padding: 36px;
  margin-bottom: 52px;
  color: var(--white);
  border: 1px solid #202520;
  border-radius: 23px;
  background:
    radial-gradient(
      circle at 10% 0%,
      rgba(157, 202, 83, 0.18),
      transparent 38%
    ),
    linear-gradient(135deg, #080a09, #141914);
  box-shadow: 0 18px 42px rgba(11, 13, 12, 0.18);
}

.champion-label {
  color: var(--lime);
  background: rgba(157, 202, 83, 0.11);
}

.champion-copy h2 {
  margin: 0 0 10px;
  font-size: clamp(27px, 4vw, 38px);
  letter-spacing: -1.3px;
}

.champion-copy > p {
  max-width: 580px;
  margin: 0;
  font-size: 13px;
  line-height: 1.65;
  color: #bfc5bd;
}

.current-champion {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  padding: 10px 13px;
  margin-top: 20px;
  border: 1px solid rgba(157, 202, 83, 0.25);
  border-radius: 11px;
  background: rgba(157, 202, 83, 0.08);
}

.current-champion > span {
  font-size: 21px;
}

.current-champion p {
  margin: 0;
  font-size: 11px;
  color: #d4d9d1;
}

.current-champion strong {
  margin-left: 4px;
  color: var(--white);
}

.champion-form {
  display: grid;
  gap: 10px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 17px;
  background: rgba(255, 255, 255, 0.06);
}

.champion-form label {
  font-size: 10px;
  font-weight: 900;
  color: var(--lime);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.champion-form select {
  width: 100%;
  min-height: 48px;
  padding: 11px 13px;
  font: inherit;
  font-size: 12px;
  color: var(--text);
  border: 1px solid #444c42;
  border-radius: 11px;
  background: var(--white);
}

.champion-form select:focus,
.filter-group input:focus,
.filter-group select:focus,
.score-form input:focus {
  border-color: var(--lime-dark);
  outline: none;
  box-shadow: 0 0 0 4px rgba(157, 202, 83, 0.18);
}

.champion-form button,
.save-prediction-button,
.retry-button {
  min-height: 46px;
  padding: 11px 16px;
  font: inherit;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
  border-radius: 11px;
}

.champion-form button {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  color: var(--black);
  border: 1px solid var(--lime);
  background: var(--lime);
}

.champion-form button:hover:not(:disabled) {
  background: #aedb65;
  transform: translateY(-1px);
}

.champion-form button:disabled,
.save-prediction-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.field-state {
  margin: 0;
  font-size: 12px;
  color: #c7ccc5;
}

.matches-section {
  min-width: 0;
}

.section-header {
  display: flex;
  gap: 30px;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 25px;
}

.section-header h2 {
  margin: 0 0 9px;
  font-size: clamp(27px, 4vw, 38px);
  letter-spacing: -1.3px;
}

.status-counts {
  display: flex;
  gap: 9px;
  flex: 0 0 auto;
}

.status-counts span {
  display: grid;
  min-width: 95px;
  gap: 2px;
  padding: 10px 13px;
  font-size: 9px;
  color: #596156;
  text-align: center;
  border-radius: 11px;
  background: #e4e8e1;
}

.status-counts strong {
  font-size: 16px;
  color: var(--text);
}

.status-counts .live-count {
  color: #8b2929;
  background: #ffe4e4;
}

.status-counts .live-count strong {
  color: #8b2929;
}

.filters-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 230px auto;
  gap: 13px;
  align-items: end;
  padding: 21px;
  margin-bottom: 24px;
  border: 1px solid var(--border);
  border-radius: 18px;
  background: var(--white);
  box-shadow: 0 10px 30px rgba(20, 25, 20, 0.05);
}

.filter-group {
  display: grid;
  gap: 7px;
}

.filter-group label {
  font-size: 10px;
  font-weight: 900;
}

.filter-group input,
.filter-group select {
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  font: inherit;
  font-size: 12px;
  color: var(--text);
  border: 1px solid #d5dbd2;
  border-radius: 10px;
  background: var(--white);
}

.clear-button {
  min-height: 44px;
  padding: 10px 15px;
  font: inherit;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: #f5f6f4;
}

.clear-button:hover {
  border-color: var(--lime-dark);
  background: var(--lime-soft);
}

.matches-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.match-card {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 20px;
  background: var(--white);
  box-shadow: 0 12px 34px rgba(20, 25, 20, 0.06);
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.match-card:hover {
  border-color: #c6cec2;
  box-shadow: 0 17px 40px rgba(20, 25, 20, 0.09);
  transform: translateY(-2px);
}

.match-card-header {
  display: flex;
  gap: 14px;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid #e9ece7;
}

.match-card-header > div {
  display: grid;
  gap: 3px;
}

.match-stage {
  font-size: 11px;
  font-weight: 900;
  color: var(--lime-dark);
  text-transform: uppercase;
}

.match-card-header small {
  font-size: 9px;
  color: var(--gray);
}

.status-badge {
  padding: 7px 10px;
  font-size: 9px;
  font-weight: 900;
  border-radius: 999px;
}

.scheduled-status {
  color: #57624f;
  background: #edf0ea;
}

.live-status {
  color: #8b2929;
  background: #ffe4e4;
}

.match-teams {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 17px;
  align-items: center;
  padding: 25px 21px 22px;
}

.team-block {
  display: grid;
  min-width: 0;
  gap: 5px;
}

.team-flag {
  min-height: 28px;
  font-size: 25px;
}

.team-block small {
  font-size: 8px;
  font-weight: 900;
  color: var(--gray);
  text-transform: uppercase;
}

.team-block strong {
  font-size: 15px;
  overflow-wrap: anywhere;
}

.away-team {
  text-align: right;
}

.versus {
  display: grid;
  width: 39px;
  height: 39px;
  font-size: 10px;
  font-weight: 900;
  place-items: center;
  border-radius: 50%;
  background: var(--lime-soft);
}

.match-details {
  display: grid;
  grid-template-columns: 1fr 0.7fr 1.2fr;
  gap: 9px;
  padding: 0 20px 20px;
}

.match-details > span {
  display: grid;
  min-width: 0;
  gap: 3px;
  padding: 10px;
  border-radius: 9px;
  background: #f6f7f5;
}

.match-details small {
  font-size: 7px;
  font-weight: 900;
  color: var(--lime-dark);
  text-transform: uppercase;
}

.match-details strong {
  font-size: 9px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.teams-warning {
  padding: 11px 20px;
  font-size: 10px;
  line-height: 1.5;
  color: #875c14;
  border-top: 1px solid #f0d79d;
  background: #fff7e5;
}

.score-form {
  padding: 19px 20px 20px;
  border-top: 1px solid var(--border);
  background: #fafbf9;
}

.score-inputs {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 10px;
  align-items: end;
  margin-bottom: 12px;
}

.score-inputs label {
  display: grid;
  min-width: 0;
  gap: 7px;
}

.score-inputs label > span {
  font-size: 9px;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.score-inputs input {
  width: 100%;
  min-height: 48px;
  padding: 8px;
  font: inherit;
  font-size: 18px;
  font-weight: 900;
  text-align: center;
  border: 1px solid #ced5ca;
  border-radius: 10px;
  background: var(--white);
}

.score-separator {
  display: grid;
  min-height: 48px;
  font-size: 16px;
  font-weight: 900;
  color: var(--gray);
  place-items: center;
}

.save-prediction-button {
  width: 100%;
  color: var(--white);
  border: 1px solid var(--black);
  background: var(--black);
}

.save-prediction-button:hover:not(:disabled) {
  color: var(--black);
  border-color: var(--lime);
  background: var(--lime);
}

.state-card {
  display: grid;
  width: min(530px, 100%);
  min-height: 320px;
  padding: 40px;
  margin: 45px auto;
  text-align: center;
  place-content: center;
  border: 1px solid var(--border);
  border-radius: 22px;
  background: var(--white);
  box-shadow: 0 15px 40px rgba(20, 25, 20, 0.07);
}

.compact-state {
  min-height: 270px;
  margin: 28px auto;
}

.state-card h1,
.state-card h2 {
  margin: 17px 0 8px;
}

.state-card p {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--gray);
}

.spinner {
  width: 42px;
  height: 42px;
  margin: auto;
  border: 4px solid #dfe3dc;
  border-top-color: var(--lime-dark);
  border-radius: 50%;
  animation: spin 700ms linear infinite;
}

.state-icon {
  display: grid;
  width: 50px;
  height: 50px;
  margin: auto;
  font-size: 21px;
  place-items: center;
  border-radius: 15px;
  background: var(--lime-soft);
}

.error-icon {
  font-weight: 900;
  color: var(--white);
  border-radius: 50%;
  background: var(--danger);
}

.retry-button {
  margin: 20px auto 0;
  color: var(--white);
  border: 1px solid var(--black);
  background: var(--black);
}

.retry-button:hover {
  color: var(--black);
  border-color: var(--lime);
  background: var(--lime);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .champion-card {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .matches-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .page-header,
  .section-header {
    display: grid;
  }

  .user-badge {
    width: 100%;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .status-counts {
    width: 100%;
  }

  .status-counts span {
    flex: 1;
  }

  .filters-card {
    grid-template-columns: 1fr 1fr;
  }

  .clear-button {
    grid-column: 1 / -1;
  }
}

@media (max-width: 560px) {
  .main-content {
    width: min(100% - 28px, 1180px);
    padding: 40px 0 56px;
  }

  .champion-card {
    padding: 25px 20px;
  }

  .filters-card {
    grid-template-columns: 1fr;
  }

  .clear-button {
    grid-column: auto;
  }

  .match-teams {
    gap: 9px;
    padding-right: 16px;
    padding-left: 16px;
  }

  .team-flag {
    font-size: 21px;
  }

  .team-block strong {
    font-size: 13px;
  }

  .versus {
    width: 34px;
    height: 34px;
  }

  .match-details {
    grid-template-columns: 1fr 1fr;
    padding-right: 16px;
    padding-left: 16px;
  }

  .match-details > span:last-child {
    grid-column: 1 / -1;
  }

  .state-card {
    padding: 30px 20px;
  }
}
</style>