<template>
  <div class="team-detail-page">
    <div v-if="loading" class="loader-container">
      <div class="spinner"></div>
      <p>Cargando información del equipo...</p>
    </div>

    <div v-else-if="error" class="error-container glass">
      <p>⚠️ {{ error }}</p>
      <NuxtLink to="/teams" class="btn btn-secondary mt-4">Volver</NuxtLink>
    </div>

    <div v-else-if="team" class="team-content animate-fade-in">
      <div class="hero glass">
        <div class="hero-content">
          <div class="flag-large">
            <span v-if="team.flag && team.flag.trim() !== ''">{{ team.flag }}</span>
            <span v-else>🏳️</span>
          </div>
          <div class="hero-info">
            <div class="badges">
              <span class="badge">Grupo {{ team.group }}</span>
              <span class="badge">{{ team.confederation }}</span>
              <span v-if="team.fifaRanking" class="badge rank">FIFA #{{ team.fifaRanking }}</span>
            </div>
            <h1 class="team-name-large text-gradient">{{ team.name }}</h1>
            <p v-if="team.coach" class="coach-name">DT: {{ team.coach }}</p>
          </div>
        </div>
      </div>

      <div class="roster-section">
        <h2 class="section-title">Plantilla de Jugadores</h2>
        
        <div v-if="team.roster && team.roster.length > 0" class="roster-grid">
          <div v-for="(player, index) in team.roster" :key="index" class="player-card glass glass-card">
            <div class="player-number">{{ player.number || '-' }}</div>
            <div class="player-info">
              <h3 class="player-name">{{ player.name }}</h3>
              <p class="player-position">{{ player.position || 'Jugador' }}</p>
            </div>
          </div>
        </div>
        
        <div v-else class="empty-roster glass">
          <p>Aún no hay jugadores registrados para esta selección.</p>
        </div>
      </div>
      
      <div class="back-action">
        <NuxtLink to="/teams" class="btn btn-secondary">
          <span>&larr;</span> Volver a Equipos
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const { getTeamById, loading, error } = useTeams()

const team = ref(null)

onMounted(async () => {
  const teamId = route.params.id
  if (teamId) {
    team.value = await getTeamById(teamId)
  }
})
</script>

<style scoped>
.team-detail-page {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.hero {
  padding: 48px;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9));
  border-bottom: 2px solid var(--accent);
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 40px;
}

@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    text-align: center;
  }
}

.flag-large {
  font-size: 6rem;
  width: 160px;
  height: 160px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  border: 4px solid rgba(255, 255, 255, 0.1);
}

.badges {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .badges {
    justify-content: center;
  }
}

.badge {
  background: rgba(255, 255, 255, 0.1);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.badge.rank {
  background: rgba(34, 197, 94, 0.2);
  color: var(--success);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.team-name-large {
  font-size: 4rem;
  line-height: 1.1;
  margin-bottom: 16px;
}

.coach-name {
  font-size: 1.2rem;
  color: var(--text-secondary);
}

.section-title {
  font-size: 2rem;
  margin-bottom: 24px;
}

.roster-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.player-card {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 16px;
}

.player-number {
  font-size: 2rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.1);
  min-width: 50px;
  text-align: center;
}

.player-info {
  flex: 1;
}

.player-name {
  font-size: 1.1rem;
  margin-bottom: 4px;
}

.player-position {
  font-size: 0.9rem;
  color: var(--accent);
}

.empty-roster {
  text-align: center;
  padding: 48px;
  color: var(--text-secondary);
  border-style: dashed;
}

.back-action {
  margin-top: 32px;
}

.mt-4 {
  margin-top: 16px;
}

/* Reused Loader */
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
</style>
