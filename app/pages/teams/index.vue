<template>
  <div class="teams-page">
    <div class="header-section">
      <h1 class="title text-gradient">Selecciones Participantes</h1>
      <p class="subtitle">Descubre los 48 equipos que buscarán la gloria en el Mundial 2026</p>
      <NuxtLink to="/teams/manage" class="btn btn-primary manage-link">
        ➕ Gestionar Equipos
      </NuxtLink>
    </div>

    <!-- Filtros -->
    <div class="filters glass">
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="Buscar selección..." 
        class="search-input"
      />
      <div class="group-filter">
        <select v-model="selectedGroup" class="select-input">
          <option value="">Todos los Grupos</option>
          <option v-for="group in groups" :key="group" :value="group">
            Grupo {{ group }}
          </option>
        </select>
      </div>
    </div>

    <!-- Loader -->
    <div v-if="loading" class="loader-container">
      <div class="spinner"></div>
      <p>Cargando equipos...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-container glass">
      <p>⚠️ Ocurrió un error al cargar: {{ error }}</p>
    </div>

    <!-- Grid de Equipos -->
    <div v-else class="teams-grid">
      <NuxtLink 
        v-for="team in filteredTeams" 
        :key="team.id" 
        :to="`/teams/${team.id}`"
        class="team-card glass glass-card"
      >
        <div class="team-header">
          <div class="flag-container">
            <span v-if="team.flag && team.flag.trim() !== ''" class="flag">{{ team.flag }}</span>
            <span v-else class="flag-placeholder">🏳️</span>
          </div>
          <div class="team-group">Grupo {{ team.group }}</div>
        </div>
        <div class="team-info">
          <h2 class="team-name">{{ team.name }}</h2>
          <div class="team-badges">
            <span class="badge">{{ team.confederation }}</span>
            <span v-if="team.fifaRanking" class="badge rank">FIFA #{{ team.fifaRanking }}</span>
          </div>
        </div>
      </NuxtLink>
    </div>

    <div v-if="!loading && filteredTeams.length === 0" class="empty-state glass">
      <p>No se encontraron selecciones con esos filtros.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const { teams, loading, error, fetchTeams } = useTeams()

const searchQuery = ref('')
const selectedGroup = ref('')

onMounted(() => {
  fetchTeams()
})

const groups = computed(() => {
  const uniqueGroups = new Set(teams.value.map(t => t.group).filter(Boolean))
  return Array.from(uniqueGroups).sort()
})

const filteredTeams = computed(() => {
  return teams.value.filter(team => {
    const matchesSearch = team.name?.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesGroup = selectedGroup.value === '' || team.group === selectedGroup.value
    return matchesSearch && matchesGroup
  })
})
</script>

<style scoped>
.teams-page {
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
  padding: 64px max(24px, calc((100% - 1180px) / 2));
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

.header-section {
  max-width: 750px;
  margin: 0 auto 40px;
  text-align: center;
}

.title {
  margin: 0 0 12px;
  font-size: clamp(36px, 5vw, 54px);
  line-height: 1.08;
  letter-spacing: -2px;
}

.text-gradient {
  color: var(--black);
  background: none;
  -webkit-text-fill-color: initial;
}

.subtitle {
  margin: 0 0 22px;
  font-size: 15px;
  line-height: 1.65;
  color: var(--gray);
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
  border: 0;
  border-radius: 12px;
  transition:
    transform 180ms ease,
    background 180ms ease,
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

.manage-link {
  gap: 8px;
}

.glass {
  border: 1px solid var(--border);
  border-radius: 18px;
  background: var(--white);
  box-shadow: 0 12px 34px rgba(20, 25, 20, 0.07);
}

.filters {
  display: flex;
  gap: 16px;
  padding: 20px;
  margin-bottom: 32px;
  align-items: center;
  flex-wrap: wrap;
}

.group-filter {
  flex: 0 1 300px;
}

.search-input,
.select-input {
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

.search-input {
  flex: 1;
  min-width: 240px;
}

.select-input {
  width: 100%;
  min-width: 220px;
}

.search-input::placeholder {
  color: #9ca39c;
}

.search-input:focus,
.select-input:focus {
  border-color: var(--lime);
  box-shadow: 0 0 0 4px rgba(157, 202, 83, 0.16);
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 22px;
}

.team-card {
  display: flex;
  min-height: 230px;
  padding: 24px;
  flex-direction: column;
  overflow: hidden;
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.team-card:hover {
  border-color: var(--lime);
  transform: translateY(-5px);
  box-shadow: 0 18px 42px rgba(20, 25, 20, 0.12);
}

.team-header {
  display: flex;
  margin-bottom: 24px;
  align-items: flex-start;
  justify-content: space-between;
}

.flag-container {
  display: grid;
  width: 66px;
  height: 66px;
  place-items: center;
  font-size: 30px;
  border: 1px solid #e4e8e1;
  border-radius: 18px;
  background: #f6f7f5;
}

.team-group {
  padding: 6px 11px;
  font-size: 10px;
  font-weight: 900;
  color: #547626;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: 999px;
  background: var(--lime-soft);
}

.team-info {
  flex: 1;
}

.team-name {
  margin: 0 0 14px;
  font-size: 23px;
  text-align: left;
}

.team-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  padding: 5px 9px;
  font-size: 10px;
  font-weight: 800;
  color: #626a62;
  border: 1px solid #e2e6df;
  border-radius: 7px;
  background: #f5f6f4;
}

.badge.rank {
  color: var(--lime-dark);
  border-color: #d7e8bd;
  background: var(--lime-soft);
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

.empty-state,
.error-container {
  padding: 48px 24px;
  margin-top: 24px;
  text-align: center;
  color: var(--gray);
}

.error-container {
  color: var(--danger);
  border-color: rgba(185, 56, 56, 0.25);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 600px) {
  .teams-page {
    padding: 40px 14px;
  }

  .title {
    font-size: 35px;
  }

  .filters {
    display: grid;
    padding: 18px;
  }

  .search-input,
  .select-input,
  .group-filter {
    width: 100%;
    min-width: 0;
  }

  .teams-grid {
    grid-template-columns: 1fr;
  }

  .manage-link {
    width: 100%;
  }
}
</style>