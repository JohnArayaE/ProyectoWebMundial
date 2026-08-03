<template>
  <div class="manage-page">
    <!-- Header -->
    <div class="header-section">
      <h1 class="title text-gradient">Gestión de Equipos</h1>
      <p class="subtitle">Crear, editar y eliminar selecciones del Mundial 2026</p>
      <NuxtLink to="/teams" class="btn btn-secondary back-link">
        <span>&larr;</span> Ver lista de equipos
      </NuxtLink>
    </div>

    <!-- Formulario de Crear / Editar -->
    <div class="form-section glass animate-fade-in">
      <h2 class="form-title">
        <span class="form-icon">{{ editingTeam ? '✏️' : '➕' }}</span>
        {{ editingTeam ? 'Editar Equipo' : 'Nuevo Equipo' }}
      </h2>

      <form @submit.prevent="handleSubmit" class="team-form">
        <div class="form-grid">
          <!-- Nombre -->
          <div class="form-group">
            <label for="name" class="form-label">Nombre de la Selección</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              class="form-input"
              placeholder="Ej: Argentina"
              required
            />
          </div>

          <!-- Grupo -->
          <div class="form-group">
            <label for="group" class="form-label">Grupo</label>
            <select id="group" v-model="form.group" class="form-input" required>
              <option value="" disabled>Seleccionar grupo</option>
              <option v-for="g in groupOptions" :key="g" :value="g">Grupo {{ g }}</option>
            </select>
          </div>

          <!-- Bandera (emoji) -->
          <div class="form-group">
            <label for="flag" class="form-label">Bandera (Emoji)</label>
            <input
              id="flag"
              v-model="form.flag"
              type="text"
              class="form-input flag-input"
              placeholder="🇦🇷"
            />
            <span v-if="form.flag" class="flag-preview">{{ form.flag }}</span>
          </div>

          <!-- Director Técnico -->
          <div class="form-group">
            <label for="coach" class="form-label">Director Técnico</label>
            <input
              id="coach"
              v-model="form.coach"
              type="text"
              class="form-input"
              placeholder="Ej: Lionel Scaloni"
            />
          </div>

          <!-- Confederación -->
          <div class="form-group">
            <label for="confederation" class="form-label">Confederación</label>
            <select id="confederation" v-model="form.confederation" class="form-input" required>
              <option value="" disabled>Seleccionar confederación</option>
              <option value="CONMEBOL">CONMEBOL</option>
              <option value="UEFA">UEFA</option>
              <option value="CONCACAF">CONCACAF</option>
              <option value="AFC">AFC</option>
              <option value="CAF">CAF</option>
              <option value="OFC">OFC</option>
            </select>
          </div>

          <!-- Ranking FIFA -->
          <div class="form-group">
            <label for="fifaRanking" class="form-label">Ranking FIFA</label>
            <input
              id="fifaRanking"
              v-model.number="form.fifaRanking"
              type="number"
              class="form-input"
              placeholder="1"
              min="1"
              max="211"
            />
          </div>
        </div>

        <!-- Botones del formulario -->
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            <span v-if="submitting" class="btn-spinner"></span>
            {{ editingTeam ? 'Guardar Cambios' : 'Crear Equipo' }}
          </button>
          <button
            v-if="editingTeam"
            type="button"
            class="btn btn-secondary"
            @click="cancelEdit"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>

    <!-- Lista de Equipos existentes -->
    <div class="list-section">
      <h2 class="section-title">
        Equipos Registrados
        <span class="team-count">{{ teams.length }}</span>
      </h2>

      <div v-if="loading" class="loader-container">
        <div class="spinner"></div>
        <p>Cargando equipos...</p>
      </div>

      <div v-else-if="teams.length === 0" class="empty-state glass">
        <div class="empty-icon">⚽</div>
        <p>No hay equipos registrados todavía.</p>
        <p class="empty-hint">¡Usa el formulario de arriba para agregar el primero!</p>
      </div>

      <div v-else class="teams-list">
        <div
          v-for="team in teams"
          :key="team.id"
          class="team-row glass"
          :class="{ 'team-row--editing': editingTeam?.id === team.id }"
        >
          <div class="team-row-main">
            <div class="team-row-flag">
              <span v-if="team.flag && team.flag.trim() !== ''">{{ team.flag }}</span>
              <span v-else>🏳️</span>
            </div>
            <div class="team-row-info">
              <h3 class="team-row-name">{{ team.name }}</h3>
              <div class="team-row-meta">
                <span class="meta-badge">Grupo {{ team.group }}</span>
                <span class="meta-badge">{{ team.confederation }}</span>
                <span v-if="team.fifaRanking" class="meta-badge meta-badge--rank">FIFA #{{ team.fifaRanking }}</span>
                <span v-if="team.coach" class="meta-badge meta-badge--coach">DT: {{ team.coach }}</span>
              </div>
            </div>
          </div>
          <div class="team-row-actions">
            <button
              class="action-btn action-btn--edit"
              title="Editar"
              @click="startEdit(team)"
            >
              ✏️
            </button>
            <button
              class="action-btn action-btn--delete"
              title="Eliminar"
              @click="confirmDelete(team)"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación de eliminar -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="teamToDelete" class="modal-overlay" @click.self="teamToDelete = null">
          <div class="modal glass animate-fade-in">
            <div class="modal-icon">⚠️</div>
            <h3 class="modal-title">¿Eliminar equipo?</h3>
            <p class="modal-text">
              Estás a punto de eliminar a <strong>{{ teamToDelete.name }}</strong>. Esta acción no se puede deshacer.
            </p>
            <div class="modal-actions">
              <button
                class="btn btn-danger"
                :disabled="deleting"
                @click="executeDelete"
              >
                <span v-if="deleting" class="btn-spinner"></span>
                Sí, eliminar
              </button>
              <button class="btn btn-secondary" @click="teamToDelete = null">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Toast de notificación -->
    <Teleport to="body">
      <Transition name="toast">
        <div v-if="toast.show" class="toast" :class="`toast--${toast.type}`">
          <span class="toast-icon">{{ toast.type === 'success' ? '✅' : '❌' }}</span>
          <span>{{ toast.message }}</span>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

const { teams, loading, error, fetchTeams, createTeam, updateTeam, deleteTeam } = useTeams()

const groupOptions = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

const defaultForm = {
  name: '',
  group: '',
  flag: '',
  coach: '',
  confederation: '',
  fifaRanking: null
}

const form = reactive({ ...defaultForm })
const editingTeam = ref(null)
const submitting = ref(false)
const teamToDelete = ref(null)
const deleting = ref(false)

const toast = reactive({
  show: false,
  message: '',
  type: 'success'
})

let toastTimeout = null

function showToast(message, type = 'success') {
  if (toastTimeout) clearTimeout(toastTimeout)
  toast.show = true
  toast.message = message
  toast.type = type
  toastTimeout = setTimeout(() => {
    toast.show = false
  }, 3500)
}

function resetForm() {
  Object.assign(form, { ...defaultForm })
  editingTeam.value = null
}

function startEdit(team) {
  editingTeam.value = team
  Object.assign(form, {
    name: team.name || '',
    group: team.group || '',
    flag: team.flag || '',
    coach: team.coach || '',
    confederation: team.confederation || '',
    fifaRanking: team.fifaRanking || null
  })
  // Scroll al formulario
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelEdit() {
  resetForm()
}

async function handleSubmit() {
  submitting.value = true

  try {
    const data = {
      name: form.name,
      group: form.group,
      flag: form.flag,
      coach: form.coach,
      confederation: form.confederation,
      fifaRanking: form.fifaRanking
    }

    if (editingTeam.value) {
      await updateTeam(editingTeam.value.id, data)
      showToast(`${data.name} actualizado correctamente`)
    } else {
      await createTeam(data)
      showToast(`${data.name} creado correctamente`)
    }

    resetForm()
  } catch (e) {
    showToast(error.value || 'Ocurrió un error', 'error')
  } finally {
    submitting.value = false
  }
}

function confirmDelete(team) {
  teamToDelete.value = team
}

async function executeDelete() {
  if (!teamToDelete.value) return
  deleting.value = true

  try {
    const name = teamToDelete.value.name
    await deleteTeam(teamToDelete.value.id)
    showToast(`${name} eliminado correctamente`)
    teamToDelete.value = null
    // Si estábamos editando este equipo, resetear
    if (editingTeam.value?.id === teamToDelete.value?.id) {
      resetForm()
    }
  } catch (e) {
    showToast(error.value || 'No se pudo eliminar', 'error')
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  fetchTeams()
})
</script>

<style scoped>
/* ── Header ── */
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
  margin-bottom: 20px;
}

.back-link {
  gap: 8px;
}

/* ── Form Section ── */
.form-section {
  padding: 32px;
  margin-bottom: 48px;
}

.form-title {
  font-size: 1.5rem;
  margin-bottom: 28px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.form-icon {
  font-size: 1.4rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-input {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
  padding: 14px 16px;
  border-radius: 10px;
  outline: none;
  font-family: 'Outfit', sans-serif;
  font-size: 1rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  width: 100%;
}

.form-input::placeholder {
  color: rgba(148, 163, 184, 0.5);
}

.form-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15);
}

.form-input option {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.flag-input {
  font-size: 1.5rem;
  text-align: center;
  max-width: 100px;
}

.flag-preview {
  position: absolute;
  right: 16px;
  bottom: 10px;
  font-size: 2rem;
  pointer-events: none;
  filter: drop-shadow(0 2px 8px rgba(0,0,0,0.4));
}

.form-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

/* ── List Section ── */
.section-title {
  font-size: 1.8rem;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.team-count {
  background: linear-gradient(135deg, #38bdf8, #818cf8);
  color: white;
  font-size: 0.85rem;
  padding: 4px 12px;
  border-radius: 99px;
  font-weight: 700;
}

.teams-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.team-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  transition: border-color 0.3s ease, transform 0.2s ease;
}

.team-row:hover {
  border-color: rgba(56, 189, 248, 0.3);
}

.team-row--editing {
  border-color: var(--accent) !important;
  box-shadow: 0 0 24px rgba(56, 189, 248, 0.15);
}

.team-row-main {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.team-row-flag {
  font-size: 2rem;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.team-row-info {
  flex: 1;
  min-width: 0;
}

.team-row-name {
  font-size: 1.15rem;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.team-row-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.meta-badge {
  background: rgba(255, 255, 255, 0.08);
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.meta-badge--rank {
  background: rgba(34, 197, 94, 0.15);
  color: var(--success);
  border: 1px solid rgba(34, 197, 94, 0.25);
}

.meta-badge--coach {
  background: rgba(129, 140, 248, 0.15);
  color: #a5b4fc;
  border: 1px solid rgba(129, 140, 248, 0.25);
}

.team-row-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  margin-left: 16px;
}

.action-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: rgba(15, 23, 42, 0.5);
  cursor: pointer;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

.action-btn--edit:hover {
  background: rgba(56, 189, 248, 0.15);
  border-color: rgba(56, 189, 248, 0.4);
  transform: scale(1.1);
}

.action-btn--delete:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.4);
  transform: scale(1.1);
}

/* ── Empty State ── */
.empty-state {
  text-align: center;
  padding: 64px 32px;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  animation: bounce 2s ease infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.empty-hint {
  margin-top: 8px;
  font-size: 0.9rem;
  color: rgba(148, 163, 184, 0.6);
}

/* ── Loader ── */
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

/* ── Button spinner ── */
.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-left-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 24px;
  border-radius: 9999px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-family: 'Outfit', sans-serif;
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.5);
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* ── Modal ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 24px;
}

.modal {
  max-width: 420px;
  width: 100%;
  padding: 40px 32px;
  text-align: center;
}

.modal-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.modal-title {
  font-size: 1.5rem;
  margin-bottom: 12px;
}

.modal-text {
  color: var(--text-secondary);
  margin-bottom: 28px;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* ── Toast ── */
.toast {
  position: fixed;
  bottom: 32px;
  right: 32px;
  padding: 14px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 200;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.toast--success {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(22, 163, 74, 0.9));
  color: white;
  border: 1px solid rgba(34, 197, 94, 0.5);
}

.toast--error {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9));
  color: white;
  border: 1px solid rgba(239, 68, 68, 0.5);
}

.toast-icon {
  font-size: 1.2rem;
}

/* Toast transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(60px);
}

/* ── Responsive ── */
@media (max-width: 600px) {
  .title {
    font-size: 2rem;
  }

  .form-section {
    padding: 24px 16px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .team-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .team-row-actions {
    margin-left: 0;
    align-self: flex-end;
  }

  .toast {
    left: 16px;
    right: 16px;
    bottom: 16px;
  }
}
</style>
