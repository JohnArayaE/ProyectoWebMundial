<template>
  <div class="page-wrapper">
    <AppHeader
      :loading="loadingAuth || loading"
      @logout="logout"
    />

    <main class="simulation-page">
      <section class="main-content">
        <NuxtLink
          to="/standings"
          class="back-link"
        >
          ← Volver a posiciones
        </NuxtLink>

        <header class="page-header">
          <div>
            <span class="page-label">
              Herramienta de prueba
            </span>

            <h1>Simulación del torneo</h1>

            <p>
              Genera automáticamente los 48 equipos, los 72
              partidos de fase de grupos, las tablas de
              posiciones y los 32 clasificados.
            </p>
          </div>
        </header>

        <div
          v-if="pageError || error"
          class="message error-message"
          role="alert"
        >
          <span>!</span>

          <p>
            {{ pageError || error }}
          </p>
        </div>

        <div
          v-if="pageMessage"
          class="message success-message"
          role="status"
        >
          <span>✓</span>

          <p>
            {{ pageMessage }}
          </p>
        </div>

        <section class="information-card">
          <div class="card-heading">
            <div>
              <span class="section-label">
                Datos actuales
              </span>

              <h2>Estado de Firestore</h2>

              <p>
                Estos son los datos relacionados con el torneo
                que existen actualmente.
              </p>
            </div>

            <button
              type="button"
              class="refresh-button"
              :disabled="loading"
              @click="loadCurrentCounts"
            >
              Recargar datos
            </button>
          </div>

          <div class="counts-grid">
            <article class="count-card">
              <span>Selecciones</span>

              <strong>
                {{ dataCounts.teams }}
              </strong>

              <small>
                Documentos en teams
              </small>
            </article>

            <article class="count-card">
              <span>Partidos</span>

              <strong>
                {{ dataCounts.matches }}
              </strong>

              <small>
                Documentos en matches
              </small>
            </article>

            <article class="count-card">
              <span>Posiciones</span>

              <strong>
                {{ dataCounts.standings }}
              </strong>

              <small>
                Documentos en standings
              </small>
            </article>
          </div>
        </section>

        <section class="generator-card">
          <div class="generator-header">
            <div>
              <span class="section-label">
                Generador automático
              </span>

              <h2>Crear torneo completo</h2>

              <p>
                La simulación reemplazará los datos actuales de
                equipos, partidos y posiciones.
              </p>
            </div>

            <div class="generator-icon">
              ⚽
            </div>
          </div>

          <div class="generation-details">
            <article>
              <strong>48</strong>
              <span>Selecciones</span>
            </article>

            <span class="arrow">→</span>

            <article>
              <strong>72</strong>
              <span>Partidos de grupos</span>
            </article>

            <span class="arrow">→</span>

            <article>
              <strong>12</strong>
              <span>Grupos terminados</span>
            </article>

            <span class="arrow">→</span>

            <article>
              <strong>32</strong>
              <span>Clasificados</span>
            </article>
          </div>

          <div
            v-if="loading"
            class="progress-section"
          >
            <div class="progress-information">
              <span>
                {{ progressMessage }}
              </span>

              <strong>
                {{ progress }}%
              </strong>
            </div>

            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{
                  width: `${progress}%`
                }"
              />
            </div>

            <p>
              No cierres la página mientras se generan los
              documentos.
            </p>
          </div>

          <div class="warning-box">
            <span>!</span>

            <div>
              <strong>
                Se reemplazarán los datos del torneo
              </strong>

              <p>
                Se eliminarán los documentos actuales de
                <code>teams</code>, <code>matches</code> y
                <code>standings</code>. Los usuarios no serán
                eliminados.
              </p>
            </div>
          </div>

          <div class="generator-actions">
            <button
              type="button"
              class="clear-button"
              :disabled="
                loading ||
                !hasTournamentData
              "
              @click="clearSimulation"
            >
              Limpiar datos del torneo
            </button>

            <button
              type="button"
              class="generate-button"
              :disabled="loading"
              @click="generateSimulation"
            >
              {{
                loading
                  ? "Generando simulación..."
                  : hasTournamentData
                    ? "Reemplazar y generar simulación"
                    : "Generar simulación"
              }}
            </button>
          </div>
        </section>

        <section
          v-if="simulationSummary"
          class="result-card"
        >
          <div class="result-icon">
            ✓
          </div>

          <div class="result-content">
            <span class="section-label">
              Simulación completada
            </span>

            <h2>El torneo está listo</h2>

            <p>
              Todos los grupos fueron generados y ya existen los
              equipos necesarios para crear el bracket.
            </p>

            <div class="result-grid">
              <div>
                <span>Equipos creados</span>

                <strong>
                  {{
                    simulationSummary
                      .teamsCreated
                  }}
                </strong>
              </div>

              <div>
                <span>Partidos creados</span>

                <strong>
                  {{
                    simulationSummary
                      .matchesCreated
                  }}
                </strong>
              </div>

              <div>
                <span>Posiciones creadas</span>

                <strong>
                  {{
                    simulationSummary
                      .standingsCreated
                  }}
                </strong>
              </div>

              <div>
                <span>Grupos terminados</span>

                <strong>
                  {{
                    simulationSummary
                      .completedGroups
                  }}/12
                </strong>
              </div>

              <div>
                <span>Clasificados</span>

                <strong>
                  {{
                    simulationSummary
                      .qualifiedTeams
                  }}/32
                </strong>
              </div>

              <div>
                <span>Bracket disponible</span>

                <strong>
                  {{
                    simulationSummary
                      .isReadyForBracket
                      ? "Sí"
                      : "No"
                  }}
                </strong>
              </div>
            </div>

            <div class="result-actions">
              <NuxtLink
                to="/standings"
                class="secondary-link"
              >
                Ver posiciones
              </NuxtLink>

              <NuxtLink
                to="/bracket"
                class="bracket-link"
              >
                Ir al bracket
              </NuxtLink>
            </div>
          </div>
        </section>
      </section>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import {
  useAuth
} from "../../composables/useAuth"

import {
  useTournamentSimulation
} from "../../composables/useTournamentSimulation"

const {
  currentUser,
  loadingAuth,
  initAuth,
  logout
} = useAuth()

const {
  loading,
  error,

  progress,
  progressMessage,

  dataCounts,
  hasTournamentData,

  simulationSummary,

  getCurrentDataCounts,
  generateTournamentSimulation,
  clearTournamentData
} = useTournamentSimulation()

const pageError = ref("")
const pageMessage = ref("")

const loadCurrentCounts =
  async (): Promise<void> => {
    pageError.value = ""

    try {
      await getCurrentDataCounts()
    } catch (caughtError) {
      pageError.value =
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudieron cargar los datos actuales."

      console.error(
        "[simulation/index] loadCurrentCounts:",
        caughtError
      )
    }
  }

const generateSimulation =
  async (): Promise<void> => {
    pageError.value = ""
    pageMessage.value = ""

    const replaceExistingData =
      hasTournamentData.value

    if (replaceExistingData) {
      const confirmed = window.confirm(
        "Ya existen datos del torneo. ¿Deseas eliminar los equipos, partidos y posiciones actuales para generar la simulación completa?"
      )

      if (!confirmed) {
        return
      }
    }

    try {
      await generateTournamentSimulation({
        replaceExistingData
      })

      pageMessage.value =
        "La simulación fue generada correctamente. Ya puedes revisar las posiciones y generar el bracket."
    } catch (caughtError) {
      pageError.value =
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudo generar la simulación."

      console.error(
        "[simulation/index] generateSimulation:",
        caughtError
      )
    }
  }

const clearSimulation =
  async (): Promise<void> => {
    const confirmed = window.confirm(
      "¿Deseas eliminar todos los equipos, partidos y posiciones del torneo?"
    )

    if (!confirmed) {
      return
    }

    pageError.value = ""
    pageMessage.value = ""

    try {
      await clearTournamentData()

      pageMessage.value =
        "Los datos del torneo fueron eliminados correctamente."
    } catch (caughtError) {
      pageError.value =
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudieron eliminar los datos del torneo."

      console.error(
        "[simulation/index] clearSimulation:",
        caughtError
      )
    }
  }

watch(
  [loadingAuth, currentUser],
  async ([authLoading, user]) => {
    if (!authLoading && !user) {
      await navigateTo("/login")
    }
  }
)

useHead({
  title:
    "Simulación | World Cup Tracker 2026",

  meta: [
    {
      name: "description",
      content:
        "Genera datos de prueba para simular el Mundial 2026."
    }
  ]
})

onMounted(async () => {
  initAuth()
  await loadCurrentCounts()
})
</script>

<style scoped>
.page-wrapper {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  background: #eef1ec;
}

.simulation-page {
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
      circle at 10% 8%,
      rgba(157, 202, 83, 0.14),
      transparent 25%
    ),
    #eef1ec;
}

.main-content {
  width: min(1150px, calc(100% - 48px));
  margin: 0 auto;
  padding: 45px 0 75px;
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
  margin-bottom: 30px;
}

.page-label,
.section-label {
  display: block;
  margin-bottom: 8px;
  font-size: 9px;
  font-weight: 900;
  color: var(--lime-dark);
  text-transform: uppercase;
  letter-spacing: 1.4px;
}

.page-header h1 {
  margin: 0 0 12px;
  font-size: clamp(40px, 6vw, 60px);
  line-height: 1;
  letter-spacing: -3px;
}

.page-header p {
  max-width: 720px;
  margin: 0;
  line-height: 1.6;
  color: var(--gray);
}

.information-card,
.generator-card,
.result-card {
  padding: 28px;
  margin-bottom: 24px;
  border: 1px solid var(--border);
  border-radius: 22px;
  background: var(--white);
  box-shadow: 0 14px 38px rgba(20, 25, 20, 0.06);
}

.card-heading,
.generator-header {
  display: flex;
  gap: 25px;
  align-items: flex-start;
  justify-content: space-between;
  padding-bottom: 22px;
  margin-bottom: 22px;
  border-bottom: 1px solid var(--border);
}

.card-heading h2,
.generator-header h2,
.result-content h2 {
  margin: 0 0 8px;
  font-size: 27px;
}

.card-heading p,
.generator-header p,
.result-content p {
  max-width: 680px;
  margin: 0;
  font-size: 12px;
  line-height: 1.55;
  color: var(--gray);
}

.refresh-button {
  flex: 0 0 auto;
  min-height: 40px;
  padding: 9px 13px;
  font: inherit;
  font-size: 10px;
  font-weight: 900;
  cursor: pointer;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: #f5f6f4;
}

.counts-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 15px;
}

.count-card {
  display: grid;
  min-height: 130px;
  padding: 20px;
  align-content: space-between;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: #f9faf8;
}

.count-card span {
  font-size: 9px;
  font-weight: 900;
  color: var(--lime-dark);
  text-transform: uppercase;
}

.count-card strong {
  font-size: 32px;
}

.count-card small {
  font-size: 9px;
  color: var(--gray);
}

.generator-icon {
  display: grid;
  width: 50px;
  height: 50px;
  flex: 0 0 auto;
  font-size: 25px;
  place-items: center;
  border-radius: 15px;
  background: var(--lime-soft);
}

.generation-details {
  display: grid;
  grid-template-columns:
    1fr auto 1fr auto 1fr auto 1fr;
  gap: 13px;
  align-items: center;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 16px;
  background: var(--black);
}

.generation-details article {
  display: grid;
  gap: 5px;
  text-align: center;
}

.generation-details strong {
  font-size: 27px;
  color: var(--lime);
}

.generation-details span {
  font-size: 9px;
  color: #d2d7cf;
}

.arrow {
  font-size: 18px !important;
  color: var(--lime) !important;
}

.progress-section {
  padding: 18px;
  margin-bottom: 20px;
  border: 1px solid #cbdcab;
  border-radius: 14px;
  background: var(--lime-soft);
}

.progress-information {
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.progress-information span {
  font-size: 11px;
  font-weight: 800;
}

.progress-information strong {
  font-size: 12px;
}

.progress-bar {
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: #d8e4c5;
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: var(--lime-dark);
  transition: width 250ms ease;
}

.progress-section p {
  margin: 9px 0 0;
  font-size: 9px;
  color: var(--gray);
}

.warning-box {
  display: flex;
  gap: 13px;
  align-items: flex-start;
  padding: 16px;
  margin-bottom: 22px;
  color: #745b16;
  border: 1px solid #e9d188;
  border-radius: 13px;
  background: #fff8df;
}

.warning-box > span {
  display: grid;
  width: 26px;
  height: 26px;
  flex: 0 0 auto;
  font-size: 11px;
  font-weight: 900;
  color: white;
  place-items: center;
  border-radius: 50%;
  background: #ae8725;
}

.warning-box strong {
  font-size: 11px;
}

.warning-box p {
  margin: 5px 0 0;
  font-size: 10px;
  line-height: 1.5;
}

.warning-box code {
  font-weight: 900;
}

.generator-actions {
  display: flex;
  gap: 11px;
  justify-content: flex-end;
}

.generator-actions button {
  min-height: 45px;
  padding: 10px 17px;
  font: inherit;
  font-size: 11px;
  font-weight: 900;
  cursor: pointer;
  border-radius: 11px;
}

.generate-button {
  color: var(--black);
  border: 1px solid var(--lime);
  background: var(--lime);
}

.generate-button:hover:not(:disabled) {
  color: var(--white);
  border-color: var(--black);
  background: var(--black);
}

.clear-button {
  color: #922f2f;
  border: 1px solid #efc3c3;
  background: #fff0f0;
}

.generator-actions button:disabled,
.refresh-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.result-card {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  border-color: #c9dda8;
  background: #f8fced;
}

.result-icon {
  display: grid;
  width: 52px;
  height: 52px;
  flex: 0 0 auto;
  font-size: 20px;
  font-weight: 900;
  place-items: center;
  border-radius: 15px;
  background: var(--lime);
}

.result-content {
  width: 100%;
}

.result-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 22px;
}

.result-grid > div {
  display: grid;
  gap: 7px;
  padding: 14px;
  border-radius: 12px;
  background: var(--white);
}

.result-grid span {
  font-size: 8px;
  font-weight: 900;
  color: var(--gray);
  text-transform: uppercase;
}

.result-grid strong {
  font-size: 20px;
}

.result-actions {
  display: flex;
  gap: 10px;
  margin-top: 22px;
}

.result-actions a {
  min-height: 43px;
  padding: 11px 16px;
  font-size: 11px;
  font-weight: 900;
  text-decoration: none;
  border-radius: 10px;
}

.secondary-link {
  color: var(--text);
  border: 1px solid var(--border);
  background: var(--white);
}

.bracket-link {
  color: var(--black);
  border: 1px solid var(--lime);
  background: var(--lime);
}

.message {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 14px 16px;
  margin-bottom: 18px;
  border-radius: 12px;
}

.message span {
  display: grid;
  width: 24px;
  height: 24px;
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

.success-message {
  color: #486426;
  border: 1px solid #cee2ad;
  background: #f0f7e5;
}

.success-message span {
  color: var(--black);
  background: var(--lime);
}

.error-message {
  color: #842e2e;
  border: 1px solid #efc4c4;
  background: #fff1f1;
}

.error-message span {
  color: var(--white);
  background: #b83a3a;
}

@media (max-width: 800px) {
  .generation-details {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .arrow {
    display: none;
  }

  .result-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .main-content {
    width: min(100% - 28px, 1150px);
    padding: 35px 0 55px;
  }

  .information-card,
  .generator-card,
  .result-card {
    padding: 20px;
  }

  .card-heading,
  .generator-header {
    display: grid;
  }

  .counts-grid,
  .result-grid {
    grid-template-columns: 1fr;
  }

  .generation-details {
    grid-template-columns: 1fr;
  }

  .generator-actions,
  .result-actions {
    display: grid;
  }

  .generator-actions button,
  .result-actions a {
    width: 100%;
    text-align: center;
  }

  .result-card {
    display: grid;
  }
}
</style>