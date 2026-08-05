<template>
  <div class="page-layout">
    <AppHeader 
      :loading="loadingAuth"
      @logout="logout"
    />


    <main class="player-detail-page">
      <div class="page-container">
        <NuxtLink to="/players" class="back-link">
          <span>←</span>
          Volver a jugadores
        </NuxtLink>

        <!-- Cargando -->
        <div v-if="pageLoading" class="loader-container">
          <div class="spinner"></div>
          <p>Cargando información del jugador...</p>
        </div>

        <!-- Error -->
        <div v-else-if="pageError" class="error-state glass">
          <div class="state-icon">⚠️</div>

          <h1>No se pudo cargar el jugador</h1>

          <p>{{ pageError }}</p>

          <button
            type="button"
            class="btn btn-primary"
            @click="loadPlayer"
          >
            Intentar nuevamente
          </button>
        </div>

        <!-- Jugador no encontrado -->
        <div v-else-if="!player" class="empty-state glass">
          <div class="state-icon">🔍</div>

          <h1>Jugador no encontrado</h1>

          <p>
            El jugador solicitado no existe o fue eliminado.
          </p>

          <NuxtLink to="/players" class="btn btn-primary">
            Ver todos los jugadores
          </NuxtLink>
        </div>

        <!-- Detalles -->
        <div v-else class="player-detail glass">
          <section class="player-hero">
            <div class="shirt-container">
              <div class="shirt-number">
                {{ player.number || '-' }}
              </div>

              <span class="shirt-label">
                Número
              </span>
            </div>

            <div class="player-main-information">
              <span class="position-badge">
                {{ player.position || 'Sin posición' }}
              </span>

              <h1 class="player-name">
                {{ player.name }}
              </h1>

              <div class="team-information">
                <span class="team-flag">
                  {{ selectedTeam?.flag || '🏳️' }}
                </span>

                <span>
                  {{
                    selectedTeam?.name ||
                    'Selección no encontrada'
                  }}
                </span>
              </div>
            </div>
          </section>

          <section class="information-section">
            <h2 class="section-title">
              Información del jugador
            </h2>

            <div class="information-grid">
              <div class="information-card">
                <span class="information-icon">👕</span>

                <div>
                  <span class="information-label">
                    Número de camiseta
                  </span>

                  <strong class="information-value">
                    {{ player.number || 'No registrado' }}
                  </strong>
                </div>
              </div>

              <div class="information-card">
                <span class="information-icon">⚽</span>

                <div>
                  <span class="information-label">
                    Posición
                  </span>

                  <strong class="information-value">
                    {{ player.position || 'No registrada' }}
                  </strong>
                </div>
              </div>

              <div class="information-card">
                <span class="information-icon">🏟️</span>

                <div>
                  <span class="information-label">
                    Club actual
                  </span>

                  <strong class="information-value">
                    {{ player.club || 'No registrado' }}
                  </strong>
                </div>
              </div>

              <div class="information-card">
                <span class="information-icon">
                  {{ selectedTeam?.flag || '🏳️' }}
                </span>

                <div>
                  <span class="information-label">
                    Selección
                  </span>

                  <strong class="information-value">
                    {{
                      selectedTeam?.name ||
                      'Selección no encontrada'
                    }}
                  </strong>
                </div>
              </div>
            </div>
          </section>

          <section
            v-if="selectedTeam"
            class="team-section"
          >
            <div class="team-section-content">
              <div>
                <span class="team-section-label">
                  REPRESENTA A
                </span>

                <h2>
                  {{ selectedTeam.flag || '🏳️' }}
                  {{ selectedTeam.name }}
                </h2>

                <p>
                  Grupo {{ selectedTeam.group || 'sin asignar' }}
                  ·
                  {{ selectedTeam.confederation || 'Sin confederación' }}
                </p>
              </div>

              <NuxtLink
                v-if="selectedTeam.id"
                :to="`/teams/${selectedTeam.id}`"
                class="btn btn-secondary"
              >
                Ver selección
              </NuxtLink>
            </div>
          </section>

          <div class="page-actions">
            <NuxtLink to="/players" class="btn btn-secondary">
              Ver todos los jugadores
            </NuxtLink>

            <NuxtLink
              to="/players/manage"
              class="btn btn-primary"
            >
              Gestionar jugadores
            </NuxtLink>
          </div>
        </div>
      </div>
    </main>
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
  loading: playerLoading,
  error: playerError,
  fetchPlayerById
} = usePlayers()

const {
  loading: teamLoading,
  fetchTeamById
} = useTeams()

const player = ref(null)
const selectedTeam = ref(null)
const localError = ref(null)
const initialLoading = ref(true)

const playerId = computed(() => {
  const id = route.params.id

  return Array.isArray(id) ? id[0] : id
})

const pageLoading = computed(() => {
  return (
    initialLoading.value ||
    playerLoading.value ||
    teamLoading.value
  )
})

const pageError = computed(() => {
  return localError.value || playerError.value
})

async function loadPlayer() {
  initialLoading.value = true
  localError.value = null
  player.value = null
  selectedTeam.value = null

  if (!playerId.value) {
    localError.value =
      'El identificador del jugador no es válido.'

    initialLoading.value = false
    return
  }

  try {
    const playerResult = await fetchPlayerById(
      playerId.value
    )

    player.value = playerResult

    if (playerResult?.teamId) {
      selectedTeam.value = await fetchTeamById(
        playerResult.teamId
      )
    }
  } catch (error) {
    console.error(
      '[players/id] Error cargando jugador:',
      error
    )

    localError.value =
      'Ocurrió un error al consultar el jugador.'
  } finally {
    initialLoading.value = false
  }
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
  await loadPlayer()
})

watch(playerId, (newId, previousId) => {
  if (newId && newId !== previousId) {
    loadPlayer()
  }
})

watch(playerId, (newId, previousId) => {
  if (newId && newId !== previousId) {
    loadPlayer()
  }
})
</script>

<style scoped>
.player-detail-page {
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

  min-height: 100vh;
  padding: 64px 24px;
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
  width: min(940px, 100%);
  margin: 0 auto;
}

.glass {
  border: 1px solid var(--border);
  border-radius: 22px;
  background: var(--white);
  box-shadow: 0 14px 40px rgba(20, 25, 20, 0.08);
}

.back-link {
  display: inline-flex;
  margin-bottom: 25px;
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

.player-detail {
  overflow: hidden;
}

.player-hero {
  display: flex;
  min-height: 310px;
  padding: 55px;
  align-items: center;
  gap: 42px;
  color: var(--white);
  background:
    radial-gradient(
      circle at 85% 20%,
      rgba(157, 202, 83, 0.26),
      transparent 30%
    ),
    linear-gradient(135deg, #0b0d0c, #252b23);
}

.shirt-container {
  flex-shrink: 0;
  text-align: center;
}

.shirt-number {
  display: grid;
  width: 145px;
  height: 145px;
  place-items: center;
  font-size: 64px;
  font-weight: 900;
  color: var(--black);
  border: 5px solid rgba(255, 255, 255, 0.28);
  border-radius: 38px;
  background: var(--lime);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.28);
}

.shirt-label {
  display: block;
  margin-top: 12px;
  font-size: 10px;
  font-weight: 900;
  color: #c9cec7;
  text-transform: uppercase;
  letter-spacing: 1.5px;
}

.player-main-information {
  min-width: 0;
}

.position-badge {
  display: inline-flex;
  padding: 7px 13px;
  margin-bottom: 15px;
  font-size: 10px;
  font-weight: 900;
  color: var(--black);
  text-transform: uppercase;
  letter-spacing: 0.7px;
  border-radius: 999px;
  background: var(--lime);
}

.player-name {
  margin: 0 0 16px;
  font-size: clamp(38px, 7vw, 67px);
  line-height: 0.98;
  letter-spacing: -3px;
}

.team-information {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 17px;
  font-weight: 700;
  color: #dce1da;
}

.team-flag {
  font-size: 30px;
}

.information-section {
  padding: 42px;
}

.section-title {
  margin: 0 0 25px;
  font-size: 25px;
}

.information-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
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

.team-section {
  padding: 0 42px 42px;
}

.team-section-content {
  display: flex;
  padding: 26px;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  border: 1px solid #d7e8bd;
  border-radius: 17px;
  background: var(--lime-soft);
}

.team-section-label {
  font-size: 9px;
  font-weight: 900;
  color: var(--lime-dark);
  letter-spacing: 1px;
}

.team-section h2 {
  margin: 6px 0;
  font-size: 22px;
}

.team-section p {
  margin: 0;
  font-size: 12px;
  color: var(--gray);
}

.page-actions {
  display: flex;
  padding: 26px 42px;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid var(--border);
  background: #f8f9f7;
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
.error-state,
.empty-state {
  padding: 70px 25px;
  text-align: center;
}

.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--gray);
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

.spinner {
  width: 44px;
  height: 44px;
  margin-bottom: 16px;
  border: 4px solid #dfe3dc;
  border-top-color: var(--lime-dark);
  border-radius: 50%;
  animation: spin 700ms linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 700px) {
  .player-detail-page {
    padding: 38px 14px;
  }

  .player-hero {
    padding: 40px 22px;
    flex-direction: column;
    text-align: center;
  }

  .shirt-number {
    width: 120px;
    height: 120px;
    font-size: 52px;
  }

  .player-name {
    font-size: 40px;
    letter-spacing: -2px;
  }

  .team-information {
    justify-content: center;
  }

  .information-section {
    padding: 28px 18px;
  }

  .information-grid {
    grid-template-columns: 1fr;
  }

  .team-section {
    padding: 0 18px 28px;
  }

  .team-section-content {
    align-items: flex-start;
    flex-direction: column;
  }

  .team-section-content .btn {
    width: 100%;
  }

  .page-actions {
    padding: 22px 18px;
    flex-direction: column;
  }

  .page-actions .btn {
    width: 100%;
  }
}
</style>
