<template>
  <div class="page-wrapper">
    <AppHeader
      :loading="loadingAuth"
      @logout="logout"
    />

    <main class="dashboard-page">
      <section class="main-content">
        <section
          v-if="pageLoading"
          class="state-card"
        >
          <span class="spinner" />

          <h1>Cargando dashboard</h1>

          <p>
            Estamos reuniendo las estadísticas actuales del torneo.
          </p>
        </section>

        <template v-else-if="currentUser">
          <header class="page-header">
            <div>
              <span class="page-label">
                Resumen general
              </span>

              <h1>Dashboard del torneo</h1>

              <p>
                Consulta los principales indicadores del Mundial
                2026 desde un solo lugar.
              </p>
            </div>

            <button
              type="button"
              class="refresh-button"
              :disabled="loading"
              @click="refreshDashboard"
            >
              <span aria-hidden="true">
                {{ loading ? "…" : "↻" }}
              </span>

              {{
                loading
                  ? "Actualizando..."
                  : "Actualizar datos"
              }}
            </button>
          </header>

          <section class="update-information">
            <div>
              <span class="live-dot" />

              <p>
                Datos obtenidos directamente desde Firestore
              </p>
            </div>

            <small>
              Última actualización:
              <strong>{{ formattedLastUpdated }}</strong>
            </small>
          </section>

          <div
            v-if="error && lastUpdated"
            class="error-banner"
            role="alert"
          >
            <span>!</span>

            <p>
              {{ error }} Se mantienen visibles los últimos datos
              cargados correctamente.
            </p>

            <button
              type="button"
              :disabled="loading"
              @click="refreshDashboard"
            >
              Reintentar
            </button>
          </div>

          <section
            v-if="error && !lastUpdated"
            class="state-card error-state"
          >
            <span class="state-symbol">!</span>

            <h2>No se pudo cargar el dashboard</h2>

            <p>{{ error }}</p>

            <button
              type="button"
              class="state-button"
              :disabled="loading"
              @click="refreshDashboard"
            >
              Intentar nuevamente
            </button>
          </section>

          <section
            v-else-if="!hasData"
            class="state-card empty-state"
          >
            <span class="state-symbol">○</span>

            <h2>Aún no hay información disponible</h2>

            <p>
              Cuando se registren partidos, usuarios o
              predicciones, sus indicadores aparecerán aquí.
            </p>

            <button
              type="button"
              class="state-button"
              :disabled="loading"
              @click="refreshDashboard"
            >
              Revisar nuevamente
            </button>
          </section>

          <section
            v-else
            class="metrics-section"
            aria-label="Indicadores del torneo"
          >
            <div class="section-heading">
              <div>
                <span>Estadísticas</span>

                <h2>Estado actual del Mundial</h2>
              </div>

              <p>
                Los valores consideran toda la información
                registrada en el sistema.
              </p>
            </div>

            <div class="metrics-grid">
              <article class="metric-card">
                <div
                  class="metric-icon"
                  aria-hidden="true"
                >
                  ✓
                </div>

                <div class="metric-information">
                  <span class="metric-title">
                    Partidos jugados
                  </span>

                  <strong class="metric-value">
                    {{ stats.matchesPlayed }}
                  </strong>

                  <p>
                    Encuentros que ya tienen estado Finalizado.
                  </p>
                </div>
              </article>

              <article class="metric-card">
                <div
                  class="metric-icon"
                  aria-hidden="true"
                >
                  ◷
                </div>

                <div class="metric-information">
                  <span class="metric-title">
                    Partidos pendientes
                  </span>

                  <strong class="metric-value">
                    {{ stats.matchesPending }}
                  </strong>

                  <p>
                    Encuentros que permanecen Programados.
                  </p>
                </div>
              </article>

              <article class="metric-card">
                <div
                  class="metric-icon"
                  aria-hidden="true"
                >
                  ⚽
                </div>

                <div class="metric-information">
                  <span class="metric-title">
                    Goles anotados
                  </span>

                  <strong class="metric-value">
                    {{ stats.totalGoals }}
                  </strong>

                  <p>
                    Goles de partidos En Vivo y Finalizados.
                  </p>
                </div>
              </article>

              <article class="metric-card">
                <div
                  class="metric-icon"
                  aria-hidden="true"
                >
                  ◆
                </div>

                <div class="metric-information">
                  <span class="metric-title">
                    Selecciones clasificadas
                  </span>

                  <strong class="metric-value">
                    {{ stats.qualifiedTeams }}
                  </strong>

                  <p>
                    Clasificadas confirmadas de un total de 32.
                  </p>
                </div>
              </article>

              <article class="metric-card">
                <div
                  class="metric-icon"
                  aria-hidden="true"
                >
                  ★
                </div>

                <div class="metric-information">
                  <span class="metric-title">
                    Mayor puntaje
                  </span>

                  <strong class="metric-value">
                    {{ topUserName }}
                  </strong>

                  <p>{{ topUserDescription }}</p>
                </div>
              </article>

              <article class="metric-card">
                <div
                  class="metric-icon"
                  aria-hidden="true"
                >
                  ♛
                </div>

                <div class="metric-information">
                  <span class="metric-title">
                    Predicciones realizadas
                  </span>

                  <strong class="metric-value">
                    {{ stats.totalPredictions }}
                  </strong>

                  <p>
                    Predicciones de marcador y campeón guardadas.
                  </p>
                </div>
              </article>
            </div>
          </section>
        </template>

        <section
          v-else
          class="state-card"
        >
          <span class="spinner" />

          <h1>Redirigiendo</h1>

          <p>
            Necesitas iniciar sesión para ver el dashboard.
          </p>
        </section>
      </section>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import {
  useDashboard
} from "../../composables/useDashboard"

const {
  currentUser,
  loadingAuth,
  initAuth,
  logout
} = useAuth()

const {
  stats,
  loading,
  error,
  hasData,
  lastUpdated,
  fetchDashboard
} = useDashboard()

const hydrated = ref(false)

const pageLoading = computed<boolean>(() => {
  return (
    !hydrated.value ||
    (loadingAuth.value && !currentUser.value) ||
    (
      Boolean(currentUser.value) &&
      loading.value &&
      !lastUpdated.value
    )
  )
})

const formattedLastUpdated = computed<string>(() => {
  if (!lastUpdated.value) {
    return "Sin actualizar"
  }

  const updateDate = new Date(
    lastUpdated.value
  )

  if (Number.isNaN(updateDate.getTime())) {
    return "Sin actualizar"
  }

  return new Intl.DateTimeFormat(
    "es-CR",
    {
      dateStyle: "medium",
      timeStyle: "short"
    }
  ).format(updateDate)
})

const topUserName = computed<string>(() => {
  return (
    stats.value.topUser?.name ??
    "Sin usuarios"
  )
})

const topUserDescription = computed<string>(() => {
  const topUser = stats.value.topUser

  if (!topUser) {
    return "Todavía no hay usuarios registrados."
  }

  return topUser.points === 1
    ? "1 punto acumulado."
    : `${topUser.points} puntos acumulados.`
})

const refreshDashboard = async (): Promise<void> => {
  await fetchDashboard()
}

watch(
  () => currentUser.value?.uid ?? "",
  async userId => {
    if (userId) {
      await fetchDashboard()
    }
  },
  {
    immediate: true
  }
)

watch(
  [hydrated, loadingAuth, currentUser],
  async ([isHydrated, authLoading, user]) => {
    if (
      isHydrated &&
      !authLoading &&
      !user
    ) {
      await navigateTo("/login")
    }
  }
)

useHead({
  title: "Dashboard | World Cup Tracker 2026",
  meta: [
    {
      name: "description",
      content:
        "Consulta los principales indicadores del Mundial 2026."
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

.dashboard-page {
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
      circle at 8% 10%,
      rgba(157, 202, 83, 0.12),
      transparent 29%
    ),
    var(--background);
}

.main-content {
  width: min(1180px, calc(100% - 48px));
  padding: 54px 0 72px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  gap: 30px;
  align-items: flex-end;
  justify-content: space-between;
  padding: 38px;
  color: #ffffff;
  border: 1px solid rgba(157, 202, 83, 0.25);
  border-radius: 25px;
  background:
    linear-gradient(
      120deg,
      #0b0d0c 0%,
      #141914 67%,
      #23301b 100%
    );
  box-shadow: 0 22px 55px rgba(0, 0, 0, 0.18);
}

.page-label,
.section-heading span {
  display: block;
  margin-bottom: 10px;
  font-size: 10px;
  font-weight: 900;
  color: var(--lime);
  text-transform: uppercase;
  letter-spacing: 1.4px;
}

.page-header h1 {
  margin: 0;
  font-size: clamp(30px, 4vw, 48px);
  letter-spacing: -1.5px;
}

.page-header p {
  max-width: 650px;
  margin: 14px 0 0;
  font-size: 13px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.64);
}

.refresh-button,
.state-button,
.error-banner button {
  font: inherit;
  font-weight: 900;
  cursor: pointer;
  border: 1px solid var(--lime);
  border-radius: 12px;
  transition:
    background 180ms ease,
    border-color 180ms ease,
    transform 180ms ease;
}

.refresh-button {
  display: flex;
  gap: 9px;
  align-items: center;
  justify-content: center;
  min-width: 175px;
  min-height: 46px;
  padding: 11px 17px;
  font-size: 11px;
  color: var(--black);
  background: var(--lime);
}

.refresh-button span {
  font-size: 17px;
}

.refresh-button:hover:not(:disabled),
.state-button:hover:not(:disabled) {
  border-color: #ffffff;
  background: #ffffff;
  transform: translateY(-2px);
}

.refresh-button:disabled,
.state-button:disabled,
.error-banner button:disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.update-information {
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: space-between;
  padding: 15px 19px;
  margin-top: 18px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.8);
}

.update-information > div {
  display: flex;
  gap: 9px;
  align-items: center;
}

.update-information p,
.update-information small {
  margin: 0;
  font-size: 10px;
  color: var(--gray);
}

.update-information strong {
  color: var(--text);
}

.live-dot {
  width: 8px;
  height: 8px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: var(--lime);
  box-shadow: 0 0 10px rgba(157, 202, 83, 0.72);
}

.metrics-section {
  margin-top: 46px;
}

.section-heading {
  display: flex;
  gap: 30px;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 22px;
}

.section-heading span {
  color: var(--lime-dark);
}

.section-heading h2 {
  margin: 0;
  font-size: 26px;
  letter-spacing: -0.7px;
}

.section-heading p {
  max-width: 390px;
  margin: 0;
  font-size: 11px;
  line-height: 1.6;
  color: var(--gray);
  text-align: right;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.metric-card {
  position: relative;
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr);
  gap: 18px;
  align-items: flex-start;
  min-height: 190px;
  padding: 26px;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 22px;
  background: var(--white);
  box-shadow: 0 16px 42px rgba(18, 24, 17, 0.07);
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.metric-card::after {
  position: absolute;
  right: -44px;
  bottom: -55px;
  width: 130px;
  height: 130px;
  content: "";
  border-radius: 50%;
  background: rgba(157, 202, 83, 0.09);
}

.metric-card:hover {
  border-color: #c6dda2;
  box-shadow: 0 20px 48px rgba(18, 24, 17, 0.11);
  transform: translateY(-3px);
}

.metric-icon {
  position: relative;
  z-index: 1;
  display: grid;
  width: 58px;
  height: 58px;
  font-size: 24px;
  color: var(--text);
  place-items: center;
  border: 1px solid #d7e7bc;
  border-radius: 17px;
  background: var(--lime-soft);
}

.metric-information {
  position: relative;
  z-index: 1;
  min-width: 0;
}

.metric-title {
  display: block;
  margin-bottom: 11px;
  font-size: 10px;
  font-weight: 900;
  color: var(--lime-dark);
  text-transform: uppercase;
  letter-spacing: 1.15px;
}

.metric-value {
  display: block;
  overflow: hidden;
  font-size: clamp(27px, 3vw, 38px);
  line-height: 1.08;
  color: var(--text);
  text-overflow: ellipsis;
}

.metric-information p {
  margin: 12px 0 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--gray);
}

.state-card {
  display: grid;
  justify-items: center;
  min-height: 360px;
  padding: 58px 28px;
  text-align: center;
  place-content: center;
  border: 1px solid var(--border, #dce1d9);
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 16px 45px rgba(18, 24, 17, 0.07);
}

.state-card h1,
.state-card h2 {
  margin: 20px 0 8px;
  font-size: 25px;
}

.state-card p {
  max-width: 540px;
  margin: 0;
  font-size: 12px;
  line-height: 1.7;
  color: #747c74;
}

.spinner {
  width: 42px;
  height: 42px;
  border: 4px solid #e1e7dc;
  border-top-color: #9dca53;
  border-radius: 50%;
  animation: spin 750ms linear infinite;
}

.state-symbol {
  display: grid;
  width: 54px;
  height: 54px;
  font-size: 24px;
  font-weight: 900;
  color: var(--lime-dark);
  place-items: center;
  border-radius: 16px;
  background: var(--lime-soft);
}

.error-state .state-symbol {
  color: var(--danger);
  background: #fbeaea;
}

.state-button {
  min-height: 44px;
  padding: 10px 18px;
  margin-top: 24px;
  font-size: 11px;
  color: var(--black);
  background: var(--lime);
}

.error-banner {
  display: grid;
  grid-template-columns: 32px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 14px 16px;
  margin-top: 18px;
  border: 1px solid #e7bcbc;
  border-radius: 13px;
  background: #fff0f0;
}

.error-banner > span {
  display: grid;
  width: 30px;
  height: 30px;
  font-weight: 900;
  color: #ffffff;
  place-items: center;
  border-radius: 9px;
  background: var(--danger);
}

.error-banner p {
  margin: 0;
  font-size: 11px;
  line-height: 1.55;
  color: #7c3030;
}

.error-banner button {
  padding: 8px 12px;
  font-size: 10px;
  color: #7c3030;
  border-color: #d89595;
  background: #ffffff;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .metrics-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .main-content {
    width: min(100% - 32px, 1180px);
    padding: 34px 0 52px;
  }

  .page-header,
  .section-heading,
  .update-information {
    align-items: stretch;
    flex-direction: column;
  }

  .page-header {
    padding: 28px;
  }

  .refresh-button {
    width: 100%;
  }

  .section-heading p {
    max-width: none;
    text-align: left;
  }

  .error-banner {
    grid-template-columns: 32px 1fr;
  }

  .error-banner button {
    grid-column: 1 / -1;
  }
}

@media (max-width: 580px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .metric-card {
    min-height: 0;
    padding: 22px;
  }

  .metric-value {
    font-size: 30px;
  }

  .page-header {
    padding: 24px;
  }

  .page-header h1 {
    font-size: 32px;
  }
}
</style>