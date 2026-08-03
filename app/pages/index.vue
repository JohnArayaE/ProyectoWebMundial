<template>
  <div class="page-wrapper">
    <AppHeader
      :loading="loadingAuth"
      @logout="logout"
    />

    <main class="home-page">
      <section class="main-content">
        <div
          v-if="loadingAuth && !currentUser"
          class="state-card"
        >
          <span class="spinner" />

          <h1>Cargando tu perfil</h1>

          <p>Estamos verificando tu sesión.</p>
        </div>

        <template v-else-if="currentUser">
          <section class="welcome-section">
            <div>
              <span class="welcome-label">
                Sesión iniciada
              </span>

              <h1>
                Bienvenido,
                <span>{{ currentUser.name }}</span>
              </h1>

              <p>
                Consulta la información de tu cuenta y administra
                tu participación dentro del torneo.
              </p>
            </div>

            <div class="status-card">
              <span class="status-dot" />

              <div>
                <strong>Cuenta activa</strong>
                <small>{{ currentUser.email }}</small>
              </div>
            </div>
          </section>

          <section class="profile-grid">
            <article class="profile-card main-profile-card">
              <div class="card-header">
                <div>
                  <span class="card-label">
                    Perfil
                  </span>

                  <h2>Información del usuario</h2>
                </div>

                <div class="user-avatar">
                  {{ userInitial }}
                </div>
              </div>

              <div class="profile-information">
                <div class="information-row">
                  <span class="information-label">
                    Nombre
                  </span>

                  <strong>
                    {{ currentUser.name }}
                  </strong>
                </div>

                <div class="information-row">
                  <span class="information-label">
                    Correo electrónico
                  </span>

                  <strong>
                    {{ currentUser.email }}
                  </strong>
                </div>

                <div class="information-row">
                  <span class="information-label">
                    Identificador
                  </span>

                  <strong class="user-id">
                    {{ currentUser.uid }}
                  </strong>
                </div>
              </div>

              <NuxtLink
                to="/profile"
                class="edit-button"
              >
                Editar perfil
              </NuxtLink>
            </article>

            <article class="summary-card">
              <div class="summary-icon">
                ⭐
              </div>

              <span class="summary-label">
                Selección favorita
              </span>

              <strong>
                {{
                  currentUser.favoriteTeam ||
                    "No seleccionada"
                }}
              </strong>

              <p>
                Puedes cambiarla desde la edición de tu perfil.
              </p>
            </article>

            <article class="summary-card">
              <div class="summary-icon">
                🏆
              </div>

              <span class="summary-label">
                Puntos
              </span>

              <strong class="points">
                {{ currentUser.points }}
              </strong>

              <p>
                Obtendrás puntos con tus predicciones.
              </p>
            </article>
          </section>
        </template>

        <div
          v-else-if="errorAuth"
          class="state-card error-state"
        >
          <span class="error-symbol">!</span>

          <h1>No se pudo cargar la sesión</h1>

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
  logout
} = useAuth()

const userInitial = computed(() => {
  const name = currentUser.value?.name?.trim()

  return name
    ? name.charAt(0).toUpperCase()
    : "U"
})

useHead({
  title: "Inicio | World Cup Tracker 2026",
  meta: [
    {
      name: "description",
      content:
        "Página principal del World Cup Tracker 2026."
    }
  ]
})

onMounted(() => {
  initAuth()
})

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

.home-page {
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
  padding: 65px 0;
}

.welcome-section {
  display: flex;
  gap: 35px;
  align-items: flex-end;
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

.welcome-section h1 span {
  color: var(--lime-dark);
}

.welcome-section p {
  max-width: 660px;
  margin: 0;
  font-size: 15px;
  line-height: 1.65;
  color: var(--gray);
}

.status-card {
  display: flex;
  gap: 12px;
  align-items: center;
  min-width: 270px;
  padding: 16px 18px;
  border: 1px solid var(--border);
  border-radius: 15px;
  background: var(--white);
  box-shadow: 0 10px 30px rgba(20, 25, 20, 0.06);
}

.status-dot {
  width: 12px;
  height: 12px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: var(--lime);
  box-shadow: 0 0 0 5px rgba(157, 202, 83, 0.17);
}

.status-card strong,
.status-card small {
  display: block;
}

.status-card strong {
  margin-bottom: 3px;
  font-size: 13px;
}

.status-card small {
  max-width: 210px;
  overflow: hidden;
  font-size: 11px;
  color: var(--gray);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-grid {
  display: grid;
  grid-template-columns: 1.5fr 0.75fr;
  gap: 22px;
}

.profile-card,
.summary-card {
  border: 1px solid var(--border);
  border-radius: 22px;
  background: var(--white);
  box-shadow: 0 14px 38px rgba(20, 25, 20, 0.07);
}

.main-profile-card {
  grid-row: span 2;
  padding: 32px;
}

.card-header {
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 25px;
  border-bottom: 1px solid var(--border);
}

.card-label,
.summary-label {
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
  font-size: 24px;
}

.user-avatar {
  display: grid;
  width: 62px;
  height: 62px;
  flex: 0 0 auto;
  font-size: 25px;
  font-weight: 900;
  color: var(--black);
  place-items: center;
  border-radius: 19px;
  background: var(--lime);
}

.profile-information {
  display: grid;
  margin: 20px 0 28px;
}

.information-row {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 20px;
  padding: 17px 0;
  border-bottom: 1px solid #edf0eb;
}

.information-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--gray);
}

.information-row strong {
  overflow-wrap: anywhere;
  font-size: 13px;
}

.user-id {
  font-family: Consolas, monospace;
  font-size: 11px !important;
  color: #626a62;
}

.edit-button {
  display: grid;
  width: 100%;
  min-height: 47px;
  font-size: 13px;
  font-weight: 800;
  color: var(--white);
  text-decoration: none;
  place-items: center;
  border: 1px solid var(--black);
  border-radius: 12px;
  background: var(--black);
  transition:
    color 180ms ease,
    border-color 180ms ease,
    background 180ms ease,
    transform 180ms ease;
}

.edit-button:hover {
  color: var(--black);
  border-color: var(--lime);
  background: var(--lime);
  transform: translateY(-2px);
}

.summary-card {
  padding: 25px;
}

.summary-icon {
  display: grid;
  width: 45px;
  height: 45px;
  margin-bottom: 22px;
  font-size: 20px;
  place-items: center;
  border-radius: 13px;
  background: var(--lime-soft);
}

.summary-card strong {
  display: block;
  margin-bottom: 7px;
  font-size: 23px;
}

.summary-card strong.points {
  font-size: 34px;
  color: var(--lime-dark);
}

.summary-card p {
  margin: 0;
  font-size: 12px;
  line-height: 1.55;
  color: var(--gray);
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

@media (max-width: 800px) {
  .welcome-section {
    display: grid;
    align-items: stretch;
  }

  .status-card {
    width: 100%;
  }

  .profile-grid {
    grid-template-columns: 1fr;
  }

  .main-profile-card {
    grid-row: auto;
  }
}

@media (max-width: 520px) {
  .main-content {
    width: min(100% - 28px, 1180px);
    padding: 40px 0;
  }

  .welcome-section h1 {
    font-size: 35px;
  }

  .main-profile-card {
    padding: 23px;
  }

  .information-row {
    grid-template-columns: 1fr;
    gap: 7px;
  }
}
</style>