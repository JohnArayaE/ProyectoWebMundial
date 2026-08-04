<template>
  <div class="page-layout">
    <AppHeader />

    <main class="manage-page">
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

    </main>

    <AppFooter />
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
  --danger: #b93838;

  display: flex;
  width: 100%;
  min-height: 100dvh;
  flex-direction: column;
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

.manage-page {
  box-sizing: border-box;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px 24px 14px;
  flex: 1;
}

.manage-page *,
.manage-page *::before,
.manage-page *::after {
  box-sizing: border-box;
}

/* Encabezado de la página */

.header-section {
  max-width: 730px;
  margin: 0 auto 26px;
  text-align: center;
}

.title {
  margin: 0 0 8px;
  font-size: clamp(36px, 5vw, 52px);
  letter-spacing: -2px;
}

.text-gradient {
  color: var(--black);
  background: none;
  -webkit-text-fill-color: initial;
}

.subtitle {
  margin: 0 0 16px;
  font-size: 15px;
  color: var(--gray);
}

/* Contenedores */

.glass {
  border: 1px solid var(--border);
  border-radius: 18px;
  background: var(--white);
  box-shadow: 0 12px 34px rgba(20, 25, 20, 0.07);
}

/* Botones */

.btn {
  display: inline-flex;
  min-height: 43px;
  padding: 10px 20px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
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
}

.btn-primary:hover {
  background: #8fbd49;
  transform: translateY(-2px);
}

.btn-secondary {
  color: var(--white);
  background: var(--black);
}

.btn-secondary:hover {
  background: #262926;
  transform: translateY(-2px);
}

.btn-danger {
  color: var(--white);
  background: var(--danger);
}

.btn-danger:hover {
  background: #9e2e2e;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.back-link {
  gap: 8px;
}

/* Formulario */

.form-section {
  padding: 24px 30px;
  margin-bottom: 28px;
}

.form-title {
  display: flex;
  margin: 0 0 20px;
  align-items: center;
  gap: 11px;
  font-size: 23px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 22px;
  margin-bottom: 20px;
}

.form-group {
  display: grid;
  position: relative;
  gap: 6px;
}

.form-label {
  font-size: 11px;
  font-weight: 800;
  color: #555d55;
}

.form-input {
  width: 100%;
  min-height: 43px;
  padding: 9px 14px;
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

.form-input::placeholder {
  color: #9ca39c;
}

.form-input:focus {
  border-color: var(--lime);
  box-shadow: 0 0 0 4px rgba(157, 202, 83, 0.16);
}

.flag-input {
  padding-right: 60px;
  font-size: 20px;
}

.flag-preview {
  position: absolute;
  right: 16px;
  bottom: 6px;
  font-size: 25px;
  pointer-events: none;
}

.form-actions {
  display: flex;
  padding-top: 16px;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid var(--border);
}

/* Lista de equipos */

.section-title {
  display: flex;
  margin: 0 0 14px;
  align-items: center;
  gap: 12px;
  font-size: 27px;
}

.team-count {
  padding: 5px 11px;
  font-size: 12px;
  font-weight: 800;
  color: #547626;
  border-radius: 999px;
  background: var(--lime-soft);
}

.teams-list {
  display: grid;
  gap: 10px;
}

.team-row {
  display: flex;
  padding: 12px 18px;
  align-items: center;
  justify-content: space-between;
  transition:
    border-color 180ms ease,
    transform 180ms ease;
}

.team-row:hover {
  border-color: var(--lime);
  transform: translateY(-2px);
}

.team-row--editing {
  border-color: var(--lime);
  box-shadow: 0 0 0 4px rgba(157, 202, 83, 0.14);
}

.team-row-main {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  gap: 16px;
}

.team-row-flag {
  display: grid;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  place-items: center;
  font-size: 25px;
  border: 1px solid #e4e8e1;
  border-radius: 14px;
  background: #f6f7f5;
}

.team-row-info {
  min-width: 0;
  flex: 1;
}

.team-row-name {
  margin: 0 0 6px;
  overflow: hidden;
  font-size: 17px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.team-row-meta {
  display: flex;
  gap: 7px;
  flex-wrap: wrap;
}

.meta-badge {
  padding: 4px 8px;
  font-size: 10px;
  font-weight: 700;
  color: #626a62;
  white-space: nowrap;
  border: 1px solid #e2e6df;
  border-radius: 7px;
  background: #f5f6f4;
}

.meta-badge--rank {
  color: var(--lime-dark);
  border-color: #d7e8bd;
  background: var(--lime-soft);
}

.meta-badge--coach {
  color: #4e6250;
  border-color: #d7e2d5;
  background: #eef3ec;
}

.team-row-actions {
  display: flex;
  margin-left: 16px;
  flex-shrink: 0;
  gap: 8px;
}

.action-btn {
  display: grid;
  width: 38px;
  height: 38px;
  cursor: pointer;
  place-items: center;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--white);
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    background 180ms ease;
}

.action-btn--edit:hover {
  border-color: var(--lime);
  background: var(--lime-soft);
  transform: scale(1.07);
}

.action-btn--delete:hover {
  border-color: #dc8e8e;
  background: #fbeaea;
  transform: scale(1.07);
}

/* Estado vacío y carga */

.empty-state {
  padding: 45px 25px;
  text-align: center;
  color: var(--gray);
}

.empty-icon {
  margin-bottom: 12px;
  font-size: 42px;
}

.empty-hint {
  margin-top: 8px;
  font-size: 12px;
}

.loader-container {
  display: flex;
  padding: 45px 0;
  flex-direction: column;
  align-items: center;
  color: var(--gray);
}

.spinner,
.btn-spinner {
  border-style: solid;
  border-radius: 50%;
  animation: spin 700ms linear infinite;
}

.spinner {
  width: 42px;
  height: 42px;
  margin-bottom: 16px;
  border-width: 4px;
  border-color: #dfe3dc;
  border-top-color: var(--lime-dark);
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border-width: 2px;
  border-color: rgba(255, 255, 255, 0.45);
  border-top-color: var(--white);
}

/* Modal */

.modal-overlay {
  position: fixed;
  z-index: 100;
  inset: 0;
  display: grid;
  padding: 24px;
  place-items: center;
  background: rgba(11, 13, 12, 0.65);
  backdrop-filter: blur(4px);
}

.modal {
  width: min(420px, 100%);
  padding: 38px 30px;
  text-align: center;
}

.modal-icon {
  margin-bottom: 14px;
  font-size: 42px;
}

.modal-title {
  margin: 0 0 12px;
  font-size: 23px;
  color: var(--text);
}

.modal-text {
  margin: 0 0 26px;
  line-height: 1.6;
  color: var(--gray);
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

/* Notificación */

.toast {
  position: fixed;
  right: 28px;
  bottom: 28px;
  z-index: 200;
  display: flex;
  padding: 14px 20px;
  align-items: center;
  gap: 9px;
  font-size: 13px;
  font-weight: 700;
  color: var(--white);
  border-radius: 12px;
  box-shadow: 0 12px 34px rgba(20, 25, 20, 0.22);
}

.toast--success {
  background: var(--lime-dark);
}

.toast--error {
  background: var(--danger);
}

/* Transiciones */

.modal-enter-active,
.modal-leave-active,
.toast-enter-active,
.toast-leave-active {
  transition: all 250ms ease;
}

.modal-enter-from,
.modal-leave-to,
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Footer */

.page-layout :deep(footer) {
  width: 100%;
  margin-top: 0;
  flex-shrink: 0;
}

/* Teléfonos */

@media (max-width: 650px) {
  .manage-page {
    padding: 18px 14px 12px;
  }

  .header-section {
    margin-bottom: 22px;
  }

  .title {
    font-size: 35px;
  }

  .subtitle {
    margin-bottom: 14px;
  }

  .form-section {
    padding: 20px 17px;
    margin-bottom: 24px;
  }

  .form-title {
    margin-bottom: 18px;
    font-size: 21px;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 14px;
    margin-bottom: 18px;
  }

  .form-actions,
  .modal-actions {
    flex-direction: column;
  }

  .form-actions .btn,
  .modal-actions .btn {
    width: 100%;
  }

  .section-title {
    font-size: 23px;
  }

  .team-row {
    padding: 14px;
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .team-row-actions {
    margin-left: 0;
    align-self: flex-end;
  }

  .toast {
    right: 14px;
    bottom: 14px;
    left: 14px;
  }
}
</style>