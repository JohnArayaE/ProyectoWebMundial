<template>
  <div class="page-wrapper">
    <AppHeader
      :loading="loadingAuth"
      @logout="logout"
    />

    <main class="matches-page">
      <section class="main-content">
        <header class="page-header">
          <div>
            <span class="page-label">
              Mundial 2026
            </span>

            <h1>Partidos</h1>

            <p>
              Consulta los encuentros, resultados, sedes y
              estados del torneo.
            </p>
          </div>
        </header>

        <section class="filters-card">
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

        <!-- Error de favoritos -->
        <div
          v-if="errorFavorites"
          class="favorites-error"
          role="alert"
        >
          <span>!</span>

          <p>{{ errorFavorites }}</p>
        </div>

        <!-- Loading -->
        <section
          v-if="loading"
          class="state-card"
        >
          <span class="spinner" />

          <h2>Cargando partidos</h2>

          <p>
            Estamos consultando los encuentros registrados.
          </p>
        </section>

        <!-- Error -->
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

        <!-- No existen partidos -->
        <section
          v-else-if="matches.length === 0"
          class="state-card"
        >
          <span class="empty-icon">
            ⚽
          </span>

          <h2>No hay partidos registrados</h2>

          <p>
            Todavía no existen partidos guardados en la
            colección matches.
          </p>

          <button
            type="button"
            class="retry-button"
            @click="refetchMatches"
          >
            Recargar
          </button>
        </section>

        <!-- No hay resultados con los filtros -->
        <section
          v-else-if="filteredMatches.length === 0"
          class="state-card"
        >
          <span class="empty-icon">
            🔍
          </span>

          <h2>No se encontraron partidos</h2>

          <p>
            No existen encuentros que coincidan con la
            búsqueda o los filtros seleccionados.
          </p>

          <button
            type="button"
            class="retry-button"
            @click="clearFilters"
          >
            Limpiar filtros
          </button>
        </section>

        <!-- Lista de partidos -->
        <section
          v-else
          class="matches-grid"
        >
          <article
            v-for="match in filteredMatches"
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
                <span>
                  Local
                </span>

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

                  <span>
                    -
                  </span>

                  {{ match.awayScore }}
                </template>
              </div>

              <div class="team away-team">
                <span>
                  Visitante
                </span>

                <strong>
                  {{ match.awayTeam }}
                </strong>
              </div>
            </div>

            <div class="match-information">
              <div>
                <span>
                  Fecha
                </span>

                <strong>
                  {{ formatDate(match.kickoff) }}
                </strong>
              </div>

              <div>
                <span>
                  Hora
                </span>

                <strong>
                  {{ formatTime(match.kickoff) }}
                </strong>
              </div>

              <div>
                <span>
                  Estadio
                </span>

                <strong>
                  {{ match.stadium }}
                </strong>
              </div>

              <div>
                <span>
                  Ciudad
                </span>

                <strong>
                  {{ match.city }}
                </strong>
              </div>
            </div>

            <div class="card-actions">
              <button
                type="button"
                class="favorite-button"
                :class="{
                  'favorite-button-active':
                    isMatchFavorite(match.id)
                }"
                :disabled="loadingFavorites"
                :aria-pressed="isMatchFavorite(match.id)"
                @click="toggleMatchFavorite(match.id)"
              >
                <span aria-hidden="true">
                  {{
                    isMatchFavorite(match.id)
                      ? "★"
                      : "☆"
                  }}
                </span>

                {{
                  isMatchFavorite(match.id)
                    ? "Quitar de favoritos"
                    : "Agregar a favoritos"
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
  loadingAuth,
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
  isMatchFavorite,
  toggleMatchFavorite
} = useFavorites()

const search = ref("")
const selectedGroup = ref("")
const selectedStage = ref("")
const selectedStatus = ref("")
const selectedDate = ref("")

const availableGroups = computed<string[]>(() => {
  const groups = matches.value
    .map(match => match.group)
    .filter(group => group.trim() !== "")

  return [...new Set(groups)].sort()
})

const availableStages = computed<string[]>(() => {
  const stages = matches.value
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

const filteredMatches = computed(() => {
  const searchValue = search.value
    .trim()
    .toLowerCase()

  return matches.value.filter(match => {
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
  title: "Partidos | World Cup Tracker 2026",
  meta: [
    {
      name: "description",
      content:
        "Consulta y filtra los partidos del Mundial 2026."
    }
  ]
})

onMounted(async () => {
  initAuth()
  await fetchMatches()
})
</script>

<style scoped>
.page-wrapper {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  background: #eef1ec;
}

.matches-page {
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
  padding: 60px 0 70px;
}

.page-header {
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
  color: var(--black);
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

.favorite-button,
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

.favorite-button {
  display: flex;
  gap: 7px;
  align-items: center;
  justify-content: center;
  color: var(--black);
  cursor: pointer;
  border: 1px solid #ccd3c8;
  background: #f5f7f3;
}

.favorite-button span {
  font-size: 17px;
  color: var(--lime-dark);
}

.favorite-button:hover:not(:disabled) {
  border-color: var(--lime-dark);
  background: var(--lime-soft);
}

.favorite-button-active {
  border-color: var(--lime-dark);
  background: var(--lime-soft);
}

.favorite-button-active span {
  color: #658e2d;
}

.favorite-button:disabled {
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
  min-height: 43px;
  padding: 10px 18px;
  margin: 22px auto 0;
  font: inherit;
  font-size: 12px;
  font-weight: 800;
  color: var(--white);
  cursor: pointer;
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
    padding: 40px 0 55px;
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

  .match-information {
    grid-template-columns: 1fr;
  }

  .card-actions {
    grid-template-columns: 1fr;
  }
}
</style>