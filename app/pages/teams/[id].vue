<template>
  <div class="page-layout">
    <AppHeader 
      :loading="loadingAuth"
      @logout="logout"
    />

    <main class="team-detail-page">
      <div class="page-container">
      <NuxtLink to="/teams" class="back-link">
        ← Volver a selecciones
      </NuxtLink>

      <div v-if="pageLoading" class="loader-container">
        <div class="spinner"></div>
        <p>Cargando información de la selección...</p>
      </div>

      <div v-else-if="pageError" class="state-card error-state">
        <div class="state-icon">⚠️</div>

        <h1>No se pudo cargar la selección</h1>

        <p>{{ pageError }}</p>

        <button
          type="button"
          class="btn btn-primary"
          @click="loadTeam"
        >
          Intentar nuevamente
        </button>
      </div>

      <div v-else-if="!team" class="state-card empty-state">
        <div class="state-icon">🔍</div>

        <h1>Selección no encontrada</h1>

        <p>
          La selección solicitada no existe o fue eliminada.
        </p>

        <NuxtLink to="/teams" class="btn btn-primary">
          Ver todas las selecciones
        </NuxtLink>
      </div>

      <article v-else class="team-detail">
        <section class="team-hero">
          <div class="flag-container">
            <span
              v-if="team.flag && team.flag.trim() !== ''"
              class="team-flag"
            >
              {{ team.flag }}
            </span>

            <span v-else class="team-flag">
              🏳️
            </span>
          </div>

          <div class="hero-information">
            <div class="hero-badges">
              <span class="hero-badge">
                Grupo {{ team.group || 'sin asignar' }}
              </span>

              <span
                v-if="team.fifaRanking"
                class="hero-badge ranking-badge"
              >
                FIFA #{{ team.fifaRanking }}
              </span>
            </div>

            <h1 class="team-name">
              {{ team.name }}
            </h1>
          </div>
        </section>

        <section class="information-section">
          <div class="section-heading">
            <div>
              <span class="eyebrow">SELECCIÓN</span>
              <h2>Información general</h2>
            </div>
          </div>

          <div class="information-grid">
            <div class="information-card">
              <span class="information-icon">🌎</span>

              <div>
                <span class="information-label">
                  Confederación
                </span>

                <strong class="information-value">
                  {{ team.confederation || 'No registrada' }}
                </strong>
              </div>
            </div>

            <div class="information-card">
              <span class="information-icon">🏆</span>

              <div>
                <span class="information-label">
                  Grupo
                </span>

                <strong class="information-value">
                  {{ team.group || 'Sin asignar' }}
                </strong>
              </div>
            </div>

            <div class="information-card">
              <span class="information-icon">📊</span>

              <div>
                <span class="information-label">
                  Ranking FIFA
                </span>

                <strong class="information-value">
                  {{
                    team.fifaRanking
                      ? `Puesto ${team.fifaRanking}`
                      : 'No registrado'
                  }}
                </strong>
              </div>
            </div>
          </div>
        </section>

        <section class="players-section">
          <div class="section-heading">
            <div>
              <span class="eyebrow">PLANTILLA</span>

              <h2>
                Jugadores de {{ team.name }}
              </h2>
            </div>

            <span class="players-count">
              {{ teamPlayers.length }}
              {{ teamPlayers.length === 1 ? 'jugador' : 'jugadores' }}
            </span>
          </div>

          <div v-if="playersLoading" class="small-loader">
            <div class="spinner spinner-small"></div>
            <p>Cargando jugadores...</p>
          </div>

          <div
            v-else-if="playersError"
            class="players-message players-message--error"
          >
            ⚠️ {{ playersError }}
          </div>

          <div
            v-else-if="teamPlayers.length > 0"
            class="players-grid"
          >
            <NuxtLink
              v-for="player in teamPlayers"
              :key="player.id"
              :to="`/players/${player.id}`"
              class="player-card"
            >
              <div class="player-number">
                {{ player.number ?? '-' }}
              </div>

              <div class="player-information">
                <h3>{{ player.name }}</h3>

                <div class="player-badges">
                  <span class="player-badge player-badge--position">
                    {{ player.position || 'Sin posición' }}
                  </span>

                  <span class="player-badge">
                    {{ player.club || 'Sin club' }}
                  </span>
                </div>
              </div>

              <span class="player-arrow">
                →
              </span>
            </NuxtLink>
          </div>

          <div v-else class="players-message">
            <div class="empty-player-icon">⚽</div>

            <h3>No hay jugadores registrados</h3>

            <p>
              Todavía no se han registrado jugadores para esta selección.
            </p>

            <NuxtLink
              to="/players/manage"
              class="btn btn-primary"
            >
              Registrar jugador
            </NuxtLink>
          </div>
        </section>

        <footer class="page-actions">
          <NuxtLink to="/teams" class="btn btn-secondary">
            Ver todas las selecciones
          </NuxtLink>

          <NuxtLink
            to="/teams/manage"
            class="btn btn-primary"
          >
            Gestionar equipos
          </NuxtLink>
        </footer>
      </article>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import {
  computed,
  onMounted,
  ref,
  watch
} from 'vue'

const {
  currentUser,
  loadingAuth,
  initAuth,
  logout
} = useAuth()

const route = useRoute()

const {
  loading: teamLoading,
  error: teamError,
  fetchTeamById
} = useTeams()

const {
  players,
  loading: playersLoading,
  error: playersError,
  fetchPlayers
} = usePlayers()

const team = ref(null)
const localError = ref(null)
const initialLoading = ref(true)

const teamId = computed(() => {
  const id = route.params.id

  return Array.isArray(id) ? id[0] : id
})

const pageLoading = computed(() => {
  return initialLoading.value || teamLoading.value
})

const pageError = computed(() => {
  return localError.value || teamError.value
})

const teamPlayers = computed(() => {
  if (!team.value) {
    return []
  }

  return players.value
    .filter(player => player.teamId === team.value.id)
    .slice()
    .sort((firstPlayer, secondPlayer) => {
      const firstNumber =
        Number(firstPlayer.number) || 999

      const secondNumber =
        Number(secondPlayer.number) || 999

      return firstNumber - secondNumber
    })
})

async function loadTeam() {
  initialLoading.value = true
  localError.value = null
  team.value = null

  if (!teamId.value) {
    localError.value =
      'El identificador de la selección no es válido.'

    initialLoading.value = false
    return
  }

  const results = await Promise.allSettled([
    fetchTeamById(teamId.value),
    fetchPlayers()
  ])

  const teamResult = results[0]
  const playersResult = results[1]

  if (teamResult.status === 'fulfilled') {
    team.value = teamResult.value
  } else {
    console.error(
      '[teams/id] Error cargando equipo:',
      teamResult.reason
    )

    localError.value =
      'Ocurrió un error al consultar la selección.'
  }

  if (playersResult.status === 'rejected') {
    console.error(
      '[teams/id] Error cargando jugadores:',
      playersResult.reason
    )
  }

  initialLoading.value = false
}

watch(
  [loadingAuth, currentUser],
  async ([authLoading, user]) => {
    if (!authLoading && !user) {
      await navigateTo('/login')
    }
  }
)

onMounted(async () => {
  initAuth()
  await loadTeam()
})

watch(teamId, (newId, previousId) => {
  if (newId && newId !== previousId) {
    loadTeam()
  }
})
</script>

<style scoped>
.page-layout {
  display: flex;
  min-height: 100dvh;
  flex-direction: column;
}

.team-detail-page {
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

  width: 100%;
  flex: 0 0 auto;
  padding: 28px 24px 16px;
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

.page-container {
  width: min(1000px, 100%);
  margin: 0 auto;
}

.back-link {
  display: inline-flex;
  margin-bottom: 16px;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 800;
  color: var(--text);
  text-decoration: none;
}

.back-link:hover {
  color: var(--lime-dark);
}

.team-detail,
.state-card {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 22px;
  background: var(--white);
  box-shadow: 0 14px 40px rgba(20, 25, 20, 0.08);
}

.team-hero {
  display: flex;
  min-height: 260px;
  padding: 40px 45px;
  align-items: center;
  gap: 44px;
  color: var(--white);
  background:
    radial-gradient(
      circle at 86% 15%,
      rgba(157, 202, 83, 0.25),
      transparent 31%
    ),
    linear-gradient(135deg, #0b0d0c, #252b23);
}

.flag-container {
  display: grid;
  width: 170px;
  height: 170px;
  flex-shrink: 0;
  place-items: center;
  border: 5px solid rgba(255, 255, 255, 0.18);
  border-radius: 42px;
  background: var(--white);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.28);
}

.team-flag {
  font-size: 78px;
  line-height: 1;
}

.hero-information {
  min-width: 0;
}

.hero-badges {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.hero-badge {
  padding: 7px 13px;
  font-size: 10px;
  font-weight: 900;
  color: var(--black);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: 999px;
  background: var(--lime);
}

.ranking-badge {
  color: var(--white);
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.12);
}

.team-name {
  margin: 0;
  font-size: clamp(42px, 7vw, 70px);
  line-height: 0.98;
  letter-spacing: -3px;
}

.information-section,
.players-section {
  padding: 30px 42px;
}

.players-section {
  border-top: 1px solid var(--border);
  background: #f8f9f7;
}

.section-heading {
  display: flex;
  margin-bottom: 25px;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.section-heading h2 {
  margin: 5px 0 0;
  font-size: 26px;
}

.eyebrow {
  font-size: 9px;
  font-weight: 900;
  color: var(--lime-dark);
  letter-spacing: 1.2px;
}

.information-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.information-card {
  display: flex;
  min-height: 105px;
  padding: 20px;
  align-items: center;
  gap: 16px;
  border: 1px solid var(--border);
  border-radius: 15px;
  background: #f8f9f7;
}

.information-icon {
  display: grid;
  width: 50px;
  height: 50px;
  flex-shrink: 0;
  place-items: center;
  font-size: 24px;
  border-radius: 14px;
  background: var(--lime-soft);
}

.information-label {
  display: block;
  margin-bottom: 5px;
  font-size: 10px;
  font-weight: 800;
  color: var(--gray);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.information-value {
  display: block;
  font-size: 15px;
}

.players-count {
  padding: 7px 12px;
  font-size: 11px;
  font-weight: 900;
  color: #547626;
  border-radius: 999px;
  background: var(--lime-soft);
}

.players-grid {
  display: grid;
  gap: 11px;
}

.player-card {
  display: flex;
  min-height: 82px;
  padding: 14px 17px;
  align-items: center;
  gap: 15px;
  color: var(--text);
  text-decoration: none;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--white);
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.player-card:hover {
  border-color: var(--lime);
  transform: translateY(-2px);
  box-shadow: 0 9px 24px rgba(20, 25, 20, 0.09);
}

.player-number {
  display: grid;
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  place-items: center;
  font-size: 20px;
  font-weight: 900;
  border: 1px solid #d7e8bd;
  border-radius: 14px;
  background: var(--lime-soft);
}

.player-information {
  min-width: 0;
  flex: 1;
}

.player-information h3 {
  margin: 0 0 7px;
  font-size: 16px;
}

.player-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.player-badge {
  padding: 4px 8px;
  font-size: 9px;
  font-weight: 800;
  color: #626a62;
  border: 1px solid #e2e6df;
  border-radius: 7px;
  background: #f5f6f4;
}

.player-badge--position {
  color: var(--lime-dark);
  border-color: #d7e8bd;
  background: var(--lime-soft);
}

.player-arrow {
  font-size: 20px;
  font-weight: 900;
  color: var(--lime-dark);
}

.players-message {
  padding: 40px 20px;
  text-align: center;
  color: var(--gray);
  border: 1px dashed var(--border);
  border-radius: 15px;
  background: var(--white);
}

.players-message h3 {
  margin: 0 0 8px;
  color: var(--text);
}

.players-message p {
  margin: 0 0 20px;
}

.players-message--error {
  color: var(--danger);
  border-color: rgba(185, 56, 56, 0.3);
}

.empty-player-icon {
  margin-bottom: 12px;
  font-size: 40px;
}

.page-actions {
  display: flex;
  padding: 18px 42px;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid var(--border);
  background: var(--white);
}

.btn {
  display: inline-flex;
  min-height: 46px;
  padding: 11px 21px;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  border: 0;
  border-radius: 12px;
  text-decoration: none;
  transition:
    transform 180ms ease,
    background 180ms ease;
}

.btn-primary {
  color: var(--black);
  background: var(--lime);
}

.btn-primary:hover {
  background: #8fbd49;
  transform: translateY(-2px);
}

.btn-secondary {
  color: var(--white);
  background: var(--black);
}

.btn-secondary:hover {
  background: #262926;
  transform: translateY(-2px);
}

.loader-container,
.small-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--gray);
}

.loader-container {
  padding: 70px 20px;
}

.small-loader {
  padding: 35px 20px;
}

.spinner {
  width: 44px;
  height: 44px;
  margin-bottom: 16px;
  border: 4px solid #dfe3dc;
  border-top-color: var(--lime-dark);
  border-radius: 50%;
  animation: spin 700ms linear infinite;
}

.spinner-small {
  width: 32px;
  height: 32px;
}

.error-state,
.empty-state {
  padding: 70px 25px;
  text-align: center;
}

.error-state {
  color: var(--danger);
}

.error-state h1,
.empty-state h1 {
  margin: 0 0 10px;
  color: var(--text);
}

.error-state p,
.empty-state p {
  margin: 0 0 22px;
}

.state-icon {
  margin-bottom: 16px;
  font-size: 50px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 850px) {
  .information-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .team-detail-page {
    padding: 38px 14px;
  }

  .team-hero {
    padding: 40px 22px;
    flex-direction: column;
    text-align: center;
  }

  .flag-container {
    width: 130px;
    height: 130px;
  }

  .team-flag {
    font-size: 60px;
  }

  .hero-badges {
    justify-content: center;
  }

  .team-name {
    font-size: 42px;
    letter-spacing: -2px;
  }

  .information-section,
  .players-section {
    padding: 28px 18px;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .page-actions {
    padding: 22px 18px;
    flex-direction: column;
  }

  .page-actions .btn {
    width: 100%;
  }
}

@media (max-width: 450px) {
  .player-card {
    align-items: flex-start;
  }

  .player-arrow {
    display: none;
  }
}
</style>
