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
.header-section {
  text-align: center;
  margin-bottom: 40px;
}

.title {
  font-size: 3rem;
  margin-bottom: 8px;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1.2rem;
  margin-bottom: 16px;
}

.manage-link {
  gap: 8px;
}

.filters {
  display: flex;
  gap: 16px;
  padding: 16px;
  margin-bottom: 32px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input, .select-input {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
  padding: 12px 16px;
  border-radius: 8px;
  outline: none;
  font-family: inherit;
  font-size: 1rem;
  transition: border-color 0.3s;
  flex: 1;
  min-width: 200px;
}

.search-input:focus, .select-input:focus {
  border-color: var(--accent);
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.team-card {
  display: flex;
  flex-direction: column;
  padding: 24px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.team-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.flag-container {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.team-group {
  background: var(--accent-glow);
  color: var(--accent);
  padding: 4px 12px;
  border-radius: 99px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.team-name {
  font-size: 1.5rem;
  margin-bottom: 12px;
  text-align: left;
}

.team-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.badge.rank {
  background: rgba(34, 197, 94, 0.2);
  color: var(--success);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 0;
  color: var(--text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-left-color: var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state, .error-container {
  text-align: center;
  padding: 48px;
  color: var(--text-secondary);
}
</style>
