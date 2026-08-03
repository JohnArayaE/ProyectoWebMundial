<template>
  <div class="page-wrapper">
    <AppHeader
      :loading="loadingAuth || saving"
      @logout="logout"
    />

    <main class="profile-page">
      <section class="main-content">
        <NuxtLink
          to="/"
          class="back-link"
        >
          <span>←</span>
          Volver al inicio
        </NuxtLink>

        <div
          v-if="loadingAuth && !currentUser"
          class="state-card"
        >
          <span class="spinner" />

          <h1>Cargando tu perfil</h1>

          <p>
            Estamos recuperando la información de tu cuenta.
          </p>
        </div>

        <template v-else-if="currentUser">
          <section class="welcome-section">
            <div>
              <span class="welcome-label">
                Configuración de cuenta
              </span>

              <h1>Editar perfil</h1>

              <p>
                Actualiza tu nombre y selecciona el equipo que
                aparecerá como favorito principal en tu perfil.
              </p>
            </div>

            <div class="user-avatar">
              {{ userInitial }}
            </div>
          </section>

          <section class="profile-grid">
            <article class="form-card">
              <div class="card-header">
                <div>
                  <span class="card-label">
                    Información editable
                  </span>

                  <h2>Datos del perfil</h2>
                </div>

                <div class="edit-icon">
                  ✎
                </div>
              </div>

              <form
                class="profile-form"
                @submit.prevent="saveProfile"
              >
                <div class="form-group">
                  <label for="name">
                    Nombre
                  </label>

                  <input
                    id="name"
                    v-model="name"
                    type="text"
                    maxlength="80"
                    autocomplete="name"
                    placeholder="Escribe tu nombre"
                    :disabled="saving"
                  >

                  <small>
                    Este nombre será visible dentro de la
                    plataforma.
                  </small>
                </div>

                <div class="form-group">
                  <label for="favoriteTeam">
                    Selección principal
                  </label>

                  <p
                    v-if="loadingTeams"
                    class="field-state"
                  >
                    Cargando selecciones...
                  </p>

                  <div
                    v-else-if="teamsError"
                    class="field-error"
                  >
                    <span>!</span>

                    <p>{{ teamsError }}</p>
                  </div>

                  <select
                    v-else
                    id="favoriteTeam"
                    v-model="favoriteTeam"
                    :disabled="saving"
                  >
                    <option value="">
                      Selecciona una selección
                    </option>

                    <option
                      v-for="team in teams"
                      :key="team.id"
                      :value="team.name"
                    >
                      {{ team.name }}
                    </option>
                  </select>

                  <small>
                    Esta selección aparecerá como la principal
                    de tu perfil.
                  </small>
                </div>

                <div
                  v-if="formError"
                  class="message error-message"
                  role="alert"
                >
                  <span>!</span>
                  <p>{{ formError }}</p>
                </div>

                <div
                  v-if="errorAuth"
                  class="message error-message"
                  role="alert"
                >
                  <span>!</span>
                  <p>{{ errorAuth }}</p>
                </div>

                <div
                  v-if="successMessage"
                  class="message success-message"
                  role="status"
                >
                  <span>✓</span>
                  <p>{{ successMessage }}</p>
                </div>

                <div class="form-actions">
                  <NuxtLink
                    to="/"
                    class="cancel-button"
                  >
                    Cancelar
                  </NuxtLink>

                  <button
                    type="submit"
                    class="save-button"
                    :disabled="
                      saving ||
                      loadingTeams ||
                      Boolean(teamsError)
                    "
                  >
                    {{
                      saving
                        ? "Guardando..."
                        : "Guardar cambios"
                    }}
                  </button>
                </div>
              </form>
            </article>

            <aside class="account-card">
              <div class="card-header">
                <div>
                  <span class="card-label">
                    Información protegida
                  </span>

                  <h2>Datos de la cuenta</h2>
                </div>

                <div class="lock-icon">
                  🔒
                </div>
              </div>

              <div class="account-information">
                <div class="information-item">
                  <span>Correo electrónico</span>

                  <strong>
                    {{ currentUser.email }}
                  </strong>

                  <small>
                    Está vinculado con tu cuenta de Google.
                  </small>
                </div>

                <div class="information-item">
                  <span>Identificador</span>

                  <strong class="user-id">
                    {{ currentUser.uid }}
                  </strong>

                  <small>
                    Es generado automáticamente por Firebase.
                  </small>
                </div>

                <div class="information-item points-item">
                  <span>Puntos</span>

                  <strong>
                    {{ currentUser.points }}
                  </strong>

                  <small>
                    Se obtienen mediante las predicciones.
                  </small>
                </div>
              </div>

              <div class="account-note">
                <span>i</span>

                <p>
                  El correo, el identificador y los puntos no
                  pueden modificarse desde esta pantalla.
                </p>
              </div>
            </aside>
          </section>
        </template>

        <div
          v-else-if="errorAuth"
          class="state-card error-state"
        >
          <span class="error-symbol">!</span>

          <h1>No se pudo cargar el perfil</h1>

          <p>{{ errorAuth }}</p>

          <NuxtLink
            to="/login"
            class="return-link"
          >
            Volver al inicio de sesión
          </NuxtLink>
        </div>
      </section>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
const {
  currentUser,
  loadingAuth,
  errorAuth,
  initAuth,
  updateProfile,
  logout
} = useAuth()

const {
  teams,
  loading: loadingTeams,
  error: teamsError,
  fetchTeams
} = useTeams()

const name = ref("")
const favoriteTeam = ref("")
const saving = ref(false)
const formError = ref("")
const successMessage = ref("")

const userInitial = computed(() => {
  const currentName = currentUser.value?.name?.trim()

  return currentName
    ? currentName.charAt(0).toUpperCase()
    : "U"
})

const saveProfile = async (): Promise<void> => {
  formError.value = ""
  successMessage.value = ""

  if (!name.value.trim()) {
    formError.value = "Debes escribir un nombre."
    return
  }

  if (name.value.trim().length < 2) {
    formError.value =
      "El nombre debe tener al menos dos caracteres."
    return
  }

  if (!favoriteTeam.value) {
    formError.value =
      "Debes seleccionar una selección principal."
    return
  }

  saving.value = true

  const updated = await updateProfile(
    name.value,
    favoriteTeam.value
  )

  saving.value = false

  if (updated) {
    successMessage.value =
      "Tu perfil fue actualizado correctamente."
  }
}

useHead({
  title: "Editar perfil | World Cup Tracker 2026",
  meta: [
    {
      name: "description",
      content:
        "Actualiza tu nombre y selección principal."
    }
  ]
})

onMounted(async () => {
  initAuth()
  await fetchTeams()
})

watch(
  currentUser,
  (user) => {
    if (user) {
      name.value = user.name
      favoriteTeam.value = user.favoriteTeam
    }
  },
  {
    immediate: true
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
</script>

<style scoped>
.page-wrapper {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  background: #eef1ec;
}

.profile-page {
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
  font-family:
    Inter,
    Arial,
    Helvetica,
    sans-serif;
  color: var(--text);
  background:
    radial-gradient(
      circle at 10% 10%,
      rgba(157, 202, 83, 0.11),
      transparent 25%
    ),
    var(--background);
}

.main-content {
  width: min(1180px, calc(100% - 48px));
  margin: 0 auto;
  padding: 45px 0 65px;
}

.back-link {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 33px;
  font-size: 12px;
  font-weight: 800;
  color: var(--lime-dark);
  text-decoration: none;
  transition:
    color 180ms ease,
    transform 180ms ease;
}

.back-link:hover {
  color: var(--black);
  transform: translateX(-3px);
}

.welcome-section {
  display: flex;
  gap: 35px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 38px;
}

.welcome-label {
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

.welcome-section h1 {
  margin: 0 0 12px;
  font-size: clamp(35px, 5vw, 54px);
  line-height: 1.08;
  letter-spacing: -2px;
}

.welcome-section p {
  max-width: 680px;
  margin: 0;
  font-size: 15px;
  line-height: 1.65;
  color: var(--gray);
}

.user-avatar {
  display: grid;
  width: 76px;
  height: 76px;
  flex: 0 0 auto;
  font-size: 30px;
  font-weight: 900;
  color: var(--black);
  place-items: center;
  border-radius: 22px;
  background: var(--lime);
  box-shadow: 0 12px 30px rgba(114, 156, 52, 0.2);
}

.profile-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(300px, 0.75fr);
  gap: 22px;
  align-items: start;
}

.form-card,
.account-card {
  padding: 32px;
  border: 1px solid var(--border);
  border-radius: 22px;
  background: var(--white);
  box-shadow: 0 14px 38px rgba(20, 25, 20, 0.07);
}

.card-header {
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 24px;
  margin-bottom: 26px;
  border-bottom: 1px solid var(--border);
}

.card-label {
  display: block;
  margin-bottom: 7px;
  font-size: 10px;
  font-weight: 900;
  color: var(--lime-dark);
  text-transform: uppercase;
  letter-spacing: 1.4px;
}

.card-header h2 {
  margin: 0;
  font-size: 23px;
}

.edit-icon,
.lock-icon {
  display: grid;
  width: 46px;
  height: 46px;
  flex: 0 0 auto;
  font-size: 19px;
  place-items: center;
  border-radius: 14px;
  background: var(--lime-soft);
}

.profile-form {
  display: grid;
  gap: 24px;
}

.form-group {
  display: grid;
  gap: 9px;
}

.form-group label {
  font-size: 12px;
  font-weight: 800;
}

.form-group input,
.form-group select {
  width: 100%;
  min-height: 51px;
  padding: 12px 15px;
  font: inherit;
  font-size: 14px;
  color: var(--text);
  border: 1px solid #d5dbd2;
  border-radius: 12px;
  background: var(--white);
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.form-group input:focus,
.form-group select:focus {
  border-color: var(--lime-dark);
  outline: none;
  box-shadow: 0 0 0 4px rgba(157, 202, 83, 0.18);
}

.form-group input:disabled,
.form-group select:disabled {
  cursor: not-allowed;
  opacity: 0.65;
  background: #f3f5f1;
}

.form-group small {
  font-size: 11px;
  line-height: 1.5;
  color: var(--gray);
}

.field-state {
  min-height: 51px;
  padding: 15px;
  margin: 0;
  font-size: 13px;
  color: var(--gray);
  border: 1px solid var(--border);
  border-radius: 12px;
  background: #f7f8f6;
}

.field-error {
  display: flex;
  gap: 10px;
  align-items: center;
  min-height: 51px;
  padding: 12px 14px;
  color: #8a3030;
  border: 1px solid #efc5c5;
  border-radius: 12px;
  background: #fff1f1;
}

.field-error span {
  display: grid;
  width: 22px;
  height: 22px;
  flex: 0 0 auto;
  font-size: 12px;
  font-weight: 900;
  color: var(--white);
  place-items: center;
  border-radius: 50%;
  background: #ba3d3d;
}

.field-error p {
  margin: 0;
  font-size: 12px;
}

.message {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 13px 14px;
  border-radius: 12px;
}

.message span {
  display: grid;
  width: 23px;
  height: 23px;
  flex: 0 0 auto;
  font-size: 12px;
  font-weight: 900;
  place-items: center;
  border-radius: 50%;
}

.message p {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
}

.error-message {
  color: #8a3030;
  border: 1px solid #efc5c5;
  background: #fff1f1;
}

.error-message span {
  color: var(--white);
  background: #ba3d3d;
}

.success-message {
  color: #476325;
  border: 1px solid #cee2ad;
  background: #f0f7e5;
}

.success-message span {
  color: var(--black);
  background: var(--lime);
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 4px;
}

.cancel-button,
.save-button {
  display: grid;
  min-height: 47px;
  padding: 11px 20px;
  font: inherit;
  font-size: 13px;
  font-weight: 800;
  text-decoration: none;
  cursor: pointer;
  place-items: center;
  border-radius: 12px;
}

.cancel-button {
  color: var(--text);
  border: 1px solid var(--border);
  background: var(--white);
}

.cancel-button:hover {
  border-color: #bcc3b8;
  background: #f4f5f3;
}

.save-button {
  color: var(--black);
  border: 1px solid var(--lime);
  background: var(--lime);
}

.save-button:hover:not(:disabled) {
  color: var(--white);
  border-color: var(--black);
  background: var(--black);
}

.save-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.account-information {
  display: grid;
  gap: 14px;
}

.information-item {
  padding: 17px;
  border: 1px solid #e3e7e0;
  border-radius: 14px;
  background: #f8f9f7;
}

.information-item > span,
.information-item strong,
.information-item small {
  display: block;
}

.information-item > span {
  margin-bottom: 7px;
  font-size: 10px;
  font-weight: 900;
  color: var(--lime-dark);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.information-item strong {
  margin-bottom: 7px;
  overflow-wrap: anywhere;
  font-size: 13px;
}

.information-item small {
  font-size: 10px;
  line-height: 1.5;
  color: var(--gray);
}

.user-id {
  font-family: Consolas, monospace;
  font-size: 10px !important;
  color: #626a62;
}

.points-item strong {
  font-size: 31px;
  color: var(--lime-dark);
}

.account-note {
  display: flex;
  gap: 11px;
  align-items: flex-start;
  padding: 15px;
  margin-top: 20px;
  border-radius: 13px;
  background: var(--lime-soft);
}

.account-note > span {
  display: grid;
  width: 22px;
  height: 22px;
  flex: 0 0 auto;
  font-size: 11px;
  font-weight: 900;
  color: var(--black);
  place-items: center;
  border-radius: 50%;
  background: var(--lime);
}

.account-note p {
  margin: 1px 0 0;
  font-size: 11px;
  line-height: 1.55;
  color: #57664a;
}

.state-card {
  display: grid;
  width: min(500px, 100%);
  min-height: 330px;
  padding: 45px;
  margin: 60px auto;
  text-align: center;
  place-content: center;
  border: 1px solid var(--border);
  border-radius: 24px;
  background: var(--white);
  box-shadow: 0 20px 50px rgba(20, 25, 20, 0.08);
}

.state-card h1 {
  margin: 20px 0 9px;
  font-size: 25px;
}

.state-card p {
  margin: 0;
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

.error-symbol {
  display: grid;
  width: 48px;
  height: 48px;
  margin: auto;
  font-size: 22px;
  font-weight: 900;
  color: var(--white);
  place-items: center;
  border-radius: 50%;
  background: #b93838;
}

.return-link {
  display: inline-flex;
  justify-content: center;
  padding: 12px 18px;
  margin-top: 24px;
  font-size: 13px;
  font-weight: 800;
  color: var(--white);
  text-decoration: none;
  border-radius: 11px;
  background: var(--black);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 850px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .main-content {
    width: min(100% - 28px, 1180px);
    padding: 32px 0 50px;
  }

  .welcome-section {
    align-items: flex-start;
  }

  .welcome-section h1 {
    font-size: 35px;
  }

  .user-avatar {
    width: 58px;
    height: 58px;
    font-size: 23px;
    border-radius: 17px;
  }

  .form-card,
  .account-card {
    padding: 22px;
  }

  .form-actions {
    display: grid;
  }

  .cancel-button,
  .save-button {
    width: 100%;
  }
}
</style>