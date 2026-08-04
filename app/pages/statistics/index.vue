<template>
  <div class="page-layout">
    <AppHeader
    :loading="loadingAuth"
    @logout="logout"
    />

    <main class="statistics-page">
      <section class="hero-section">
        <span class="eyebrow">MUNDIAL 2026</span>

        <h1 class="page-title">Estadísticas del Torneo</h1>

        <p class="page-subtitle">
          Consulta el rendimiento general de las selecciones, los partidos y los
          goleadores registrados en el torneo.
        </p>
      </section>

      <section v-if="loading" class="state-card">
        <div class="spinner"></div>
        <p>Cargando estadísticas...</p>
      </section>

      <section v-else-if="error" class="state-card state-card--error">
        <div class="state-icon">⚠️</div>
        <h2>No pudimos cargar las estadísticas</h2>
        <p>{{ error }}</p>

        <button type="button" class="btn btn-dark" @click="fetchStatistics">
          Intentar de nuevo
        </button>
      </section>

      <section v-else-if="!hasStatisticsData" class="state-card">
        <div class="state-icon">⚽</div>
        <h2>Todavía no hay datos del torneo</h2>
        <p>
          Registra selecciones, jugadores y partidos para comenzar a mostrar las
          estadísticas.
        </p>

        <NuxtLink to="/matches/manage" class="btn btn-primary">
          Registrar partido
        </NuxtLink>
      </section>

      <template v-else>
        <section class="general-statistics-section">
          <div class="section-heading">
            <div>
              <span class="section-kicker">RESUMEN GENERAL</span>
              <h2>Rendimiento del torneo</h2>
            </div>
          </div>

          <div class="summary-grid">
            <article class="summary-card summary-card--featured">
              <div class="summary-icon">🏆</div>

              <div>
                <span class="summary-label">Máximo goleador</span>

                <strong class="summary-value summary-value--name">
                  {{ topScorer?.name ?? "Sin datos" }}
                </strong>

                <small class="summary-detail">
                  {{ topScorer?.goals ?? 0 }}
                  {{ topScorer?.goals === 1 ? "gol" : "goles" }}
                </small>
              </div>
            </article>

            <article class="summary-card">
              <div class="summary-icon">
                {{ highestScoringTeam?.flag ?? "🏳️" }}
              </div>

              <div>
                <span class="summary-label">Selección con más goles</span>

                <strong class="summary-value summary-value--name">
                  {{ highestScoringTeam?.name ?? "Sin datos" }}
                </strong>

                <small class="summary-detail">
                  {{ highestScoringTeam?.goalsFor ?? 0 }} goles anotados
                </small>
              </div>
            </article>

            <article class="summary-card">
              <div class="summary-icon">
                {{ leastConcededTeam?.flag ?? "🛡️" }}
              </div>

              <div>
                <span class="summary-label">Selección menos goleada</span>

                <strong class="summary-value summary-value--name">
                  {{ leastConcededTeam?.name ?? "Sin datos" }}
                </strong>

                <small class="summary-detail">
                  {{ leastConcededTeam?.goalsAgainst ?? 0 }} goles recibidos
                </small>
              </div>
            </article>

            <article class="summary-card">
              <div class="summary-icon">📅</div>

              <div>
                <span class="summary-label">Partidos disputados</span>

                <strong class="summary-value">
                  {{ matchesPlayed }}
                </strong>

                <small class="summary-detail">Partidos finalizados</small>
              </div>
            </article>

            <article class="summary-card">
              <div class="summary-icon">⚽</div>

              <div>
                <span class="summary-label">Promedio de goles</span>

                <strong class="summary-value">
                  {{ formatAverage(averageGoals) }}
                </strong>

                <small class="summary-detail">
                  {{ totalGoals }} goles en total
                </small>
              </div>
            </article>

            <article class="summary-card">
              <div class="summary-icon">📈</div>

              <div>
                <span class="summary-label">Porcentaje de victorias</span>

                <strong class="summary-value">
                  {{ formatPercentage(victoryPercentage) }}
                </strong>

                <small class="summary-detail">Partidos con un ganador</small>
              </div>
            </article>
          </div>
        </section>

        <section v-if="scorers.length > 0" class="podium-section">
          <div class="section-heading">
            <div>
              <span class="section-kicker">TOP 3</span>
              <h2>Podio de goleadores</h2>
            </div>

            <NuxtLink to="/players/manage" class="manage-link">
              Gestionar jugadores
              <span>→</span>
            </NuxtLink>
          </div>

          <div class="podium-grid">
            <article
              v-for="player in podium"
              :key="player.id"
              class="podium-card"
              :class="`podium-card--${player.rank}`"
            >
              <div
                class="position-medal"
                :class="`position-medal--${player.rank}`"
              >
                {{ getMedal(player.rank) }}
              </div>

              <div class="player-avatar">
                {{ getInitials(player.name) }}
              </div>

              <span class="podium-team">
                {{ player.teamFlag }}
                {{ player.teamName }}
              </span>

              <h3>{{ player.name }}</h3>

              <p>{{ player.position }} · {{ player.club }}</p>

              <div class="podium-goals">
                <strong>{{ player.goals }}</strong>
                <span>
                  {{ player.goals === 1 ? "GOL" : "GOLES" }}
                </span>
              </div>
            </article>
          </div>
        </section>

        <section v-if="scorers.length > 0" class="ranking-section">
          <div class="section-heading ranking-heading">
            <div>
              <span class="section-kicker">CLASIFICACIÓN</span>
              <h2>Tabla de goleadores</h2>
            </div>

            <span class="results-count">
              {{ filteredScorers.length }}
              {{ filteredScorers.length === 1 ? "resultado" : "resultados" }}
            </span>
          </div>

          <div class="filters-card">
            <div class="search-field">
              <span class="search-icon">⌕</span>

              <input
                v-model="searchQuery"
                type="search"
                placeholder="Buscar jugador, selección o club..."
                aria-label="Buscar goleador"
              />
            </div>

            <select
              v-model="selectedPosition"
              class="position-filter"
              aria-label="Filtrar por posición"
            >
              <option value="">Todas las posiciones</option>

              <option
                v-for="position in positionOptions"
                :key="position"
                :value="position"
              >
                {{ position }}
              </option>
            </select>
          </div>

          <div v-if="filteredScorers.length === 0" class="no-results">
            <div class="state-icon">🔎</div>
            <h3>No encontramos jugadores</h3>
            <p>Prueba con otro nombre o cambia el filtro de posición.</p>
          </div>

          <div v-else class="table-card">
            <div class="table-scroll">
              <table class="scorers-table">
                <thead>
                  <tr>
                    <th class="rank-column">POS.</th>
                    <th>JUGADOR</th>
                    <th>SELECCIÓN</th>
                    <th>POSICIÓN</th>
                    <th>CLUB</th>
                    <th class="goals-column">GOLES</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="player in filteredScorers" :key="player.id">
                    <td class="rank-column">
                      <span
                        class="rank-badge"
                        :class="{
                          'rank-badge--top': player.rank <= 3,
                        }"
                      >
                        {{ player.rank }}
                      </span>
                    </td>

                    <td>
                      <div class="table-player">
                        <div class="table-avatar">
                          {{ getInitials(player.name) }}
                        </div>

                        <div>
                          <strong>{{ player.name }}</strong>
                          <span>#{{ player.number }}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span class="team-cell">
                        <span>{{ player.teamFlag }}</span>
                        {{ player.teamName }}
                      </span>
                    </td>

                    <td>
                      <span class="position-badge">
                        {{ player.position }}
                      </span>
                    </td>

                    <td class="club-cell">
                      {{ player.club }}
                    </td>

                    <td class="goals-column">
                      <strong class="goals-value">
                        {{ player.goals }}
                      </strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </template>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
const { loadingAuth, logout } = useAuth();
import { computed, onMounted, ref } from "vue";
import {
  useStatistics,
  type ScorerStatistic,
} from "../../composables/useStatistics";

useHead({
  title: "Estadísticas | Mundial 2026",
});

const {
  scorers,
  loading,
  error,
  totalGoals,
  topScorer,
  highestScoringTeam,
  leastConcededTeam,
  matchesPlayed,
  averageGoals,
  victoryPercentage,
  hasStatisticsData,
  fetchStatistics,
} = useStatistics();

const searchQuery = ref("");
const selectedPosition = ref("");

const positionOptions = ["Portero", "Defensa", "Mediocampista", "Delantero"];

const podium = computed<ScorerStatistic[]>(() => {
  return scorers.value.slice(0, 3);
});

const filteredScorers = computed<ScorerStatistic[]>(() => {
  const normalizedSearch = searchQuery.value.trim().toLocaleLowerCase("es");

  return scorers.value.filter((player: ScorerStatistic) => {
    const matchesPosition =
      !selectedPosition.value || player.position === selectedPosition.value;

    const searchableText = [player.name, player.teamName, player.club]
      .join(" ")
      .toLocaleLowerCase("es");

    const matchesSearch =
      !normalizedSearch || searchableText.includes(normalizedSearch);

    return matchesPosition && matchesSearch;
  });
});

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

function getMedal(rank: number): string {
  const medals: Record<number, string> = {
    1: "🥇",
    2: "🥈",
    3: "🥉",
  };

  return medals[rank] ?? String(rank);
}

function formatAverage(value: number): string {
  return value.toFixed(2);
}

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

onMounted(async () => {
  await fetchStatistics();
});
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
  display: flex;
  min-height: 100dvh;
  flex-direction: column;
  font-family: Inter, Arial, Helvetica, sans-serif;
  color: var(--text);
  background:
    radial-gradient(circle at 8% 3%, rgba(157, 202, 83, 0.18), transparent 25%),
    var(--background);
}

.statistics-page {
  box-sizing: border-box;
  width: 100%;
  max-width: 1240px;
  flex: 1;
  padding: 62px 24px 76px;
  margin: 0 auto;
}

.hero-section {
  max-width: 760px;
  margin: 0 auto 44px;
  text-align: center;
}

.eyebrow,
.section-kicker {
  display: inline-block;
  font-size: 11px;
  font-weight: 900;
  color: var(--lime-dark);
  letter-spacing: 2px;
}

.page-title {
  margin: 10px 0 12px;
  font-size: clamp(38px, 5vw, 58px);
  line-height: 1.02;
  letter-spacing: -2.5px;
}

.page-subtitle {
  max-width: 590px;
  margin: 0 auto;
  font-size: 15px;
  line-height: 1.7;
  color: var(--gray);
}

.btn {
  display: inline-flex;
  min-height: 44px;
  padding: 10px 20px;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  border: 0;
  border-radius: 11px;
  text-decoration: none;
}

.btn-primary {
  color: var(--black);
  background: var(--lime);
}

.btn-dark {
  color: var(--white);
  background: var(--black);
}

.state-card {
  display: flex;
  min-height: 310px;
  padding: 40px 24px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  color: var(--gray);
  border: 1px solid var(--border);
  border-radius: 20px;
  background: var(--white);
  box-shadow: 0 12px 34px rgba(20, 25, 20, 0.06);
}

.state-card h2 {
  margin: 10px 0 6px;
  color: var(--text);
}

.state-card p {
  max-width: 470px;
  margin: 0 0 20px;
  line-height: 1.6;
}

.state-card--error {
  color: #a33535;
}

.state-icon {
  font-size: 43px;
}

.spinner {
  width: 43px;
  height: 43px;
  margin-bottom: 15px;
  border: 4px solid #dfe3dc;
  border-top-color: var(--lime-dark);
  border-radius: 50%;
  animation: spin 700ms linear infinite;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 62px;
}

.summary-card {
  display: flex;
  min-width: 0;
  padding: 22px;
  align-items: center;
  gap: 14px;
  border: 1px solid var(--border);
  border-radius: 17px;
  background: var(--white);
  box-shadow: 0 10px 28px rgba(20, 25, 20, 0.05);
}

.summary-card--featured {
  color: var(--white);
  border-color: var(--black);
  background: var(--black);
}

.summary-icon {
  display: grid;
  width: 47px;
  height: 47px;
  flex-shrink: 0;
  place-items: center;
  font-size: 22px;
  border-radius: 13px;
  background: var(--lime-soft);
}

.summary-card--featured .summary-icon {
  background: rgba(157, 202, 83, 0.17);
}

.summary-label,
.summary-value,
.summary-detail {
  display: block;
}

.summary-label {
  margin-bottom: 4px;
  font-size: 10px;
  font-weight: 800;
  color: var(--gray);
  letter-spacing: 0.4px;
}

.summary-card--featured .summary-label,
.summary-card--featured .summary-detail {
  color: #b9c0b9;
}

.summary-value {
  font-size: 28px;
  line-height: 1;
}

.summary-value--name {
  overflow: hidden;
  max-width: 210px;
  font-size: 16px;
  line-height: 1.25;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.summary-detail {
  margin-top: 3px;
  font-size: 10px;
}

.podium-section {
  margin-bottom: 68px;
}

.section-heading {
  display: flex;
  margin-bottom: 24px;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
}

.section-heading h2 {
  margin: 6px 0 0;
  font-size: 29px;
  letter-spacing: -0.8px;
}

.manage-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 800;
  color: var(--black);
  text-decoration: none;
}

.manage-link:hover {
  color: var(--lime-dark);
}

.podium-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 17px;
}

.podium-card {
  position: relative;
  overflow: hidden;
  padding: 31px 23px 25px;
  text-align: center;
  border: 1px solid var(--border);
  border-radius: 19px;
  background: var(--white);
  box-shadow: 0 12px 32px rgba(20, 25, 20, 0.06);
}

.podium-card--1 {
  border-color: #c9dcaa;
  box-shadow: 0 15px 38px rgba(114, 156, 52, 0.14);
}

.podium-card--1::before {
  position: absolute;
  height: 5px;
  content: "";
  inset: 0 0 auto;
  background: var(--lime);
}

.position-medal {
  position: absolute;
  top: 15px;
  right: 16px;
  font-size: 25px;
}

.player-avatar,
.table-avatar {
  display: grid;
  place-items: center;
  font-weight: 900;
  color: var(--black);
  background: var(--lime-soft);
}

.player-avatar {
  width: 72px;
  height: 72px;
  margin: 0 auto 14px;
  font-size: 21px;
  border: 2px solid #d7e8bd;
  border-radius: 50%;
}

.podium-card--1 .player-avatar {
  color: var(--white);
  border-color: var(--lime);
  background: var(--black);
}

.podium-team {
  display: block;
  margin-bottom: 7px;
  font-size: 10px;
  font-weight: 800;
  color: var(--lime-dark);
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.podium-card h3 {
  margin: 0 0 6px;
  font-size: 20px;
}

.podium-card p {
  min-height: 18px;
  margin: 0 0 19px;
  font-size: 11px;
  color: var(--gray);
}

.podium-goals {
  display: inline-flex;
  padding: 8px 14px;
  align-items: baseline;
  gap: 5px;
  color: var(--black);
  border-radius: 999px;
  background: var(--lime-soft);
}

.podium-goals strong {
  font-size: 24px;
}

.podium-goals span {
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.7px;
}

.ranking-heading {
  margin-bottom: 18px;
}

.results-count {
  padding: 6px 11px;
  font-size: 10px;
  font-weight: 800;
  color: var(--lime-dark);
  border-radius: 999px;
  background: var(--lime-soft);
}

.filters-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 230px;
  gap: 12px;
  padding: 15px;
  margin-bottom: 15px;
  border: 1px solid var(--border);
  border-radius: 15px;
  background: var(--white);
}

.search-field {
  position: relative;
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 15px;
  font-size: 21px;
  color: var(--gray);
  transform: translateY(-50%);
}

.search-field input,
.position-filter {
  box-sizing: border-box;
  width: 100%;
  min-height: 46px;
  font-size: 13px;
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 10px;
  outline: none;
  background: #f8f9f7;
}

.search-field input {
  padding: 11px 14px 11px 44px;
}

.position-filter {
  padding: 11px 13px;
}

.search-field input:focus,
.position-filter:focus {
  border-color: var(--lime);
  box-shadow: 0 0 0 3px rgba(157, 202, 83, 0.14);
}

.table-card {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 17px;
  background: var(--white);
  box-shadow: 0 12px 32px rgba(20, 25, 20, 0.05);
}

.table-scroll {
  overflow-x: auto;
}

.scorers-table {
  width: 100%;
  min-width: 850px;
  border-collapse: collapse;
}

.scorers-table th,
.scorers-table td {
  padding: 16px 18px;
  text-align: left;
  border-bottom: 1px solid #e7eae5;
}

.scorers-table th {
  font-size: 9px;
  font-weight: 900;
  color: var(--gray);
  letter-spacing: 1px;
  background: #f6f8f4;
}

.scorers-table td {
  font-size: 12px;
}

.scorers-table tbody tr:last-child td {
  border-bottom: 0;
}

.scorers-table tbody tr:hover {
  background: #fbfcfa;
}

.rank-column {
  width: 60px;
  text-align: center !important;
}

.rank-badge {
  display: inline-grid;
  width: 31px;
  height: 31px;
  place-items: center;
  font-weight: 900;
  border-radius: 9px;
  background: #f0f2ef;
}

.rank-badge--top {
  color: #4c6b21;
  background: var(--lime-soft);
}

.table-player {
  display: flex;
  min-width: 190px;
  align-items: center;
  gap: 11px;
}

.table-avatar {
  width: 39px;
  height: 39px;
  flex-shrink: 0;
  font-size: 11px;
  border-radius: 11px;
}

.table-player strong,
.table-player span {
  display: block;
}

.table-player strong {
  margin-bottom: 3px;
  font-size: 13px;
}

.table-player span {
  font-size: 9px;
  color: var(--gray);
}

.team-cell {
  display: inline-flex;
  min-width: 135px;
  align-items: center;
  gap: 7px;
  font-weight: 700;
}

.team-cell > span {
  font-size: 18px;
}

.position-badge {
  display: inline-block;
  padding: 5px 9px;
  font-size: 9px;
  font-weight: 800;
  color: #526052;
  border: 1px solid #dfe5dc;
  border-radius: 7px;
  background: #f1f4ef;
}

.club-cell {
  color: var(--gray);
}

.goals-column {
  width: 85px;
  text-align: center !important;
}

.goals-value {
  display: inline-grid;
  min-width: 39px;
  height: 35px;
  padding: 0 6px;
  place-items: center;
  font-size: 17px;
  color: var(--black);
  border-radius: 10px;
  background: var(--lime);
}

.no-results {
  padding: 55px 24px;
  text-align: center;
  color: var(--gray);
  border: 1px solid var(--border);
  border-radius: 17px;
  background: var(--white);
}

.no-results h3 {
  margin: 10px 0 5px;
  color: var(--text);
}

.no-results p {
  margin: 0;
  font-size: 12px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1000px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .statistics-page {
    padding: 42px 14px 58px;
  }

  .page-title {
    font-size: 38px;
    letter-spacing: -1.5px;
  }

  .summary-grid,
  .podium-grid,
  .filters-card {
    grid-template-columns: 1fr;
  }

  .summary-grid {
    margin-bottom: 48px;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .ranking-heading {
    flex-direction: row;
    align-items: flex-end;
  }
}

@media (max-width: 430px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .ranking-heading {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
