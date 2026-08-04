<template>
  <div class="page-layout">
    <AppHeader />

    <main class="manage-page">
      <!-- Encabezado -->
      <div class="header-section">
        <h1 class="title">Gestión de Jugadores</h1>
        <p class="subtitle">
          Crear, editar y eliminar jugadores del Mundial 2026
        </p>

        <NuxtLink to="/players" class="btn btn-secondary back-link">
          <span>&larr;</span>
          Ver lista de jugadores
        </NuxtLink>
      </div>

      <!-- Formulario -->
      <div class="form-section glass">
        <h2 class="form-title">
          <span>{{ editingPlayer ? "✏️" : "➕" }}</span>
          {{ editingPlayer ? "Editar Jugador" : "Nuevo Jugador" }}
        </h2>

        <form class="player-form" @submit.prevent="handleSubmit">
          <div class="form-grid">
            <!-- Nombre -->
            <div class="form-group">
              <label for="name" class="form-label"> Nombre del jugador </label>

              <input
                id="name"
                v-model="form.name"
                type="text"
                class="form-input"
                placeholder="Ej: Lionel Messi"
                required
              />
            </div>

            <!-- Selección -->
            <div class="form-group">
              <label for="teamId" class="form-label"> Selección </label>

              <select
                id="teamId"
                v-model="form.teamId"
                class="form-input"
                required
              >
                <option value="" disabled>Seleccionar equipo</option>

                <option v-for="team in teams" :key="team.id" :value="team.id">
                  {{ team.flag || "🏳️" }} {{ team.name }}
                </option>
              </select>

              <p v-if="!teamsLoading && teams.length === 0" class="field-hint">
                Primero debes registrar al menos un equipo.
              </p>
            </div>

            <!-- Número -->
            <div class="form-group">
              <label for="number" class="form-label">
                Número de camiseta
              </label>

              <input
                id="number"
                v-model.number="form.number"
                type="number"
                class="form-input"
                placeholder="Ej: 10"
                min="1"
                max="99"
                required
              />
            </div>

            <!-- Posición -->
            <div class="form-group">
              <label for="position" class="form-label"> Posición </label>

              <select
                id="position"
                v-model="form.position"
                class="form-input"
                required
              >
                <option value="" disabled>Seleccionar posición</option>

                <option
                  v-for="position in positionOptions"
                  :key="position"
                  :value="position"
                >
                  {{ position }}
                </option>
              </select>
            </div>

            <!-- Club -->
            <div class="form-group form-group--full">
              <label for="club" class="form-label"> Club actual </label>

              <input
                id="club"
                v-model="form.club"
                type="text"
                class="form-input"
                placeholder="Ej: Inter Miami"
                required
              />
            </div>
          </div>

          <div class="form-actions">
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="submitting || teams.length === 0"
            >
              <span v-if="submitting" class="btn-spinner"></span>

              {{ editingPlayer ? "Guardar Cambios" : "Crear Jugador" }}
            </button>

            <button
              v-if="editingPlayer"
              type="button"
              class="btn btn-secondary"
              @click="cancelEdit"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <!-- Lista -->
      <div class="list-section">
        <h2 class="section-title">
          Jugadores Registrados

          <span class="player-count">
            {{ players.length }}
          </span>
        </h2>

        <div v-if="pageLoading" class="loader-container">
          <div class="spinner"></div>
          <p>Cargando jugadores...</p>
        </div>

        <div v-else-if="pageError" class="error-state glass">
          <p>⚠️ {{ pageError }}</p>
        </div>

        <div v-else-if="players.length === 0" class="empty-state glass">
          <div class="empty-icon">👕</div>
          <p>No hay jugadores registrados todavía.</p>
          <p class="empty-hint">
            Usa el formulario de arriba para agregar el primero.
          </p>
        </div>

        <div v-else class="players-list">
          <div
            v-for="player in players"
            :key="player.id"
            class="player-row glass"
            :class="{
              'player-row--editing': editingPlayer?.id === player.id,
            }"
          >
            <div class="player-row-main">
              <div class="player-number">
                {{ player.number }}
              </div>

              <div class="player-row-info">
                <h3 class="player-row-name">
                  {{ player.name }}
                </h3>

                <div class="player-row-meta">
                  <span class="meta-badge meta-badge--team">
                    {{ getTeamName(player.teamId) }}
                  </span>

                  <span class="meta-badge">
                    {{ player.position }}
                  </span>

                  <span class="meta-badge meta-badge--club">
                    {{ player.club }}
                  </span>
                </div>
              </div>
            </div>

            <div class="player-row-actions">
              <button
                type="button"
                class="action-btn action-btn--edit"
                title="Editar jugador"
                @click="startEdit(player)"
              >
                ✏️
              </button>

              <button
                type="button"
                class="action-btn action-btn--delete"
                title="Eliminar jugador"
                @click="confirmDelete(player)"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de eliminación -->
      <Teleport to="body">
        <Transition name="modal">
          <div
            v-if="playerToDelete"
            class="modal-overlay"
            @click.self="playerToDelete = null"
          >
            <div class="modal glass">
              <div class="modal-icon">⚠️</div>

              <h3 class="modal-title">¿Eliminar jugador?</h3>

              <p class="modal-text">
                Estás a punto de eliminar a
                <strong>{{ playerToDelete.name }}</strong
                >. Esta acción no se puede deshacer.
              </p>

              <div class="modal-actions">
                <button
                  type="button"
                  class="btn btn-danger"
                  :disabled="deleting"
                  @click="executeDelete"
                >
                  <span v-if="deleting" class="btn-spinner"></span>
                  Sí, eliminar
                </button>

                <button
                  type="button"
                  class="btn btn-secondary"
                  :disabled="deleting"
                  @click="playerToDelete = null"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- Notificación -->
      <Teleport to="body">
        <Transition name="toast">
          <div v-if="toast.show" class="toast" :class="`toast--${toast.type}`">
            <span>
              {{ toast.type === "success" ? "✅" : "❌" }}
            </span>

            <span>{{ toast.message }}</span>
          </div>
        </Transition>
      </Teleport>
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";

const {
  players,
  loading: playersLoading,
  error: playersError,
  fetchPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer,
} = usePlayers();

const {
  teams,
  loading: teamsLoading,
  error: teamsError,
  fetchTeams,
} = useTeams();

const positionOptions = ["Portero", "Defensa", "Mediocampista", "Delantero"];

const defaultForm = {
  teamId: "",
  name: "",
  number: null,
  position: "",
  club: "",
};

const form = reactive({ ...defaultForm });

const editingPlayer = ref(null);
const playerToDelete = ref(null);

const submitting = ref(false);
const deleting = ref(false);

const toast = reactive({
  show: false,
  message: "",
  type: "success",
});

const pageLoading = computed(() => {
  return playersLoading.value || teamsLoading.value;
});

const pageError = computed(() => {
  return playersError.value || teamsError.value;
});

const teamNames = computed(() => {
  return Object.fromEntries(
    teams.value.map((team) => [team.id, `${team.flag || "🏳️"} ${team.name}`]),
  );
});

let toastTimeout = null;

function getTeamName(teamId) {
  return teamNames.value[teamId] || "Selección no encontrada";
}

function showToast(message, type = "success") {
  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }

  toast.show = true;
  toast.message = message;
  toast.type = type;

  toastTimeout = setTimeout(() => {
    toast.show = false;
  }, 3500);
}

function resetForm() {
  Object.assign(form, { ...defaultForm });
  editingPlayer.value = null;
}

function startEdit(player) {
  editingPlayer.value = player;

  Object.assign(form, {
    teamId: player.teamId || "",
    name: player.name || "",
    number: player.number || null,
    position: player.position || "",
    club: player.club || "",
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

function cancelEdit() {
  resetForm();
}

async function handleSubmit() {
  const number = Number(form.number);

  if (!Number.isInteger(number) || number < 1 || number > 99) {
    showToast("El número de camiseta debe estar entre 1 y 99.", "error");

    return;
  }

  submitting.value = true;

  try {
    const data = {
      teamId: form.teamId,
      name: form.name.trim(),
      number,
      position: form.position,
      club: form.club.trim(),
    };

    if (editingPlayer.value) {
      await updatePlayer(editingPlayer.value.id, data);
      showToast(`${data.name} actualizado correctamente`);
    } else {
      await createPlayer(data);
      showToast(`${data.name} creado correctamente`);
    }

    resetForm();
  } catch (e) {
    showToast(
      playersError.value || "Ocurrió un error con el jugador.",
      "error",
    );
  } finally {
    submitting.value = false;
  }
}

function confirmDelete(player) {
  playerToDelete.value = player;
}

async function executeDelete() {
  if (!playerToDelete.value?.id) {
    return;
  }

  deleting.value = true;

  const playerId = playerToDelete.value.id;
  const playerName = playerToDelete.value.name;
  const wasEditing = editingPlayer.value?.id === playerId;

  try {
    await deletePlayer(playerId);

    playerToDelete.value = null;

    if (wasEditing) {
      resetForm();
    }

    showToast(`${playerName} eliminado correctamente`);
  } catch (e) {
    showToast(playersError.value || "No se pudo eliminar el jugador.", "error");
  } finally {
    deleting.value = false;
  }
}

onMounted(async () => {
  await Promise.all([fetchPlayers(), fetchTeams()]);
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
  --danger: #b93838;

  display: flex;
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
  max-width: 900px;
  margin: 0 auto;
  padding: 28px 24px;
  flex: 1;
}

.manage-page *,
.manage-page *::before,
.manage-page *::after {
  box-sizing: border-box;
}

.header-section {
  max-width: 730px;
  margin: 0 auto 28px;
  text-align: center;
}

.title {
  margin: 0 0 10px;
  font-size: clamp(36px, 5vw, 52px);
  letter-spacing: -2px;
}

.subtitle {
  margin: 0 0 22px;
  font-size: 15px;
  color: var(--gray);
}

.glass {
  border: 1px solid var(--border);
  border-radius: 18px;
  background: var(--white);
  box-shadow: 0 12px 34px rgba(20, 25, 20, 0.07);
}

.btn {
  display: inline-flex;
  min-height: 45px;
  padding: 11px 21px;
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
    background 180ms ease;
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

.form-section {
  padding: 30px;
  margin-bottom: 32px;
}

.form-title {
  display: flex;
  margin: 0 0 22px;
  align-items: center;
  gap: 11px;
  font-size: 23px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
  margin-bottom: 24px;
}

.form-group {
  display: grid;
  gap: 8px;
}

.form-group--full {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 11px;
  font-weight: 800;
  color: #555d55;
}

.form-input {
  width: 100%;
  min-width: 0;
  min-height: 48px;
  padding: 12px 14px;
  font-size: 14px;
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 11px;
  outline: none;
  background: var(--white);
}

.form-input:focus {
  border-color: var(--lime);
  box-shadow: 0 0 0 4px rgba(157, 202, 83, 0.16);
}

.field-hint {
  margin: 0;
  font-size: 11px;
  color: var(--danger);
}

.form-actions {
  display: flex;
  padding-top: 16px;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid var(--border);
}

.section-title {
  display: flex;
  margin: 0 0 16px;
  align-items: center;
  gap: 12px;
  font-size: 27px;
}

.player-count {
  padding: 5px 11px;
  font-size: 12px;
  font-weight: 800;
  color: #547626;
  border-radius: 999px;
  background: var(--lime-soft);
}

.players-list {
  display: grid;
  gap: 12px;
}

.player-row {
  display: flex;
  padding: 17px 21px;
  align-items: center;
  justify-content: space-between;
  transition:
    border-color 180ms ease,
    transform 180ms ease;
}

.player-row:hover {
  border-color: var(--lime);
  transform: translateY(-2px);
}

.player-row--editing {
  border-color: var(--lime);
  box-shadow: 0 0 0 4px rgba(157, 202, 83, 0.14);
}

.player-row-main {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  gap: 16px;
}

.player-number {
  display: grid;
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  place-items: center;
  font-size: 20px;
  font-weight: 900;
  color: var(--black);
  border: 1px solid #d7e8bd;
  border-radius: 14px;
  background: var(--lime-soft);
}

.player-row-info {
  min-width: 0;
  flex: 1;
}

.player-row-name {
  margin: 0 0 7px;
  overflow: hidden;
  font-size: 17px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.player-row-meta {
  display: flex;
  gap: 7px;
  flex-wrap: wrap;
}

.meta-badge {
  padding: 4px 8px;
  font-size: 10px;
  font-weight: 700;
  color: #626a62;
  border: 1px solid #e2e6df;
  border-radius: 7px;
  background: #f5f6f4;
}

.meta-badge--team {
  color: var(--lime-dark);
  border-color: #d7e8bd;
  background: var(--lime-soft);
}

.meta-badge--club {
  color: #4e6250;
  border-color: #d7e2d5;
  background: #eef3ec;
}

.player-row-actions {
  display: flex;
  margin-left: 16px;
  flex-shrink: 0;
  gap: 8px;
}

.action-btn {
  display: grid;
  width: 40px;
  height: 40px;
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

.empty-state,
.error-state {
  padding: 60px 25px;
  text-align: center;
  color: var(--gray);
}

.error-state {
  color: var(--danger);
}

.empty-icon {
  margin-bottom: 15px;
  font-size: 44px;
}

.empty-hint {
  margin-top: 8px;
  font-size: 12px;
}

.loader-container {
  display: flex;
  padding: 60px 0;
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
.page-layout :deep(footer) {
  width: 100%;
  margin-top: 0;
  flex-shrink: 0;
}

@media (max-width: 650px) {
  .manage-page {
    padding: 26px 14px;
  }

  .title {
    font-size: 35px;
    letter-spacing: -1px;
  }

  .form-section {
    padding: 22px 17px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-group--full {
    grid-column: auto;
  }

  .form-actions,
  .modal-actions {
    flex-direction: column;
  }

  .form-actions .btn,
  .modal-actions .btn {
    width: 100%;
  }

  .player-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 14px;
  }

  .player-row-actions {
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
