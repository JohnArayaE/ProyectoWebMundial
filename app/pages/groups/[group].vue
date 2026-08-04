<template>
  <div class="page-wrapper">
    <AppHeader
      :loading="loadingAuth || recalculating"
      @logout="logout"
    />

    <main class="group-page">
      <section class="main-content">
        <div class="top-navigation">
          <NuxtLink
            to="/matches"
            class="back-link"
          >
            ← Volver a partidos
          </NuxtLink>

          <span class="current-route">
            Fase de grupos / Grupo {{ group }}
          </span>
        </div>

        <header class="page-header">
          <div class="header-information">
            <span class="page-label">
              Mundial 2026
            </span>

            <h1>
              Grupo {{ group }}
            </h1>

            <p>
              Consulta la tabla de posiciones, los resultados
              y los próximos encuentros del grupo.
            </p>
          </div>

          <button
            type="button"
            class="recalculate-button"
            :disabled="
              recalculating ||
              standingsLoading ||
              !isValidGroup
            "
            @click="recalculateTable"
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
                    : "Recalcular tabla"
                }}
              </strong>

              <small>
                Actualizar con los resultados
              </small>
            </span>
          </button>
        </header>

        <!-- Navegación de grupos -->
        <nav
          class="groups-navigation"
          aria-label="Navegación entre grupos"
        >
          <NuxtLink
            v-for="availableGroup in availableGroups"
            :key="availableGroup"
            :to="`/groups/${availableGroup}`"
            class="group-link"
            :class="{
              'group-link-active':
                availableGroup === group
            }"
          >
            {{ availableGroup }}
          </NuxtLink>
        </nav>

        <!-- Grupo inválido -->
        <section
          v-if="!isValidGroup"
          class="state-card"
        >
          <span class="error-symbol">
            !
          </span>

          <h2>Grupo no válido</h2>

          <p>
            El grupo solicitado no existe. Debes seleccionar
            un grupo entre A y L.
          </p>

          <NuxtLink
            to="/groups/A"
            class="state-link"
          >
            Ir al grupo A
          </NuxtLink>
        </section>

        <!-- Cargando -->
        <section
          v-else-if="initialLoading"
          class="state-card"
        >
          <span class="spinner" />

          <h2>Cargando grupo {{ group }}</h2>

          <p>
            Estamos consultando los equipos, partidos y
            posiciones registradas.
          </p>
        </section>

        <!-- Error -->
        <section
          v-else-if="pageError || standingsError"
          class="state-card"
        >
          <span class="error-symbol">
            !
          </span>

          <h2>No se pudo cargar el grupo</h2>

          <p>
            {{ pageError || standingsError }}
          </p>

          <button
            type="button"
            class="state-button"
            @click="loadGroupData"
          >
            Volver a intentar
          </button>
        </section>

        <template v-else>
          <!-- Resumen -->
          <section class="summary-grid">
            <article class="summary-card">
              <span class="summary-label">
                Selecciones
              </span>

              <strong>
                {{ groupStandings.length }}
              </strong>

              <small>
                Equipos registrados
              </small>
            </article>

            <article class="summary-card">
              <span class="summary-label">
                Partidos
              </span>

              <strong>
                {{ matches.length }}
              </strong>

              <small>
                Encuentros del grupo
              </small>
            </article>

            <article class="summary-card">
              <span class="summary-label">
                Finalizados
              </span>

              <strong>
                {{ finishedMatchesCount }}
              </strong>

              <small>
                Resultados contabilizados
              </small>
            </article>

            <article class="summary-card featured-summary">
              <span class="summary-label">
                Líder actual
              </span>

              <strong class="leader-name">
                {{
                  groupStandings[0]?.teamName ||
                  "Sin definir"
                }}
              </strong>

              <small>
                {{
                  groupStandings[0]
                    ? `${groupStandings[0].points} puntos`
                    : "Todavía no hay posiciones"
                }}
              </small>
            </article>
          </section>

          <!-- Tabla de posiciones -->
          <section class="standings-card">
            <div class="section-header">
              <div>
                <span class="section-label">
                  Clasificación
                </span>

                <h2>Tabla de posiciones</h2>

                <p>
                  La tabla utiliza únicamente partidos de fase
                  de grupos con estado finalizado.
                </p>
              </div>

              <span class="updated-badge">
                Grupo {{ group }}
              </span>
            </div>

            <div
              v-if="groupStandings.length === 0"
              class="empty-table"
            >
              <span>📊</span>

              <h3>No existe una tabla calculada</h3>

              <p>
                Verifica que haya equipos registrados en el
                grupo y vuelve a calcular las posiciones.
              </p>

              <button
                type="button"
                class="state-button"
                :disabled="recalculating"
                @click="recalculateTable"
              >
                Calcular posiciones
              </button>
            </div>

            <div
              v-else
              class="table-container"
            >
              <table class="standings-table">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      class="position-column"
                    >
                      Pos.
                    </th>

                    <th
                      scope="col"
                      class="team-column"
                    >
                      Selección
                    </th>

                    <th
                      scope="col"
                      title="Partidos jugados"
                    >
                      PJ
                    </th>

                    <th
                      scope="col"
                      title="Partidos ganados"
                    >
                      G
                    </th>

                    <th
                      scope="col"
                      title="Partidos empatados"
                    >
                      E
                    </th>

                    <th
                      scope="col"
                      title="Partidos perdidos"
                    >
                      P
                    </th>

                    <th
                      scope="col"
                      title="Goles a favor"
                    >
                      GF
                    </th>

                    <th
                      scope="col"
                      title="Goles en contra"
                    >
                      GC
                    </th>

                    <th
                      scope="col"
                      title="Diferencia de goles"
                    >
                      DG
                    </th>

                    <th
                      scope="col"
                      class="points-column"
                      title="Puntos"
                    >
                      Pts.
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="(
                      standing,
                      index
                    ) in groupStandings"
                    :key="standing.id"
                  >
                    <td class="position-cell">
                      <span
                        class="position-number"
                        :class="
                          getPositionClass(index)
                        "
                      >
                        {{ index + 1 }}
                      </span>
                    </td>

                    <td class="team-cell">
                      <div class="team-information">
                        <div class="team-flag">
                          <img
                            v-if="
                              isFlagImage(
                                standing.flag
                              )
                            "
                            :src="standing.flag"
                            :alt="`Bandera de ${standing.teamName}`"
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
                            {{ standing.teamName }}
                          </strong>

                          <small>
                            {{
                              getQualificationText(
                                index
                              )
                            }}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>{{ standing.played }}</td>
                    <td>{{ standing.wins }}</td>
                    <td>{{ standing.draws }}</td>
                    <td>{{ standing.losses }}</td>
                    <td>{{ standing.goalsFor }}</td>
                    <td>{{ standing.goalsAgainst }}</td>

                    <td>
                      {{
                        formatGoalDifference(
                          standing.goalDifference
                        )
                      }}
                    </td>

                    <td class="points-cell">
                      {{ standing.points }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div
              v-if="groupStandings.length > 0"
              class="table-legend"
            >
              <div>
                <span class="legend-color direct-color" />

                <small>
                  Clasificación directa
                </small>
              </div>

              <div>
                <span class="legend-color third-color" />

                <small>
                  Posible mejor tercero
                </small>
              </div>
            </div>
          </section>

          <!-- Partidos del grupo -->
          <section class="matches-section">
            <div class="section-header matches-header">
              <div>
                <span class="section-label">
                  Calendario
                </span>

                <h2>Partidos del grupo</h2>

                <p>
                  Encuentros programados y resultados
                  registrados para el grupo {{ group }}.
                </p>
              </div>

              <NuxtLink
                to="/matches/manage"
                class="manage-link"
              >
                Gestionar partidos
                <span aria-hidden="true">→</span>
              </NuxtLink>
            </div>

            <div
              v-if="matchesLoading && matches.length === 0"
              class="matches-state"
            >
              <span class="spinner small-spinner" />

              <p>Cargando partidos...</p>
            </div>

            <div
              v-else-if="matchesError"
              class="matches-state"
            >
              <strong>
                No se pudieron cargar los partidos
              </strong>

              <p>{{ matchesError }}</p>
            </div>

            <div
              v-else-if="matches.length === 0"
              class="matches-state"
            >
              <span class="empty-icon">
                ⚽
              </span>

              <strong>
                No hay partidos registrados
              </strong>

              <p>
                Todavía no existen encuentros para el
                grupo {{ group }}.
              </p>

              <NuxtLink
                to="/matches/manage"
                class="state-link"
              >
                Crear partido
              </NuxtLink>
            </div>

            <div
              v-else
              class="matches-grid"
            >
              <article
                v-for="match in matches"
                :key="match.id"
                class="match-card"
              >
                <div class="match-header">
                  <div>
                    <span class="match-stage">
                      {{ match.stage }}
                    </span>

                    <small>
                      Grupo {{ match.group }}
                    </small>
                  </div>

                  <span
                    class="status-badge"
                    :class="
                      getStatusClass(
                        match.status
                      )
                    "
                  >
                    {{ match.status }}
                  </span>
                </div>

                <div class="match-teams">
                  <div class="match-team">
                    <small>Local</small>

                    <strong>
                      {{ match.homeTeam }}
                    </strong>
                  </div>

                  <div class="match-score">
                    <template
                      v-if="
                        match.status ===
                        'Programado'
                      "
                    >
                      VS
                    </template>

                    <template v-else>
                      {{ match.homeScore }}

                      <span>-</span>

                      {{ match.awayScore }}
                    </template>
                  </div>

                  <div class="match-team away-team">
                    <small>Visitante</small>

                    <strong>
                      {{ match.awayTeam }}
                    </strong>
                  </div>
                </div>

                <div class="match-details">
                  <div>
                    <span>Fecha</span>

                    <strong>
                      {{
                        formatDate(
                          match.kickoff
                        )
                      }}
                    </strong>
                  </div>

                  <div>
                    <span>Hora</span>

                    <strong>
                      {{
                        formatTime(
                          match.kickoff
                        )
                      }}
                    </strong>
                  </div>

                  <div>
                    <span>Sede</span>

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

                <NuxtLink
                  :to="`/matches/${match.id}`"
                  class="details-link"
                >
                  Ver detalles del partido
                </NuxtLink>
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
import { useAuth } from "../../composables/useAuth"
import { useMatches } from "../../composables/useMatches"
import { useStandings } from "../../composables/useStandings"

const route = useRoute()

const {
  currentUser,
  loadingAuth,
  initAuth,
  logout
} = useAuth()

const {
  matches,
  loading: matchesLoading,
  error: matchesError,
  fetchMatchesByGroup
} = useMatches()

const {
  standings,
  loading: standingsLoading,
  error: standingsError,
  fetchStandingsByGroup,
  recalculateGroupStandings
} = useStandings()

const availableGroups = [
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

const recalculating = ref(false)
const pageError = ref("")

const group = computed<string>(() => {
  const routeGroup = route.params.group

  const value = Array.isArray(routeGroup)
    ? routeGroup[0]
    : routeGroup

  return String(value || "")
    .trim()
    .toUpperCase()
})

const isValidGroup = computed<boolean>(() => {
  return availableGroups.includes(
    group.value
  )
})

const groupStandings = computed(() => {
  return standings.value
    .filter(standing => {
      return standing.group === group.value
    })
    .sort((firstStanding, secondStanding) => {
      if (
        secondStanding.points !==
        firstStanding.points
      ) {
        return (
          secondStanding.points -
          firstStanding.points
        )
      }

      if (
        secondStanding.goalDifference !==
        firstStanding.goalDifference
      ) {
        return (
          secondStanding.goalDifference -
          firstStanding.goalDifference
        )
      }

      if (
        secondStanding.goalsFor !==
        firstStanding.goalsFor
      ) {
        return (
          secondStanding.goalsFor -
          firstStanding.goalsFor
        )
      }

      if (
        secondStanding.wins !==
        firstStanding.wins
      ) {
        return (
          secondStanding.wins -
          firstStanding.wins
        )
      }

      return (
        firstStanding.fifaRanking -
        secondStanding.fifaRanking
      )
    })
})

const finishedMatchesCount = computed<number>(() => {
  return matches.value.filter(match => {
    return (
      match.stage === "Fase de grupos" &&
      match.status === "Finalizado"
    )
  }).length
})

const initialLoading = computed<boolean>(() => {
  return (
    (
      standingsLoading.value ||
      matchesLoading.value
    ) &&
    groupStandings.value.length === 0 &&
    matches.value.length === 0
  )
})

const loadGroupData = async (): Promise<void> => {
  pageError.value = ""

  if (!isValidGroup.value) {
    return
  }

  try {
    const [
      storedStandings
    ] = await Promise.all([
      fetchStandingsByGroup(
        group.value
      ),

      fetchMatchesByGroup(
        group.value
      )
    ])

    /*
     * Cuando todavía no existe la tabla en
     * Firestore, se calcula automáticamente.
     */
    if (storedStandings.length === 0) {
      await recalculateGroupStandings(
        group.value
      )
    }
  } catch (caughtError) {
    pageError.value =
      caughtError instanceof Error
        ? caughtError.message
        : "No se pudo cargar la información del grupo."

    console.error(
      "[groups/group] loadGroupData:",
      caughtError
    )
  }
}

const recalculateTable =
  async (): Promise<void> => {
    if (!isValidGroup.value) {
      return
    }

    pageError.value = ""

    try {
      recalculating.value = true

      await recalculateGroupStandings(
        group.value
      )

      await fetchMatchesByGroup(
        group.value
      )
    } catch (caughtError) {
      pageError.value =
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudo recalcular la tabla."

      console.error(
        "[groups/group] recalculateTable:",
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

const getQualificationText = (
  index: number
): string => {
  if (index === 0) {
    return "1.º del grupo"
  }

  if (index === 1) {
    return "2.º del grupo"
  }

  if (index === 2) {
    return "Posible mejor tercero"
  }

  return "Posición del grupo"
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
      month: "short",
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

watch(
  () => group.value,
  async (
    newGroup,
    previousGroup
  ) => {
    if (
      newGroup &&
      newGroup !== previousGroup
    ) {
      await loadGroupData()
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

useHead(() => ({
  title: isValidGroup.value
    ? `Grupo ${group.value} | World Cup Tracker 2026`
    : "Grupo no válido | World Cup Tracker 2026",

  meta: [
    {
      name: "description",
      content:
        `Consulta la tabla de posiciones y los partidos del grupo ${group.value}.`
    }
  ]
}))

onMounted(async () => {
  initAuth()
  await loadGroupData()
})
</script>

<style scoped>
.page-wrapper {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  background: #eef1ec;
}

.group-page {
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
      transparent 27%
    ),
    var(--background);
}

.main-content {
  width: min(1220px, calc(100% - 48px));
  margin: 0 auto;
  padding: 44px 0 75px;
}

.top-navigation {
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 29px;
}

.back-link {
  font-size: 12px;
  font-weight: 900;
  color: var(--lime-dark);
  text-decoration: none;
}

.back-link:hover {
  color: var(--black);
}

.current-route {
  font-size: 10px;
  font-weight: 800;
  color: var(--gray);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.page-header {
  display: flex;
  gap: 35px;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 28px;
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
  font-size: clamp(42px, 6vw, 63px);
  line-height: 1;
  letter-spacing: -3px;
}

.page-header p {
  max-width: 650px;
  margin: 0;
  font-size: 15px;
  line-height: 1.65;
  color: var(--gray);
}

.recalculate-button {
  display: flex;
  gap: 13px;
  align-items: center;
  min-width: 260px;
  min-height: 68px;
  padding: 13px 16px;
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
  width: 40px;
  height: 40px;
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

.groups-navigation {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 8px;
  padding: 10px;
  margin-bottom: 30px;
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--white);
  box-shadow: 0 10px 30px rgba(20, 25, 20, 0.05);
}

.group-link {
  display: grid;
  min-width: 49px;
  min-height: 44px;
  font-size: 12px;
  font-weight: 900;
  color: var(--gray);
  text-decoration: none;
  place-items: center;
  border-radius: 10px;
  transition:
    color 150ms ease,
    background 150ms ease;
}

.group-link:hover {
  color: var(--black);
  background: var(--lime-soft);
}

.group-link-active {
  color: var(--black);
  background: var(--lime);
}

.summary-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.summary-card {
  display: grid;
  min-height: 135px;
  padding: 21px;
  align-content: space-between;
  border: 1px solid var(--border);
  border-radius: 17px;
  background: var(--white);
  box-shadow: 0 10px 28px rgba(20, 25, 20, 0.05);
}

.summary-card strong {
  font-size: 31px;
  line-height: 1;
}

.summary-label {
  font-size: 9px;
  font-weight: 900;
  color: var(--lime-dark);
  text-transform: uppercase;
  letter-spacing: 1.2px;
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

.featured-summary .summary-label {
  color: var(--lime);
}

.featured-summary small {
  color: #c3c8c1;
}

.featured-summary .leader-name {
  font-size: 19px;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.standings-card,
.matches-section {
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
  font-size: 25px;
}

.section-header p {
  max-width: 620px;
  margin: 0;
  font-size: 12px;
  line-height: 1.55;
  color: var(--gray);
}

.updated-badge {
  flex: 0 0 auto;
  padding: 8px 12px;
  font-size: 10px;
  font-weight: 900;
  color: #4e6e24;
  border-radius: 999px;
  background: var(--lime-soft);
}

.table-container {
  overflow-x: auto;
}

.standings-table {
  width: 100%;
  min-width: 830px;
  border-collapse: collapse;
}

.standings-table th {
  padding: 12px 10px;
  font-size: 9px;
  font-weight: 900;
  color: var(--gray);
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  border-bottom: 1px solid var(--border);
}

.standings-table td {
  padding: 14px 10px;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  border-bottom: 1px solid #edf0eb;
}

.standings-table tbody tr {
  transition: background 150ms ease;
}

.standings-table tbody tr:hover {
  background: #f8faf6;
}

.standings-table tbody tr:last-child td {
  border-bottom: 0;
}

.position-column {
  width: 65px;
}

.team-column {
  text-align: left !important;
}

.points-column {
  width: 65px;
}

.position-number {
  display: grid;
  width: 29px;
  height: 29px;
  margin: auto;
  font-size: 11px;
  place-items: center;
  border-radius: 9px;
}

.direct-position {
  color: var(--black);
  background: var(--lime);
}

.third-position {
  color: #755f12;
  background: #fff0aa;
}

.regular-position {
  color: var(--gray);
  background: #edf0ea;
}

.team-cell {
  min-width: 210px;
  text-align: left !important;
}

.team-information {
  display: flex;
  gap: 12px;
  align-items: center;
}

.team-flag {
  display: grid;
  width: 41px;
  height: 31px;
  flex: 0 0 auto;
  font-size: 22px;
  place-items: center;
  overflow: hidden;
  border: 1px solid #e3e7df;
  border-radius: 7px;
  background: #f6f7f5;
}

.team-flag img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.team-information > div:last-child {
  display: grid;
  gap: 4px;
}

.team-information strong {
  font-size: 13px;
}

.team-information small {
  font-size: 9px;
  font-weight: 600;
  color: var(--gray);
}

.points-cell {
  font-size: 15px !important;
  font-weight: 900 !important;
  color: var(--black);
}

.table-legend {
  display: flex;
  gap: 22px;
  align-items: center;
  padding-top: 18px;
  margin-top: 5px;
  border-top: 1px solid #edf0eb;
}

.table-legend > div {
  display: flex;
  gap: 7px;
  align-items: center;
}

.table-legend small {
  font-size: 10px;
  color: var(--gray);
}

.legend-color {
  width: 10px;
  height: 10px;
  border-radius: 3px;
}

.direct-color {
  background: var(--lime);
}

.third-color {
  background: #f2d873;
}

.empty-table,
.matches-state {
  display: grid;
  min-height: 240px;
  text-align: center;
  place-content: center;
}

.empty-table > span {
  margin-bottom: 13px;
  font-size: 32px;
}

.empty-table h3 {
  margin: 0 0 8px;
}

.empty-table p,
.matches-state p {
  max-width: 370px;
  margin: 0;
  font-size: 12px;
  line-height: 1.55;
  color: var(--gray);
}

.matches-header {
  align-items: center;
}

.manage-link {
  display: flex;
  gap: 9px;
  align-items: center;
  min-height: 42px;
  padding: 10px 14px;
  font-size: 11px;
  font-weight: 900;
  color: var(--white);
  text-decoration: none;
  border-radius: 10px;
  background: var(--black);
}

.manage-link:hover {
  color: var(--black);
  background: var(--lime);
}

.matches-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 17px;
}

.match-card {
  padding: 21px;
  border: 1px solid #e0e5dd;
  border-radius: 17px;
  background: #fafbf9;
  transition:
    border-color 170ms ease,
    box-shadow 170ms ease,
    transform 170ms ease;
}

.match-card:hover {
  border-color: #cad2c5;
  box-shadow: 0 14px 32px rgba(20, 25, 20, 0.08);
  transform: translateY(-2px);
}

.match-header {
  display: flex;
  gap: 13px;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 15px;
  border-bottom: 1px solid #e5e9e2;
}

.match-header > div {
  display: grid;
  gap: 3px;
}

.match-stage {
  font-size: 10px;
  font-weight: 900;
  color: var(--lime-dark);
  text-transform: uppercase;
}

.match-header small {
  font-size: 9px;
  color: var(--gray);
}

.status-badge {
  padding: 6px 9px;
  font-size: 9px;
  font-weight: 900;
  border-radius: 999px;
}

.scheduled-status {
  color: #586052;
  background: #eaede8;
}

.live-status {
  color: #8b2929;
  background: #ffe2e2;
}

.finished-status {
  color: #486424;
  background: var(--lime-soft);
}

.match-teams {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 14px;
  align-items: center;
  padding: 24px 0;
}

.match-team {
  display: grid;
  gap: 6px;
}

.match-team small {
  font-size: 8px;
  font-weight: 900;
  color: var(--gray);
  text-transform: uppercase;
}

.match-team strong {
  font-size: 14px;
  overflow-wrap: anywhere;
}

.away-team {
  text-align: right;
}

.match-score {
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  min-width: 55px;
  font-size: 17px;
  font-weight: 900;
}

.match-score span {
  color: var(--gray);
}

.match-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 14px;
  margin-bottom: 15px;
  border-radius: 11px;
  background: var(--white);
}

.match-details div {
  display: grid;
  gap: 3px;
}

.match-details span {
  font-size: 8px;
  font-weight: 900;
  color: var(--lime-dark);
  text-transform: uppercase;
}

.match-details strong {
  font-size: 10px;
  overflow-wrap: anywhere;
}

.details-link {
  display: grid;
  min-height: 40px;
  font-size: 10px;
  font-weight: 900;
  color: var(--white);
  text-decoration: none;
  place-items: center;
  border-radius: 9px;
  background: var(--black);
}

.details-link:hover {
  color: var(--black);
  background: var(--lime);
}

.matches-state strong {
  margin-bottom: 7px;
}

.empty-icon {
  margin-bottom: 13px;
  font-size: 30px;
}

.state-card {
  display: grid;
  width: min(540px, 100%);
  min-height: 330px;
  padding: 45px;
  margin: 45px auto;
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
  max-width: 400px;
  margin: 0;
  font-size: 13px;
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

.small-spinner {
  width: 34px;
  height: 34px;
  margin-bottom: 13px;
}

.error-symbol {
  display: grid;
  width: 50px;
  height: 50px;
  margin: auto;
  font-size: 21px;
  font-weight: 900;
  color: var(--white);
  place-items: center;
  border-radius: 50%;
  background: #b93838;
}

.state-button,
.state-link {
  display: grid;
  min-height: 43px;
  padding: 10px 18px;
  margin: 22px auto 0;
  font: inherit;
  font-size: 11px;
  font-weight: 900;
  color: var(--white);
  text-decoration: none;
  cursor: pointer;
  place-items: center;
  border: 1px solid var(--black);
  border-radius: 10px;
  background: var(--black);
}

.state-button:hover:not(:disabled),
.state-link:hover {
  color: var(--black);
  border-color: var(--lime);
  background: var(--lime);
}

.state-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
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

  .matches-grid {
    grid-template-columns: 1fr;
  }

  .groups-navigation {
    grid-template-columns:
      repeat(12, minmax(49px, 1fr));
  }
}

@media (max-width: 760px) {
  .page-header {
    display: grid;
    align-items: stretch;
  }

  .recalculate-button {
    width: 100%;
    min-width: 0;
  }

  .section-header {
    display: grid;
  }

  .matches-header {
    align-items: stretch;
  }

  .manage-link {
    width: fit-content;
  }
}

@media (max-width: 560px) {
  .main-content {
    width: min(100% - 28px, 1220px);
    padding: 35px 0 55px;
  }

  .top-navigation {
    align-items: flex-start;
    flex-direction: column;
  }

  .current-route {
    display: none;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .standings-card,
  .matches-section {
    padding: 20px;
  }

  .table-legend {
    align-items: flex-start;
    flex-direction: column;
  }

  .match-teams {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .away-team {
    text-align: center;
  }

  .match-details {
    grid-template-columns: 1fr;
  }

  .state-card {
    padding: 30px 20px;
  }
}
</style>