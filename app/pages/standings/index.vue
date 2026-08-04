<template>
  <div class="page-wrapper">
    <AppHeader
      :loading="
        loadingAuth ||
        loading ||
        recalculating
      "
      @logout="logout"
    />

    <main class="standings-page">
      <section class="main-content">
        <header class="page-header">
          <div class="header-information">
            <span class="page-label">
              Fase de grupos
            </span>

            <h1>Tablas de posiciones</h1>

            <p>
              Consulta la clasificación de los doce grupos,
              los mejores terceros y las selecciones que
              avanzarían a la fase eliminatoria.
            </p>
          </div>

          <button
            type="button"
            class="recalculate-button"
            :disabled="
              recalculating ||
              loading
            "
            @click="recalculateEverything"
          >
            <span
              class="recalculate-icon"
              aria-hidden="true"
            >
              ↻
            </span>

            <span>
              <strong>
                {{
                  recalculating
                    ? "Calculando..."
                    : "Recalcular posiciones"
                }}
              </strong>

              <small>
                Actualizar todos los grupos
              </small>
            </span>
          </button>
        </header>

        <section
          class="qualification-status"
          :class="{
            'qualification-ready':
              qualificationSummary
                .isReadyForBracket
          }"
        >
          <div class="status-icon">
            {{
              qualificationSummary
                .isReadyForBracket
                ? "✓"
                : "!"
            }}
          </div>

          <div>
            <strong>
              {{
                qualificationSummary
                  .isReadyForBracket
                  ? "Clasificación lista para el bracket"
                  : "Clasificación provisional"
              }}
            </strong>

            <p>
              {{
                qualificationSummary
                  .isReadyForBracket
                  ? "Los doce grupos están terminados y ya existen 32 selecciones clasificadas."
                  : "Los clasificados pueden cambiar mientras existan grupos o partidos pendientes."
              }}
            </p>
          </div>
        </section>

        <section class="summary-grid">
          <article class="summary-card">
            <span>Grupos registrados</span>

            <strong>
              {{
                qualificationSummary
                  .groupsWithStandings
              }}/12
            </strong>

            <small>
              Con tabla generada
            </small>
          </article>

          <article class="summary-card">
            <span>Grupos terminados</span>

            <strong>
              {{
                qualificationSummary
                  .completedGroups
              }}/12
            </strong>

            <small>
              Cuatro equipos con tres partidos
            </small>
          </article>

          <article class="summary-card">
            <span>Clasificación directa</span>

            <strong>
              {{
                qualificationSummary
                  .directQualifiers
              }}/24
            </strong>

            <small>
              Primeros y segundos
            </small>
          </article>

          <article class="summary-card featured-summary">
            <span>Clasificados totales</span>

            <strong>
              {{
                qualificationSummary
                  .totalQualified
              }}/32
            </strong>

            <small>
              Incluyendo mejores terceros
            </small>
          </article>
        </section>

        <section
          v-if="initialLoading"
          class="state-card"
        >
          <span class="spinner" />

          <h2>Cargando posiciones</h2>

          <p>
            Estamos consultando las tablas guardadas en
            Firestore.
          </p>
        </section>

        <section
          v-else-if="pageError || error"
          class="state-card"
        >
          <span class="error-symbol">
            !
          </span>

          <h2>No se pudieron cargar las posiciones</h2>

          <p>
            {{ pageError || error }}
          </p>

          <button
            type="button"
            class="state-button"
            @click="loadStandings"
          >
            Volver a intentar
          </button>
        </section>

        <template v-else>
          <section class="section-block">
            <div class="section-header">
              <div>
                <span class="section-label">
                  Clasificación por grupos
                </span>

                <h2>Grupos A–L</h2>

                <p>
                  Los dos primeros de cada grupo clasifican
                  directamente. El tercero entra a la
                  comparación general.
                </p>
              </div>
            </div>

            <div class="groups-grid">
              <article
                v-for="groupData in groupTables"
                :key="groupData.group"
                class="group-card"
              >
                <div class="group-card-header">
                  <div>
                    <span>Grupo</span>

                    <strong>
                      {{ groupData.group }}
                    </strong>
                  </div>

                  <span
                    class="group-status"
                    :class="{
                      'group-complete':
                        isGroupComplete(
                          groupData.group
                        )
                    }"
                  >
                    {{
                      isGroupComplete(
                        groupData.group
                      )
                        ? "Terminado"
                        : "En progreso"
                    }}
                  </span>
                </div>

                <div
                  v-if="
                    groupData.standings
                      .length === 0
                  "
                  class="empty-group"
                >
                  <span>📊</span>

                  <strong>
                    Sin posiciones
                  </strong>

                  <p>
                    Todavía no existe una tabla para este
                    grupo.
                  </p>
                </div>

                <div
                  v-else
                  class="compact-table-container"
                >
                  <table class="compact-table">
                    <thead>
                      <tr>
                        <th>Pos.</th>
                        <th>Selección</th>
                        <th>PJ</th>
                        <th>DG</th>
                        <th>Pts.</th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr
                        v-for="(
                          standing,
                          index
                        ) in groupData.standings"
                        :key="standing.id"
                      >
                        <td>
                          <span
                            class="position"
                            :class="
                              getPositionClass(
                                index
                              )
                            "
                          >
                            {{ index + 1 }}
                          </span>
                        </td>

                        <td class="team-column">
                          <div class="team-row">
                            <div class="flag">
                              <img
                                v-if="
                                  isFlagImage(
                                    standing.flag
                                  )
                                "
                                :src="
                                  standing.flag
                                "
                                :alt="
                                  `Bandera de ${standing.teamName}`
                                "
                              >

                              <span v-else>
                                {{
                                  standing.flag ||
                                  "🏳️"
                                }}
                              </span>
                            </div>

                            <div>
                              <strong>
                                {{
                                  standing.teamName
                                }}
                              </strong>

                              <small>
                                {{
                                  getPositionText(
                                    index
                                  )
                                }}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td>
                          {{ standing.played }}
                        </td>

                        <td>
                          {{
                            formatGoalDifference(
                              standing
                                .goalDifference
                            )
                          }}
                        </td>

                        <td class="points">
                          {{ standing.points }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <NuxtLink
                  :to="
                    `/groups/${groupData.group}`
                  "
                  class="group-details-link"
                >
                  Ver grupo completo
                  <span aria-hidden="true">
                    →
                  </span>
                </NuxtLink>
              </article>
            </div>
          </section>

          <section class="section-block">
            <div class="section-header">
              <div>
                <span class="section-label">
                  Comparación general
                </span>

                <h2>Mejores terceros</h2>

                <p>
                  Los ocho terceros con mejor rendimiento
                  completan las 32 selecciones de
                  dieciseisavos.
                </p>
              </div>

              <span class="counter-badge">
                {{
                  qualificationSummary
                    .bestThirdPlaces
                }}/8 clasificados
              </span>
            </div>

            <div
              v-if="
                thirdPlacedTeams.length === 0
              "
              class="empty-section"
            >
              <span>🏆</span>

              <strong>
                Todavía no existen terceros
              </strong>

              <p>
                Cada grupo necesita al menos tres equipos en
                su tabla para realizar esta comparación.
              </p>
            </div>

            <div
              v-else
              class="third-table-container"
            >
              <table class="third-table">
                <thead>
                  <tr>
                    <th>Pos.</th>
                    <th>Selección</th>
                    <th>Grupo</th>
                    <th>PJ</th>
                    <th>G</th>
                    <th>E</th>
                    <th>P</th>
                    <th>GF</th>
                    <th>GC</th>
                    <th>DG</th>
                    <th>Pts.</th>
                    <th>Estado</th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="
                      thirdPlace in
                      thirdPlacedTeams
                    "
                    :key="thirdPlace.id"
                    :class="{
                      'qualified-third-row':
                        thirdPlace.qualified
                    }"
                  >
                    <td>
                      <span
                        class="third-rank"
                        :class="{
                          'qualified-third-rank':
                            thirdPlace.qualified
                        }"
                      >
                        {{
                          thirdPlace
                            .thirdPlaceRank
                        }}
                      </span>
                    </td>

                    <td class="third-team">
                      <strong>
                        {{ thirdPlace.teamName }}
                      </strong>
                    </td>

                    <td>
                      {{ thirdPlace.group }}
                    </td>

                    <td>
                      {{ thirdPlace.played }}
                    </td>

                    <td>
                      {{ thirdPlace.wins }}
                    </td>

                    <td>
                      {{ thirdPlace.draws }}
                    </td>

                    <td>
                      {{ thirdPlace.losses }}
                    </td>

                    <td>
                      {{ thirdPlace.goalsFor }}
                    </td>

                    <td>
                      {{
                        thirdPlace
                          .goalsAgainst
                      }}
                    </td>

                    <td>
                      {{
                        formatGoalDifference(
                          thirdPlace
                            .goalDifference
                        )
                      }}
                    </td>

                    <td class="points">
                      {{ thirdPlace.points }}
                    </td>

                    <td>
                      <span
                        class="qualification-badge"
                        :class="{
                          'qualified-badge':
                            thirdPlace.qualified
                        }"
                      >
                        {{
                          thirdPlace.qualified
                            ? "Clasifica"
                            : "No clasifica"
                        }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="section-block">
            <div class="section-header">
              <div>
                <span class="section-label">
                  Fase eliminatoria
                </span>

                <h2>Clasificados provisionales</h2>

                <p>
                  Estas selecciones alimentarían el bracket
                  de dieciseisavos según las posiciones
                  actuales.
                </p>
              </div>

              <span class="counter-badge dark-counter">
                {{ qualifiedTeams.length }}/32
              </span>
            </div>

            <div class="qualifiers-grid">
              <article class="qualifier-card">
                <div class="qualifier-card-header">
                  <span>1.º</span>

                  <div>
                    <strong>
                      Ganadores de grupo
                    </strong>

                    <small>
                      {{ groupWinners.length }}/12
                    </small>
                  </div>
                </div>

                <div
                  v-if="groupWinners.length"
                  class="qualifier-list"
                >
                  <div
                    v-for="team in groupWinners"
                    :key="team.id"
                    class="qualifier-team"
                  >
                    <span>
                      {{ team.group }}
                    </span>

                    <strong>
                      {{ team.teamName }}
                    </strong>

                    <small>
                      {{ team.points }} pts.
                    </small>
                  </div>
                </div>

                <p
                  v-else
                  class="empty-qualifier"
                >
                  Sin equipos disponibles.
                </p>
              </article>

              <article class="qualifier-card">
                <div class="qualifier-card-header">
                  <span>2.º</span>

                  <div>
                    <strong>
                      Segundos de grupo
                    </strong>

                    <small>
                      {{ groupRunnersUp.length }}/12
                    </small>
                  </div>
                </div>

                <div
                  v-if="
                    groupRunnersUp.length
                  "
                  class="qualifier-list"
                >
                  <div
                    v-for="
                      team in
                      groupRunnersUp
                    "
                    :key="team.id"
                    class="qualifier-team"
                  >
                    <span>
                      {{ team.group }}
                    </span>

                    <strong>
                      {{ team.teamName }}
                    </strong>

                    <small>
                      {{ team.points }} pts.
                    </small>
                  </div>
                </div>

                <p
                  v-else
                  class="empty-qualifier"
                >
                  Sin equipos disponibles.
                </p>
              </article>

              <article class="qualifier-card">
                <div class="qualifier-card-header">
                  <span>3.º</span>

                  <div>
                    <strong>
                      Mejores terceros
                    </strong>

                    <small>
                      {{
                        bestThirdPlacedTeams
                          .length
                      }}/8
                    </small>
                  </div>
                </div>

                <div
                  v-if="
                    bestThirdPlacedTeams
                      .length
                  "
                  class="qualifier-list"
                >
                  <div
                    v-for="
                      team in
                      bestThirdPlacedTeams
                    "
                    :key="team.id"
                    class="qualifier-team"
                  >
                    <span>
                      {{ team.group }}
                    </span>

                    <strong>
                      {{ team.teamName }}
                    </strong>

                    <small>
                      {{ team.points }} pts.
                    </small>
                  </div>
                </div>

                <p
                  v-else
                  class="empty-qualifier"
                >
                  Sin equipos disponibles.
                </p>
              </article>
            </div>
          </section>
        </template>
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
  useStandings,
  WORLD_CUP_GROUPS
} from "../../composables/useStandings"

const {
  currentUser,
  loadingAuth,
  initAuth,
  logout
} = useAuth()

const {
  standings,
  standingsByGroup,

  groupWinners,
  groupRunnersUp,
  thirdPlacedTeams,
  bestThirdPlacedTeams,
  qualifiedTeams,
  qualificationSummary,

  loading,
  error,

  fetchAllStandings,
  recalculateAllStandings,
  isGroupComplete
} = useStandings()

const recalculating = ref(false)
const pageError = ref("")

const groupTables = computed(() => {
  return WORLD_CUP_GROUPS.map(
    group => {
      return {
        group,

        standings:
          standingsByGroup.value[
            group
          ] ?? []
      }
    }
  )
})

const initialLoading = computed<boolean>(() => {
  return (
    loading.value &&
    standings.value.length === 0
  )
})

const loadStandings =
  async (): Promise<void> => {
    pageError.value = ""

    try {
      const storedStandings =
        await fetchAllStandings()

      if (storedStandings.length === 0) {
        await recalculateAllStandings()
        await fetchAllStandings()
      }
    } catch (caughtError) {
      pageError.value =
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudieron cargar las posiciones."

      console.error(
        "[standings/index] loadStandings:",
        caughtError
      )
    }
  }

const recalculateEverything =
  async (): Promise<void> => {
    pageError.value = ""

    try {
      recalculating.value = true

      await recalculateAllStandings()
      await fetchAllStandings()
    } catch (caughtError) {
      pageError.value =
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudieron recalcular las posiciones."

      console.error(
        "[standings/index] recalculateEverything:",
        caughtError
      )
    } finally {
      recalculating.value = false
    }
  }

const getPositionClass = (
  index: number
): string => {
  if (index === 0 || index === 1) {
    return "direct-position"
  }

  if (index === 2) {
    return "third-position"
  }

  return "regular-position"
}

const getPositionText = (
  index: number
): string => {
  if (index === 0) {
    return "Ganador de grupo"
  }

  if (index === 1) {
    return "Segundo de grupo"
  }

  if (index === 2) {
    return "Candidato a mejor tercero"
  }

  return "Fuera de clasificación"
}

const formatGoalDifference = (
  goalDifference: number
): string => {
  if (goalDifference > 0) {
    return `+${goalDifference}`
  }

  return String(goalDifference)
}

const isFlagImage = (
  flag: string
): boolean => {
  return (
    flag.startsWith("http://") ||
    flag.startsWith("https://") ||
    flag.startsWith("/")
  )
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
    "Posiciones | World Cup Tracker 2026",

  meta: [
    {
      name: "description",

      content:
        "Consulta las tablas, mejores terceros y clasificados del Mundial 2026."
    }
  ]
})

onMounted(async () => {
  initAuth()
  await loadStandings()
})
</script>

<style scoped>
.page-wrapper {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  background: #eef1ec;
}

.standings-page {
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
      circle at 10% 8%,
      rgba(157, 202, 83, 0.13),
      transparent 26%
    ),
    var(--background);
}

.main-content {
  width: min(1240px, calc(100% - 48px));
  margin: 0 auto;
  padding: 55px 0 75px;
}

.page-header {
  display: flex;
  gap: 40px;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 30px;
}

.header-information {
  min-width: 0;
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
  font-size: clamp(40px, 6vw, 62px);
  line-height: 1;
  letter-spacing: -3px;
}

.page-header p {
  max-width: 700px;
  margin: 0;
  font-size: 15px;
  line-height: 1.65;
  color: var(--gray);
}

.recalculate-button {
  display: flex;
  gap: 13px;
  align-items: center;
  min-width: 275px;
  min-height: 70px;
  padding: 14px 17px;
  color: var(--white);
  text-align: left;
  cursor: pointer;
  border: 1px solid var(--black);
  border-radius: 17px;
  background: var(--black);
  box-shadow: 0 14px 30px rgba(11, 13, 12, 0.16);
  transition:
    color 180ms ease,
    background 180ms ease,
    border-color 180ms ease,
    transform 180ms ease;
}

.recalculate-button:hover:not(:disabled) {
  color: var(--black);
  border-color: var(--lime);
  background: var(--lime);
  transform: translateY(-2px);
}

.recalculate-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.recalculate-button > span:last-child {
  display: grid;
  gap: 3px;
}

.recalculate-button strong {
  font-size: 12px;
}

.recalculate-button small {
  font-size: 10px;
  color: #bec5bb;
}

.recalculate-button:hover small {
  color: #405326;
}

.recalculate-icon {
  display: grid;
  width: 41px;
  height: 41px;
  flex: 0 0 auto;
  font-size: 23px;
  color: var(--black);
  place-items: center;
  border-radius: 12px;
  background: var(--lime);
}

.recalculate-button:hover .recalculate-icon {
  color: var(--white);
  background: var(--black);
}

.qualification-status {
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 17px 19px;
  margin-bottom: 22px;
  color: #755c17;
  border: 1px solid #ecd58b;
  border-radius: 15px;
  background: #fff8de;
}

.qualification-ready {
  color: #3f5b20;
  border-color: #c9dda8;
  background: #eef7df;
}

.status-icon {
  display: grid;
  width: 31px;
  height: 31px;
  flex: 0 0 auto;
  font-size: 13px;
  font-weight: 900;
  color: #ffffff;
  place-items: center;
  border-radius: 50%;
  background: #b6912c;
}

.qualification-ready .status-icon {
  background: var(--lime-dark);
}

.qualification-status strong {
  font-size: 13px;
}

.qualification-status p {
  margin: 3px 0 0;
  font-size: 11px;
  line-height: 1.5;
}

.summary-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 26px;
}

.summary-card {
  display: grid;
  min-height: 140px;
  padding: 22px;
  align-content: space-between;
  border: 1px solid var(--border);
  border-radius: 18px;
  background: var(--white);
  box-shadow: 0 10px 28px rgba(20, 25, 20, 0.05);
}

.summary-card > span {
  font-size: 9px;
  font-weight: 900;
  color: var(--lime-dark);
  text-transform: uppercase;
  letter-spacing: 1.2px;
}

.summary-card strong {
  font-size: 31px;
  line-height: 1;
}

.summary-card small {
  font-size: 10px;
  color: var(--gray);
}

.featured-summary {
  color: var(--white);
  border-color: var(--black);
  background: var(--black);
}

.featured-summary > span {
  color: var(--lime);
}

.featured-summary small {
  color: #c2c8c0;
}

.section-block {
  padding: 28px;
  margin-bottom: 25px;
  border: 1px solid var(--border);
  border-radius: 22px;
  background: var(--white);
  box-shadow: 0 14px 38px rgba(20, 25, 20, 0.06);
}

.section-header {
  display: flex;
  gap: 25px;
  align-items: flex-start;
  justify-content: space-between;
  padding-bottom: 22px;
  margin-bottom: 22px;
  border-bottom: 1px solid #e8ece6;
}

.section-label {
  display: block;
  margin-bottom: 7px;
  font-size: 9px;
  font-weight: 900;
  color: var(--lime-dark);
  text-transform: uppercase;
  letter-spacing: 1.3px;
}

.section-header h2 {
  margin: 0 0 7px;
  font-size: 27px;
}

.section-header p {
  max-width: 660px;
  margin: 0;
  font-size: 12px;
  line-height: 1.55;
  color: var(--gray);
}

.counter-badge {
  flex: 0 0 auto;
  padding: 9px 13px;
  font-size: 10px;
  font-weight: 900;
  color: #4d6d23;
  border-radius: 999px;
  background: var(--lime-soft);
}

.dark-counter {
  color: var(--lime);
  background: var(--black);
}

.groups-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.group-card {
  overflow: hidden;
  border: 1px solid #dfe4dc;
  border-radius: 17px;
  background: #fafbf9;
}

.group-card-header {
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: space-between;
  padding: 17px 18px;
  border-bottom: 1px solid #e3e7e0;
  background: var(--white);
}

.group-card-header > div {
  display: flex;
  gap: 9px;
  align-items: baseline;
}

.group-card-header > div > span {
  font-size: 9px;
  font-weight: 900;
  color: var(--gray);
  text-transform: uppercase;
}

.group-card-header strong {
  font-size: 25px;
}

.group-status {
  padding: 6px 9px;
  font-size: 8px;
  font-weight: 900;
  color: #765d18;
  border-radius: 999px;
  background: #fff0b8;
}

.group-complete {
  color: #486424;
  background: var(--lime-soft);
}

.compact-table-container {
  overflow-x: auto;
}

.compact-table {
  width: 100%;
  min-width: 530px;
  border-collapse: collapse;
}

.compact-table th {
  padding: 10px 8px;
  font-size: 8px;
  font-weight: 900;
  color: var(--gray);
  text-align: center;
  text-transform: uppercase;
  border-bottom: 1px solid #e1e5de;
}

.compact-table td {
  padding: 11px 8px;
  font-size: 10px;
  font-weight: 700;
  text-align: center;
  border-bottom: 1px solid #e8ebe6;
}

.compact-table tbody tr:last-child td {
  border-bottom: 0;
}

.team-column {
  min-width: 210px;
  text-align: left !important;
}

.team-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.flag {
  display: grid;
  width: 37px;
  height: 28px;
  flex: 0 0 auto;
  font-size: 18px;
  place-items: center;
  overflow: hidden;
  border: 1px solid #e0e4dd;
  border-radius: 6px;
  background: var(--white);
}

.flag img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.team-row > div:last-child {
  display: grid;
  gap: 3px;
}

.team-row strong {
  font-size: 11px;
}

.team-row small {
  font-size: 8px;
  color: var(--gray);
}

.position {
  display: grid;
  width: 27px;
  height: 27px;
  margin: auto;
  font-size: 9px;
  place-items: center;
  border-radius: 8px;
}

.direct-position {
  background: var(--lime);
}

.third-position {
  background: #f2d873;
}

.regular-position {
  color: var(--gray);
  background: #e9ece7;
}

.points {
  font-size: 13px !important;
  font-weight: 900 !important;
}

.group-details-link {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  min-height: 43px;
  font-size: 10px;
  font-weight: 900;
  color: var(--white);
  text-decoration: none;
  background: var(--black);
}

.group-details-link:hover {
  color: var(--black);
  background: var(--lime);
}

.empty-group {
  display: grid;
  min-height: 210px;
  padding: 25px;
  text-align: center;
  place-content: center;
}

.empty-group > span {
  margin-bottom: 10px;
  font-size: 27px;
}

.empty-group strong {
  margin-bottom: 6px;
}

.empty-group p {
  max-width: 230px;
  margin: 0;
  font-size: 10px;
  color: var(--gray);
}

.third-table-container {
  overflow-x: auto;
}

.third-table {
  width: 100%;
  min-width: 970px;
  border-collapse: collapse;
}

.third-table th {
  padding: 11px 9px;
  font-size: 8px;
  font-weight: 900;
  color: var(--gray);
  text-align: center;
  text-transform: uppercase;
  border-bottom: 1px solid var(--border);
}

.third-table td {
  padding: 13px 9px;
  font-size: 10px;
  font-weight: 700;
  text-align: center;
  border-bottom: 1px solid #e8ece6;
}

.qualified-third-row {
  background: #f7fbea;
}

.third-team {
  min-width: 155px;
  text-align: left !important;
}

.third-rank {
  display: grid;
  width: 28px;
  height: 28px;
  margin: auto;
  place-items: center;
  border-radius: 8px;
  background: #eaede8;
}

.qualified-third-rank {
  background: var(--lime);
}

.qualification-badge {
  display: inline-block;
  min-width: 82px;
  padding: 6px 8px;
  font-size: 8px;
  font-weight: 900;
  color: #755d18;
  border-radius: 999px;
  background: #fff0bb;
}

.qualified-badge {
  color: #466221;
  background: var(--lime-soft);
}

.empty-section {
  display: grid;
  min-height: 230px;
  text-align: center;
  place-content: center;
}

.empty-section > span {
  margin-bottom: 12px;
  font-size: 31px;
}

.empty-section strong {
  margin-bottom: 7px;
}

.empty-section p {
  max-width: 380px;
  margin: 0;
  font-size: 11px;
  line-height: 1.5;
  color: var(--gray);
}

.qualifiers-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 17px;
}

.qualifier-card {
  padding: 19px;
  border: 1px solid #dfe4dc;
  border-radius: 16px;
  background: #fafbf9;
}

.qualifier-card-header {
  display: flex;
  gap: 12px;
  align-items: center;
  padding-bottom: 15px;
  margin-bottom: 14px;
  border-bottom: 1px solid #e2e6df;
}

.qualifier-card-header > span {
  display: grid;
  width: 37px;
  height: 37px;
  flex: 0 0 auto;
  font-size: 11px;
  font-weight: 900;
  place-items: center;
  border-radius: 10px;
  background: var(--lime);
}

.qualifier-card-header > div {
  display: grid;
  gap: 3px;
}

.qualifier-card-header strong {
  font-size: 12px;
}

.qualifier-card-header small {
  font-size: 9px;
  color: var(--gray);
}

.qualifier-list {
  display: grid;
  gap: 8px;
}

.qualifier-team {
  display: grid;
  grid-template-columns: 28px 1fr auto;
  gap: 8px;
  align-items: center;
  min-height: 38px;
  padding: 8px 9px;
  border-radius: 9px;
  background: var(--white);
}

.qualifier-team > span {
  display: grid;
  width: 25px;
  height: 25px;
  font-size: 9px;
  font-weight: 900;
  color: var(--lime-dark);
  place-items: center;
  border-radius: 7px;
  background: var(--lime-soft);
}

.qualifier-team strong {
  font-size: 10px;
  overflow-wrap: anywhere;
}

.qualifier-team small {
  font-size: 8px;
  color: var(--gray);
}

.empty-qualifier {
  margin: 0;
  font-size: 10px;
  color: var(--gray);
}

.state-card {
  display: grid;
  width: min(530px, 100%);
  min-height: 320px;
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
  max-width: 390px;
  margin: 0;
  font-size: 12px;
  line-height: 1.55;
  color: var(--gray);
}

.spinner {
  width: 43px;
  height: 43px;
  margin: auto;
  border: 4px solid #dfe3dc;
  border-top-color: var(--lime-dark);
  border-radius: 50%;
  animation: spin 700ms linear infinite;
}

.error-symbol {
  display: grid;
  width: 50px;
  height: 50px;
  margin: auto;
  font-size: 20px;
  font-weight: 900;
  color: var(--white);
  place-items: center;
  border-radius: 50%;
  background: #b93838;
}

.state-button {
  min-height: 43px;
  padding: 10px 18px;
  margin: 22px auto 0;
  font: inherit;
  font-size: 11px;
  font-weight: 900;
  color: var(--white);
  cursor: pointer;
  border: 1px solid var(--black);
  border-radius: 10px;
  background: var(--black);
}

.state-button:hover {
  color: var(--black);
  border-color: var(--lime);
  background: var(--lime);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1000px) {
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .qualifiers-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 850px) {
  .groups-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    display: grid;
    align-items: stretch;
  }

  .recalculate-button {
    width: 100%;
    min-width: 0;
  }
}

@media (max-width: 620px) {
  .main-content {
    width: min(100% - 28px, 1240px);
    padding: 38px 0 55px;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .section-block {
    padding: 20px;
  }

  .section-header {
    display: grid;
  }

  .qualification-status {
    align-items: flex-start;
  }
}
</style>