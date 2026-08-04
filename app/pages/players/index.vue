<template>
  <div class="page-layout">
    <AppHeader
      :loading="loadingAuth"
      @logout="logout"
    />

    <main class="players-page">
      <!-- Encabezado -->
      <section class="header-section">
        <h1 class="title">
          Jugadores del Mundial 2026
        </h1>

        <p class="subtitle">
          Conoce a los futbolistas que representarán a sus selecciones
          en la Copa Mundial 2026.
        </p>

        <NuxtLink
          to="/players/manage"
          class="btn btn-primary manage-link"
        >
          ➕ Gestionar Jugadores
        </NuxtLink>
      </section>

      <!-- Filtros -->
      <section class="filters glass">
        <input
          v-model="searchQuery"
          type="text"
          class="filter-input search-input"
          placeholder="Buscar jugador o club..."
        />

        <select
          v-model="selectedTeam"
          class="filter-input select-input"
        >
          <option value="">
            Todas las selecciones
          </option>

          <option
            v-for="team in teams"
            :key="team.id"
            :value="team.id"
          >
            {{ team.flag || '🏳️' }} {{ team.name }}
          </option>
        </select>

        <select
          v-model="selectedPosition"
          class="filter-input select-input"
        >
          <option value="">
            Todas las posiciones
          </option>

          <option
            v-for="position in positions"
            :key="position"
            :value="position"
          >
            {{ position }}
          </option>
        </select>
      </section>

      <!-- Cargando -->
      <div
        v-if="pageLoading"
        class="loader-container"
      >
        <div class="spinner"></div>
        <p>Cargando jugadores...</p>
      </div>

      <!-- Error -->
      <div
        v-else-if="pageError"
        class="error-container glass"
      >
        <p>⚠️ {{ pageError }}</p>

        <button
          type="button"
          class="btn btn-secondary"
          @click="loadData"
        >
          Intentar nuevamente
        </button>
      </div>

      <!-- Lista de jugadores -->
      <div
        v-else-if="filteredPlayers.length > 0"
        class="players-grid"
      >
        <NuxtLink
          v-for="player in filteredPlayers"
          :key="player.id"
          :to="`/players/${player.id}`"
          class="player-card glass"
        >
          <div class="player-card-header">
            <div class="shirt-number">
              {{ player.number || '-' }}
            </div>

            <span class="position-badge">
              {{ player.position || 'Sin posición' }}
            </span>
          </div>

          <div class="player-card-body">
            <div class="team-flag">
              {{ getTeam(player.teamId)?.flag || '🏳️' }}
            </div>

            <h2 class="player-name">
              {{ player.name }}
            </h2>

            <p class="team-name">
              {{
                getTeam(player.teamId)?.name ||
                'Selección no encontrada'
              }}
            </p>

            <div class="player-information">
              <div class="information-item">
                <span class="information-label">
                  Club
                </span>

                <span class="information-value">
                  {{ player.club || 'No registrado' }}
                </span>
              </div>

              <div class="information-item">
                <span class="information-label">
                  Posición
                </span>

                <span class="information-value">
                  {{ player.position || 'No registrada' }}
                </span>
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- Sin resultados -->
      <div
        v-else
        class="empty-state glass"
      >
        <div class="empty-icon">⚽</div>

        <h2>
          {{
            players.length === 0
              ? 'No hay jugadores registrados'
              : 'No se encontraron jugadores'
          }}
        </h2>

        <p>
          {{
            players.length === 0
              ? 'Registra el primer jugador para comenzar.'
              : 'Prueba cambiando los filtros de búsqueda.'
          }}
        </p>

        <NuxtLink
          v-if="players.length === 0"
          to="/players/manage"
          class="btn btn-primary"
        >
          ➕ Registrar jugador
        </NuxtLink>

        <button
          v-else
          type="button"
          class="btn btn-secondary"
          @click="clearFilters"
        >
          Limpiar filtros
        </button>
      </div>

      <!-- Cantidad mostrada -->
      <div
        v-if="
          !pageLoading &&
          !pageError &&
          players.length > 0
        "
        class="results-count"
      >
        Mostrando {{ filteredPlayers.length }}
        de {{ players.length }} jugadores
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
const { loadingAuth, logout } = useAuth();
import {
  computed,
  onMounted,
  ref
} from 'vue'

const {
  players,
  loading: playersLoading,
  error: playersError,
  fetchPlayers
} = usePlayers()

const {
  teams,
  loading: teamsLoading,
  error: teamsError,
  fetchTeams
} = useTeams()

const searchQuery = ref('')
const selectedTeam = ref('')
const selectedPosition = ref('')

const pageLoading = computed(() => {
  return playersLoading.value || teamsLoading.value
})

const pageError = computed(() => {
  return playersError.value || teamsError.value
})

const positions = computed(() => {
  const uniquePositions = new Set(
    players.value
      .map(player => player.position)
      .filter(Boolean)
  )

  return Array.from(uniquePositions).sort()
})

const filteredPlayers = computed(() => {
  const search = searchQuery.value
    .trim()
    .toLowerCase()

  return players.value.filter((player) => {
    const playerName = player.name?.toLowerCase() || ''
    const playerClub = player.club?.toLowerCase() || ''

    const matchesSearch =
      playerName.includes(search) ||
      playerClub.includes(search)

    const matchesTeam =
      selectedTeam.value === '' ||
      player.teamId === selectedTeam.value

    const matchesPosition =
      selectedPosition.value === '' ||
      player.position === selectedPosition.value

    return (
      matchesSearch &&
      matchesTeam &&
      matchesPosition
    )
  })
})

function getTeam(teamId) {
  return teams.value.find(team => team.id === teamId)
}

function clearFilters() {
  searchQuery.value = ''
  selectedTeam.value = ''
  selectedPosition.value = ''
}

async function loadData() {
  await Promise.all([
    fetchPlayers(),
    fetchTeams()
  ])
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.page-layout {
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

  display: flex;
  min-height: 100dvh;
  flex-direction: column;
  font-family: Inter, Arial, Helvetica, sans-serif;
  color: var(--text);
  background:
    radial-gradient(
      circle at 10% 5%,
      rgba(157, 202, 83, 0.14),
      transparent 27%
    ),
    var(--background);
}

.players-page {
  box-sizing: border-box;
  width: 100%;
  flex: 1;
  padding: 56px max(24px, calc((100% - 1180px) / 2));
}

.players-page *,
.players-page *::before,
.players-page *::after {
  box-sizing: border-box;
}

.header-section {
  max-width: 760px;
  margin: 0 auto 32px;
  text-align: center;
}

.title {
  margin: 0 0 12px;
  font-size: clamp(36px, 5vw, 54px);
  line-height: 1.08;
  letter-spacing: -2px;
}

.subtitle {
  margin: 0 0 22px;
  font-size: 15px;
  line-height: 1.65;
  color: var(--gray);
}

.glass {
  border: 1px solid var(--border);
  border-radius: 18px;
  background: var(--white);
  box-shadow: 0 12px 34px rgba(20, 25, 20, 0.07);
}

.btn {
  display: inline-flex;
  min-height: 46px;
  padding: 11px 21px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  border: 0;
  border-radius: 12px;
  text-decoration: none;
  transition:
    transform 180ms ease,
    background-color 180ms ease,
    box-shadow 180ms ease;
}

.btn-primary {
  color: var(--black);
  background: var(--lime);
  box-shadow: 0 8px 20px rgba(114, 156, 52, 0.2);
}

.btn-primary:hover {
  background: #8fbd49;
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(114, 156, 52, 0.27);
}

.btn-secondary {
  color: var(--white);
  background: var(--black);
}

.btn-secondary:hover {
  background: #262926;
  transform: translateY(-2px);
}

.filters {
  display: grid;
  grid-template-columns:
    minmax(240px, 1fr)
    minmax(190px, 260px)
    minmax(190px, 240px);
  gap: 14px;
  padding: 20px;
  margin-bottom: 26px;
}

.filter-input {
  width: 100%;
  min-width: 0;
  min-height: 48px;
  padding: 12px 15px;
  font-size: 14px;
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 11px;
  outline: none;
  background: var(--white);
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.filter-input:focus {
  border-color: var(--lime);
  box-shadow: 0 0 0 4px rgba(157, 202, 83, 0.16);
}

.search-input::placeholder {
  color: #9ca39c;
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(270px, 1fr)
  );
  gap: 22px;
}

.player-card {
  min-height: 310px;
  padding: 24px;
  overflow: hidden;
  color: var(--text);
  text-decoration: none;
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.player-card:hover {
  border-color: var(--lime);
  transform: translateY(-5px);
  box-shadow: 0 18px 42px rgba(20, 25, 20, 0.12);
}

.player-card-header {
  display: flex;
  margin-bottom: 20px;
  align-items: flex-start;
  justify-content: space-between;
}

.shirt-number {
  display: grid;
  width: 62px;
  height: 62px;
  place-items: center;
  flex-shrink: 0;
  font-size: 25px;
  font-weight: 900;
  color: var(--black);
  border: 1px solid #d7e8bd;
  border-radius: 18px;
  background: var(--lime-soft);
}

.position-badge {
  padding: 6px 11px;
  font-size: 10px;
  font-weight: 900;
  color: #547626;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  border-radius: 999px;
  background: var(--lime-soft);
}

.player-card-body {
  text-align: center;
}

.team-flag {
  margin-bottom: 8px;
  font-size: 35px;
}

.player-name {
  margin: 0 0 7px;
  font-size: 22px;
  line-height: 1.25;
}

.team-name {
  margin: 0 0 22px;
  font-size: 13px;
  font-weight: 700;
  color: var(--lime-dark);
}

.player-information {
  display: grid;
  gap: 9px;
  padding-top: 17px;
  text-align: left;
  border-top: 1px solid var(--border);
}

.information-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.information-label {
  font-size: 11px;
  font-weight: 800;
  color: var(--gray);
}

.information-value {
  overflow: hidden;
  font-size: 12px;
  font-weight: 700;
  text-align: right;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.loader-container {
  display: flex;
  padding: 64px 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--gray);
}

.spinner {
  width: 42px;
  height: 42px;
  margin-bottom: 16px;
  border: 4px solid #dfe3dc;
  border-top-color: var(--lime-dark);
  border-radius: 50%;
  animation: spin 700ms linear infinite;
}

.error-container,
.empty-state {
  padding: 55px 24px;
  text-align: center;
  color: var(--gray);
}

.error-container {
  color: var(--danger);
  border-color: rgba(185, 56, 56, 0.25);
}

.error-container .btn {
  margin-top: 16px;
}

.empty-state h2 {
  margin: 0 0 10px;
  color: var(--text);
}

.empty-state p {
  margin: 0 0 22px;
}

.empty-icon {
  margin-bottom: 14px;
  font-size: 48px;
}

.results-count {
  margin-top: 24px;
  font-size: 12px;
  font-weight: 700;
  color: var(--gray);
  text-align: center;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 800px) {
  .filters {
    grid-template-columns: 1fr 1fr;
  }

  .search-input {
    grid-column: 1 / -1;
  }
}

@media (max-width: 600px) {
  .players-page {
    padding: 40px 14px;
  }

  .header-section {
    margin-bottom: 28px;
  }

  .title {
    font-size: 35px;
    letter-spacing: -1px;
  }

  .manage-link {
    width: 100%;
  }

  .filters {
    grid-template-columns: 1fr;
    padding: 18px;
  }

  .search-input {
    grid-column: auto;
  }

  .players-grid {
    grid-template-columns: 1fr;
  }
}
</style>