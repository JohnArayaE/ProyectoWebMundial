<template>
  <div class="page-wrapper">
    <AppHeader
      :loading="loadingAuth || loadingFavorites"
      @logout="logout"
    />

    <main class="favorites-page">
      <section class="main-content">
        <NuxtLink
          to="/"
          class="back-link"
        >
          <span>←</span>
          Volver al inicio
        </NuxtLink>

        <header class="page-header">
          <div>
            <span class="page-label">
              Mi perfil
            </span>

            <h1>Partidos favoritos</h1>

            <p>
              Consulta los partidos que guardaste, aplica filtros
              y elimina los que ya no quieras conservar.
            </p>
          </div>

          <div
            v-if="currentUser"
            class="favorites-summary"
          >
            <span>⚽</span>

            <div>
              <strong>
                {{ favoriteMatches.length }}
              </strong>

              <small>
                {{
                  favoriteMatches.length === 1
                    ? "Partido guardado"
                    : "Partidos guardados"
                }}
              </small>
            </div>
          </div>
        </header>

        <section
          v-if="
            !loading &&
            !matchesError &&
            favoriteMatches.length > 0
          "
          class="filters-card"
        >
          <div class="search-group">
            <label for="search">
              Buscar
            </label>

            <input
              id="search"
              v-model="search"
              type="search"
              placeholder="Selección, estadio o ciudad"
            >
          </div>

          <div class="filters-grid">
            <div class="filter-group">
              <label for="group">
                Grupo
              </label>

              <select
                id="group"
                v-model="selectedGroup"
              >
                <option value="">
                  Todos los grupos
                </option>

                <option
                  v-for="group in availableGroups"
                  :key="group"
                  :value="group"
                >
                  Grupo {{ group }}
                </option>
              </select>
            </div>

            <div class="filter-group">
              <label for="stage">
                Fase
              </label>

              <select
                id="stage"
                v-model="selectedStage"
              >
                <option value="">
                  Todas las fases
                </option>

                <option
                  v-for="stage in availableStages"
                  :key="stage"
                  :value="stage"
                >
                  {{ stage }}
                </option>
              </select>
            </div>

            <div class="filter-group">
              <label for="status">
                Estado
              </label>

              <select
                id="status"
                v-model="selectedStatus"
              >
                <option value="">
                  Todos los estados
                </option>

                <option value="Programado">
                  Programado
                </option>

                <option value="En Vivo">
                  En Vivo
                </option>

                <option value="Finalizado">
                  Finalizado
                </option>
              </select>
            </div>

            <div class="filter-group">
              <label for="date">
                Fecha
              </label>

              <input
                id="date"
                v-model="selectedDate"
                type="date"
              >
            </div>
          </div>

          <button
            v-if="hasActiveFilters"
            type="button"
            class="clear-button"
            @click="clearFilters"
          >
            Limpiar filtros
          </button>
        </section>

        <div
          v-if="errorFavorites"
          class="favorites-error"
          role="alert"
        >
          <span>!</span>

          <p>{{ errorFavorites }}</p>
        </div>

        <!-- Cargando -->
        <section
          v-if="loadingAuth || loading"
          class="state-card"
        >
          <span class="spinner" />

          <h2>Cargando tus favoritos</h2>

          <p>
            Estamos recuperando los partidos que guardaste.
          </p>
        </section>

        <!-- Error de autenticación -->
        <section
          v-else-if="errorAuth"
          class="state-card"
        >
          <span class="error-symbol">
            !
          </span>

          <h2>No se pudo cargar tu cuenta</h2>

          <p>
            {{ errorAuth }}
          </p>

          <NuxtLink
            to="/login"
            class="retry-button"
          >
            Volver al inicio de sesión
          </NuxtLink>
        </section>

        <!-- Error cargando partidos -->
        <section
          v-else-if="matchesError"
          class="state-card"
        >
          <span class="error-symbol">
            !
          </span>

          <h2>No se pudieron cargar los partidos</h2>

          <p>
            {{ matchesError }}
          </p>

          <button
            type="button"
            class="retry-button"
            @click="refetchMatches"
          >
            Volver a intentar
          </button>
        </section>

        <!-- No hay favoritos -->
        <section
          v-else-if="favoriteMatches.length === 0"
          class="state-card"
        >
          <span class="empty-icon">
            ☆
          </span>

          <h2>No tienes partidos favoritos</h2>

          <p>
            Entra al apartado de partidos y guarda los
            encuentros que quieras consultar posteriormente.
          </p>

          <NuxtLink
            to="/matches"
            class="retry-button"
          >
            Explorar partidos
          </NuxtLink>
        </section>

        <!-- No hay resultados con los filtros -->
        <section
          v-else-if="filteredFavoriteMatches.length === 0"
          class="state-card"
        >
          <span class="empty-icon">
            🔍
          </span>

          <h2>No se encontraron resultados</h2>

          <p>
            Ninguno de tus partidos favoritos coincide con los
            filtros seleccionados.
          </p>

          <button
            type="button"
            class="retry-button"
            @click="clearFilters"
          >
            Limpiar filtros
          </button>
        </section>

        <!-- Lista de favoritos -->
        <section
          v-else
          class="matches-grid"
        >
          <article
            v-for="match in filteredFavoriteMatches"
            :key="match.id"
            class="match-card"
          >
            <div class="match-header">
              <div>
                <span class="match-stage">
                  {{ match.stage }}
                </span>

                <span v-if="match.group">
                  Grupo {{ match.group }}
                </span>
              </div>

              <span
                class="status-badge"
                :class="getStatusClass(match.status)"
              >
                {{ match.status }}
              </span>
            </div>

            <div class="teams">
              <div class="team">
                <span>Local</span>

                <strong>
                  {{ match.homeTeam }}
                </strong>
              </div>

              <div class="score">
                <template
                  v-if="match.status === 'Programado'"
                >
                  VS
                </template>

                <template v-else>
                  {{ match.homeScore }}

                  <span>-</span>

                  {{ match.awayScore }}
                </template>
              </div>

              <div class="team away-team">
                <span>Visitante</span>

                <strong>
                  {{ match.awayTeam }}
                </strong>
              </div>
            </div>

            <div class="match-information">
              <div>
                <span>Fecha</span>

                <strong>
                  {{ formatDate(match.kickoff) }}
                </strong>
              </div>

              <div>
                <span>Hora</span>

                <strong>
                  {{ formatTime(match.kickoff) }}
                </strong>
              </div>

              <div>
                <span>Estadio</span>

                <strong>
                  {{ match.stadium }}
                </strong>
              </div>

              <div>
                <span>Ciudad</span>

                <strong>
                  {{ match.city }}
                </strong>
              </div>
            </div>

            <div class="card-actions">
              <button
                type="button"
                class="remove-button"
                :disabled="loadingFavorites"
                @click="removeFavorite(match.id)"
              >
                <span aria-hidden="true">
                  ★
                </span>

                {{
                  removingMatchId === match.id
                    ? "Quitando..."
                    : "Quitar de favoritos"
                }}
              </button>

              <NuxtLink
                :to="`/matches/${match.id}`"
                class="details-button"
              >
                Ver detalles
              </NuxtLink>
            </div>
          </article>
        </section>
      </section>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { useAuth } from "../../composables/useAuth"
import { useMatches } from "../../composables/useMatches"
import { useFavorites } from "../../composables/useFavorites"

const {
  currentUser,
  loadingAuth,
  errorAuth,
  initAuth,
  logout
} = useAuth()

const {
  matches,
  loading,
  error: matchesError,
  fetchMatches,
  refetchMatches
} = useMatches()

const {
  loadingFavorites,
  errorFavorites,
  removeMatchFromFavorites
} = useFavorites()

const search = ref("")
const selectedGroup = ref("")
const selectedStage = ref("")
const selectedStatus = ref("")
const selectedDate = ref("")
const removingMatchId = ref<string | null>(null)

const favoriteMatches = computed(() => {
  const favoriteIds =
    currentUser.value?.favoriteMatches ?? []

  return matches.value.filter(match =>
    favoriteIds.includes(match.id)
  )
})

const availableGroups = computed<string[]>(() => {
  const groups = favoriteMatches.value
    .map(match => match.group)
    .filter(group => group.trim() !== "")

  return [...new Set(groups)].sort()
})

const availableStages = computed<string[]>(() => {
  const stages = favoriteMatches.value
    .map(match => match.stage)
    .filter(stage => stage.trim() !== "")

  return [...new Set(stages)]
})

const hasActiveFilters = computed<boolean>(() => {
  return Boolean(
    search.value ||
    selectedGroup.value ||
    selectedStage.value ||
    selectedStatus.value ||
    selectedDate.value
  )
})

const getKickoffDate = (
  kickoff: unknown
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
      typeof firestoreTimestamp.toDate ===
      "function"
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

  const parsedDate = new Date(kickoff)

  return Number.isNaN(parsedDate.getTime())
    ? null
    : parsedDate
}

const getDateInputValue = (
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

const filteredFavoriteMatches = computed(() => {
  const searchValue = search.value
    .trim()
    .toLowerCase()

  return favoriteMatches.value.filter(match => {
    const matchesSearch =
      searchValue === "" ||
      match.homeTeam
        .toLowerCase()
        .includes(searchValue) ||
      match.awayTeam
        .toLowerCase()
        .includes(searchValue) ||
      match.stadium
        .toLowerCase()
        .includes(searchValue) ||
      match.city
        .toLowerCase()
        .includes(searchValue)

    const matchesGroup =
      selectedGroup.value === "" ||
      match.group === selectedGroup.value

    const matchesStage =
      selectedStage.value === "" ||
      match.stage === selectedStage.value

    const matchesStatus =
      selectedStatus.value === "" ||
      match.status === selectedStatus.value

    const matchesDate =
      selectedDate.value === "" ||
      getDateInputValue(match.kickoff) ===
        selectedDate.value

    return (
      matchesSearch &&
      matchesGroup &&
      matchesStage &&
      matchesStatus &&
      matchesDate
    )
  })
})

const removeFavorite = async (
  matchId: string
): Promise<void> => {
  removingMatchId.value = matchId

  await removeMatchFromFavorites(matchId)

  removingMatchId.value = null
}

const formatDate = (
  kickoff: unknown
): string => {
  const date = getKickoffDate(kickoff)

  if (!date) {
    return "Fecha no disponible"
  }

  return new Intl.DateTimeFormat(
    "es-CR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }
  ).format(date)
}

const formatTime = (
  kickoff: unknown
): string => {
  const date = getKickoffDate(kickoff)

  if (!date) {
    return "Hora no disponible"
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
  status: string
): string => {
  if (status === "En Vivo") {
    return "live-status"
  }

  if (status === "Finalizado") {
    return "finished-status"
  }

  return "scheduled-status"
}

const clearFilters = (): void => {
  search.value = ""
  selectedGroup.value = ""
  selectedStage.value = ""
  selectedStatus.value = ""
  selectedDate.value = ""
}

useHead({
  title:
    "Partidos favoritos | World Cup Tracker 2026",
  meta: [
    {
      name: "description",
      content:
        "Consulta tus partidos favoritos del Mundial 2026."
    }
  ]
})

onMounted(async () => {
  initAuth()
  await fetchMatches()
})

watch(
  [loadingAuth, currentUser],
  async ([authLoading, user]) => {
    if (!authLoading && !user) {
      await navigateTo("/login")
    }
  }
)
</script>

<style scoped>
.page-wrapper {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  background: #eef1ec;
}

.favorites-page {
  --black: #0b0d0c;
  --lime: #9dca53;
  --lime-dark: #729c34;
  --lime-soft: #edf6df;
  --white: #ffffff;
  --background: #eef1ec;
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
    var(--background);
}

.main-content {
  width: min(1180px, calc(100% - 48px));
  margin: 0 auto;
  padding: 45px 0 70px;
}

.back-link {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 32px;
  font-size: 12px;
  font-weight: 800;
  color: var(--lime-dark);
  text-decoration: none;
}

.back-link:hover {
  color: var(--black);
}

.page-header {
  display: flex;
  gap: 30px;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 32px;
}

.page-label {
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
  font-size: clamp(38px, 5vw, 54px);
  letter-spacing: -2px;
}

.page-header p {
  max-width: 650px;
  margin: 0;
  font-size: 15px;
  line-height: 1.65;
  color: var(--gray);
}

.favorites-summary {
  display: flex;
  gap: 13px;
  align-items: center;
  min-width: 190px;
  padding: 17px 19px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--white);
  box-shadow: 0 10px 30px rgba(20, 25, 20, 0.06);
}

.favorites-summary > span {
  display: grid;
  width: 42px;
  height: 42px;
  font-size: 19px;
  place-items: center;
  border-radius: 12px;
  background: var(--lime-soft);
}

.favorites-summary strong,
.favorites-summary small {
  display: block;
}

.favorites-summary strong {
  font-size: 24px;
  color: var(--lime-dark);
}

.favorites-summary small {
  font-size: 10px;
  color: var(--gray);
}

.filters-card {
  padding: 25px;
  margin-bottom: 28px;
  border: 1px solid var(--border);
  border-radius: 20px;
  background: var(--white);
  box-shadow: 0 12px 35px rgba(20, 25, 20, 0.06);
}

.search-group,
.filter-group {
  display: grid;
  gap: 8px;
}

.search-group {
  margin-bottom: 18px;
}

.search-group label,
.filter-group label {
  font-size: 11px;
  font-weight: 800;
}

.search-group input,
.filter-group select,
.filter-group input {
  width: 100%;
  min-height: 46px;
  padding: 11px 13px;
  font: inherit;
  font-size: 13px;
  color: var(--text);
  border: 1px solid #d5dbd2;
  border-radius: 11px;
  background: var(--white);
}

.search-group input:focus,
.filter-group select:focus,
.filter-group input:focus {
  border-color: var(--lime-dark);
  outline: none;
  box-shadow: 0 0 0 4px rgba(157, 202, 83, 0.18);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.clear-button {
  min-height: 41px;
  padding: 10px 16px;
  margin-top: 18px;
  font: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: #f5f6f4;
}

.favorites-error {
  display: flex;
  gap: 11px;
  align-items: center;
  padding: 14px 16px;
  margin-bottom: 22px;
  color: #8f2626;
  border: 1px solid #efc1c1;
  border-radius: 13px;
  background: #fff1f1;
}

.favorites-error span {
  display: grid;
  width: 23px;
  height: 23px;
  flex: 0 0 auto;
  font-size: 13px;
  font-weight: 900;
  color: #ffffff;
  place-items: center;
  border-radius: 50%;
  background: #b93838;
}

.favorites-error p {
  margin: 0;
  font-size: 13px;
}

.matches-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 22px;
}

.match-card {
  padding: 25px;
  border: 1px solid var(--border);
  border-radius: 20px;
  background: var(--white);
  box-shadow: 0 12px 35px rgba(20, 25, 20, 0.06);
}

.match-header {
  display: flex;
  gap: 15px;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 18px;
  border-bottom: 1px solid #e9ece7;
}

.match-header > div {
  display: grid;
  gap: 4px;
}

.match-header span {
  font-size: 11px;
  color: var(--gray);
}

.match-header .match-stage {
  font-size: 12px;
  font-weight: 900;
  color: var(--lime-dark);
  text-transform: uppercase;
}

.status-badge {
  padding: 7px 10px;
  font-size: 10px !important;
  font-weight: 900;
  border-radius: 999px;
}

.scheduled-status {
  color: #57624f !important;
  background: #edf0ea;
}

.live-status {
  color: #8b2929 !important;
  background: #ffe4e4;
}

.finished-status {
  color: #496524 !important;
  background: var(--lime-soft);
}

.teams {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 18px;
  align-items: center;
  padding: 28px 0;
}

.team {
  display: grid;
  gap: 7px;
}

.away-team {
  text-align: right;
}

.team span {
  font-size: 10px;
  font-weight: 800;
  color: var(--gray);
  text-transform: uppercase;
}

.team strong {
  font-size: 17px;
  overflow-wrap: anywhere;
}

.score {
  display: flex;
  gap: 7px;
  align-items: center;
  justify-content: center;
  min-width: 62px;
  font-size: 19px;
  font-weight: 900;
}

.score span {
  color: var(--gray);
}

.match-information {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 17px;
  margin-bottom: 20px;
  border-radius: 13px;
  background: #f7f8f6;
}

.match-information div {
  display: grid;
  gap: 4px;
}

.match-information span {
  font-size: 9px;
  font-weight: 900;
  color: var(--lime-dark);
  text-transform: uppercase;
}

.match-information strong {
  font-size: 11px;
  overflow-wrap: anywhere;
}

.card-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 11px;
}

.remove-button,
.details-button {
  display: grid;
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  font: inherit;
  font-size: 11px;
  font-weight: 800;
  place-items: center;
  border-radius: 11px;
}

.remove-button {
  display: flex;
  gap: 7px;
  align-items: center;
  justify-content: center;
  color: #7d2929;
  cursor: pointer;
  border: 1px solid #e6bcbc;
  background: #fff2f2;
}

.remove-button span {
  font-size: 16px;
}

.remove-button:hover:not(:disabled) {
  color: var(--white);
  border-color: #a83232;
  background: #a83232;
}

.remove-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.details-button {
  color: var(--white);
  text-decoration: none;
  background: var(--black);
}

.details-button:hover {
  color: var(--black);
  background: var(--lime);
}

.state-card {
  display: grid;
  width: min(520px, 100%);
  min-height: 310px;
  padding: 42px;
  margin: 40px auto;
  text-align: center;
  place-content: center;
  border: 1px solid var(--border);
  border-radius: 22px;
  background: var(--white);
  box-shadow: 0 15px 40px rgba(20, 25, 20, 0.07);
}

.state-card h2 {
  margin: 18px 0 9px;
}

.state-card p {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
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

.empty-icon,
.error-symbol {
  display: grid;
  width: 50px;
  height: 50px;
  margin: auto;
  font-size: 22px;
  place-items: center;
  border-radius: 15px;
  background: var(--lime-soft);
}

.error-symbol {
  font-weight: 900;
  color: var(--white);
  border-radius: 50%;
  background: #b93838;
}

.retry-button {
  display: grid;
  min-height: 43px;
  padding: 10px 18px;
  margin: 22px auto 0;
  font: inherit;
  font-size: 12px;
  font-weight: 800;
  color: var(--white);
  text-decoration: none;
  cursor: pointer;
  place-items: center;
  border: 0;
  border-radius: 10px;
  background: var(--black);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .page-header {
    display: grid;
    align-items: stretch;
  }

  .favorites-summary {
    width: 100%;
  }

  .filters-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .matches-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .main-content {
    width: min(100% - 28px, 1180px);
    padding: 32px 0 55px;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .teams {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .away-team {
    text-align: center;
  }

  .match-information,
  .card-actions {
    grid-template-columns: 1fr;
  }
}
</style>