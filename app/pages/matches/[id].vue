<template>
  <div class="page-wrapper">
    <AppHeader
      :loading="loadingAuth || loading"
      @logout="logout"
    />

    <main class="details-page">
      <section class="main-content">
        <NuxtLink
          to="/matches"
          class="back-link"
        >
          ← Volver a partidos
        </NuxtLink>

        <!-- Cargando -->
        <section
          v-if="loading"
          class="state-card"
        >
          <span class="spinner" />

          <h1>Cargando partido</h1>

          <p>
            Estamos consultando la información del encuentro.
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

          <h1>No se pudo cargar el partido</h1>

          <p>
            {{ matchesError }}
          </p>

          <button
            type="button"
            class="retry-button"
            @click="loadMatch"
          >
            Volver a intentar
          </button>
        </section>

        <!-- Partido no encontrado -->
        <section
          v-else-if="!match"
          class="state-card"
        >
          <span class="empty-icon">
            ⚽
          </span>

          <h1>Partido no encontrado</h1>

          <p>
            No existe un partido con el identificador
            solicitado.
          </p>

          <NuxtLink
            to="/matches"
            class="return-button"
          >
            Ver todos los partidos
          </NuxtLink>
        </section>

        <!-- Detalles -->
        <template v-else>
          <header class="page-header">
            <div>
              <span class="page-label">
                Detalles del partido
              </span>

              <h1>
                {{ match.homeTeam }}
                <span>vs</span>
                {{ match.awayTeam }}
              </h1>

              <p>
                Consulta toda la información registrada para
                este encuentro.
              </p>
            </div>

            <span
              class="status-badge"
              :class="getStatusClass(match.status)"
            >
              {{ match.status }}
            </span>
          </header>

          <section class="score-card">
            <div class="team">
              <span>
                Selección local
              </span>

              <strong>
                {{ match.homeTeam }}
              </strong>
            </div>

            <div class="score">
              <template
                v-if="match.status === 'Programado'"
              >
                <strong>VS</strong>
              </template>

              <template v-else>
                <strong>
                  {{ match.homeScore }}
                </strong>

                <span>-</span>

                <strong>
                  {{ match.awayScore }}
                </strong>
              </template>
            </div>

            <div class="team away-team">
              <span>
                Selección visitante
              </span>

              <strong>
                {{ match.awayTeam }}
              </strong>
            </div>
          </section>

          <section class="details-grid">
            <article class="information-card">
              <div class="card-header">
                <div>
                  <span class="card-label">
                    Información deportiva
                  </span>

                  <h2>Datos del encuentro</h2>
                </div>

                <div class="card-icon">
                  ⚽
                </div>
              </div>

              <div class="information-list">
                <div class="information-row">
                  <span>
                    Fase
                  </span>

                  <strong>
                    {{ match.stage }}
                  </strong>
                </div>

                <div
                  v-if="match.group"
                  class="information-row"
                >
                  <span>
                    Grupo
                  </span>

                  <strong>
                    Grupo {{ match.group }}
                  </strong>
                </div>

                <div class="information-row">
                  <span>
                    Estado
                  </span>

                  <strong>
                    {{ match.status }}
                  </strong>
                </div>

                <div class="information-row">
                  <span>
                    Fecha
                  </span>

                  <strong>
                    {{ formatDate(match.kickoff) }}
                  </strong>
                </div>

                <div class="information-row">
                  <span>
                    Hora
                  </span>

                  <strong>
                    {{ formatTime(match.kickoff) }}
                  </strong>
                </div>
              </div>
            </article>

            <article class="information-card">
              <div class="card-header">
                <div>
                  <span class="card-label">
                    Ubicación
                  </span>

                  <h2>Sede del partido</h2>
                </div>

                <div class="card-icon">
                  📍
                </div>
              </div>

              <div class="information-list">
                <div class="information-row">
                  <span>
                    Estadio
                  </span>

                  <strong>
                    {{ match.stadium }}
                  </strong>
                </div>

                <div class="information-row">
                  <span>
                    Ciudad
                  </span>

                  <strong>
                    {{ match.city }}
                  </strong>
                </div>

                <div class="information-row">
                  <span>
                    ID del partido
                  </span>

                  <strong class="match-id">
                    {{ match.id }}
                  </strong>
                </div>
              </div>
            </article>
          </section>

          <div class="page-actions">
            <NuxtLink
              to="/matches"
              class="secondary-button"
            >
              Ver todos los partidos
            </NuxtLink>

            <NuxtLink
              to="/matches/manage"
              class="primary-button"
            >
              Gestionar partidos
            </NuxtLink>
          </div>
        </template>
      </section>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { useAuth } from "../../composables/useAuth"

import {
  useMatches,
  type Match,
  type MatchStatus
} from "../../composables/useMatches"

const route = useRoute()

const {
  currentUser,
  loadingAuth,
  initAuth,
  logout
} = useAuth()

const {
  loading,
  error: matchesError,
  fetchMatchById
} = useMatches()

const match = ref<Match | null>(null)

const matchId = computed<string>(() => {
  const id = route.params.id

  if (Array.isArray(id)) {
    return id[0] ?? ""
  }

  return typeof id === "string"
    ? id
    : ""
})

const loadMatch = async (): Promise<void> => {
  if (!matchId.value) {
    match.value = null
    return
  }

  match.value = await fetchMatchById(
    matchId.value
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
      weekday: "long",
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
  status: MatchStatus
): string => {
  if (status === "En Vivo") {
    return "live-status"
  }

  if (status === "Finalizado") {
    return "finished-status"
  }

  return "scheduled-status"
}

useHead({
  title: "Detalle del partido | World Cup Tracker 2026",
  meta: [
    {
      name: "description",
      content:
        "Información detallada de un partido del Mundial 2026."
    }
  ]
})

onMounted(async () => {
  initAuth()
  await loadMatch()
})

watch(
  matchId,
  async () => {
    await loadMatch()
  }
)

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

.details-page {
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
      circle at 10% 10%,
      rgba(157, 202, 83, 0.11),
      transparent 25%
    ),
    #eef1ec;
}

.main-content {
  width: min(1100px, calc(100% - 48px));
  margin: 0 auto;
  padding: 45px 0 70px;
}

.back-link {
  display: inline-flex;
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
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
}

.page-label,
.card-label {
  display: block;
  margin-bottom: 8px;
  font-size: 10px;
  font-weight: 900;
  color: var(--lime-dark);
  text-transform: uppercase;
  letter-spacing: 1.4px;
}

.page-header h1 {
  margin: 0 0 12px;
  font-size: clamp(34px, 5vw, 51px);
  letter-spacing: -2px;
}

.page-header h1 span {
  color: var(--lime-dark);
}

.page-header p {
  margin: 0;
  color: var(--gray);
}

.status-badge {
  flex: 0 0 auto;
  padding: 9px 13px;
  font-size: 11px;
  font-weight: 900;
  border-radius: 999px;
}

.scheduled-status {
  color: #596154;
  background: #e9ece6;
}

.live-status {
  color: #8b2929;
  background: #ffe3e3;
}

.finished-status {
  color: #496524;
  background: var(--lime-soft);
}

.score-card {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 30px;
  align-items: center;
  padding: 40px;
  margin-bottom: 24px;
  border: 1px solid var(--border);
  border-radius: 23px;
  background: var(--white);
  box-shadow: 0 14px 38px rgba(20, 25, 20, 0.07);
}

.team {
  display: grid;
  gap: 9px;
}

.away-team {
  text-align: right;
}

.team span {
  font-size: 10px;
  font-weight: 900;
  color: var(--lime-dark);
  text-transform: uppercase;
}

.team strong {
  font-size: 25px;
  overflow-wrap: anywhere;
}

.score {
  display: flex;
  gap: 13px;
  align-items: center;
  justify-content: center;
  min-width: 130px;
  min-height: 90px;
  padding: 16px;
  border-radius: 18px;
  background: var(--lime-soft);
}

.score strong {
  font-size: 35px;
}

.score span {
  font-size: 24px;
  color: var(--gray);
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.information-card {
  padding: 30px;
  border: 1px solid var(--border);
  border-radius: 21px;
  background: var(--white);
  box-shadow: 0 12px 35px rgba(20, 25, 20, 0.06);
}

.card-header {
  display: flex;
  gap: 18px;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 21px;
  margin-bottom: 14px;
  border-bottom: 1px solid var(--border);
}

.card-header h2 {
  margin: 0;
  font-size: 21px;
}

.card-icon {
  display: grid;
  width: 46px;
  height: 46px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 14px;
  background: var(--lime-soft);
}

.information-list {
  display: grid;
}

.information-row {
  display: grid;
  grid-template-columns: 125px 1fr;
  gap: 20px;
  padding: 16px 0;
  border-bottom: 1px solid #edf0eb;
}

.information-row:last-child {
  border-bottom: 0;
}

.information-row span {
  font-size: 11px;
  font-weight: 700;
  color: var(--gray);
}

.information-row strong {
  font-size: 12px;
  overflow-wrap: anywhere;
}

.match-id {
  font-family: Consolas, monospace;
  color: #626a62;
}

.page-actions {
  display: flex;
  gap: 13px;
  justify-content: flex-end;
  margin-top: 27px;
}

.secondary-button,
.primary-button,
.return-button {
  display: grid;
  min-height: 46px;
  padding: 11px 20px;
  font-size: 12px;
  font-weight: 800;
  text-decoration: none;
  place-items: center;
  border-radius: 11px;
}

.secondary-button {
  color: var(--text);
  border: 1px solid var(--border);
  background: var(--white);
}

.primary-button,
.return-button {
  color: var(--white);
  background: var(--black);
}

.primary-button:hover,
.return-button:hover {
  color: var(--black);
  background: var(--lime);
}

.state-card {
  display: grid;
  width: min(520px, 100%);
  min-height: 320px;
  padding: 42px;
  margin: 45px auto;
  text-align: center;
  place-content: center;
  border: 1px solid var(--border);
  border-radius: 22px;
  background: var(--white);
  box-shadow: 0 15px 40px rgba(20, 25, 20, 0.07);
}

.state-card h1 {
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

.return-button {
  margin: 22px auto 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 760px) {
  .page-header {
    align-items: flex-start;
  }

  .score-card {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .away-team {
    text-align: center;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 540px) {
  .main-content {
    width: min(100% - 28px, 1100px);
    padding: 35px 0 55px;
  }

  .score-card,
  .information-card {
    padding: 22px;
  }

  .information-row {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .page-actions {
    display: grid;
  }

  .secondary-button,
  .primary-button {
    width: 100%;
  }
}
</style>