<template>
  <main class="login-page">
    <section class="login-container">
      <!-- Panel informativo -->
      <div class="hero-panel">
        <div class="brand">
          <div class="brand-icon">
            <span>⚽</span>
          </div>

          <div>
            <p class="brand-subtitle">
              FIFA WORLD CUP
            </p>

            <h1>Tracker 2026</h1>
          </div>
        </div>

        <div class="hero-content">
          <span class="hero-badge">
            Mundial 2026
          </span>

          <h2>
            Vive cada partido.
            <span>Sigue cada resultado.</span>
          </h2>

          <p class="hero-description">
            Consulta selecciones, partidos, posiciones, estadísticas
            y predicciones desde una sola plataforma.
          </p>

          <div class="features">
            <article class="feature">
              <div class="feature-icon">
                🏆
              </div>

              <div>
                <strong>Predicciones</strong>
                <small>Pronostica marcadores y ganadores</small>
              </div>
            </article>

            <article class="feature">
              <div class="feature-icon">
                📊
              </div>

              <div>
                <strong>Estadísticas</strong>
                <small>Consulta el rendimiento del torneo</small>
              </div>
            </article>

            <article class="feature">
              <div class="feature-icon">
                ⭐
              </div>

              <div>
                <strong>Favoritos</strong>
                <small>Sigue tus equipos y partidos favoritos</small>
              </div>
            </article>
          </div>
        </div>

        <div class="hero-footer">
          <span class="status-dot" />

          <p>
            Estados Unidos · México · Canadá
          </p>
        </div>
      </div>

      <!-- Panel de inicio de sesión -->
      <div class="form-panel">
        <div class="login-card">
          <div class="mobile-brand">
            <div class="mobile-brand-icon">
              ⚽
            </div>

            <div>
              <small>FIFA WORLD CUP</small>
              <strong>Tracker 2026</strong>
            </div>
          </div>

          <div class="form-header">
            <span class="welcome-label">
              Bienvenido
            </span>

            <h2>Inicia sesión</h2>

            <p>
              Accede con tu cuenta de Google para guardar tu perfil,
              predicciones, equipo favorito y puntaje.
            </p>
          </div>

          <button
            class="google-button"
            type="button"
            :disabled="loadingAuth"
            :aria-busy="loadingAuth"
            @click="login"
          >
            <span
              v-if="loadingAuth"
              class="spinner"
              aria-hidden="true"
            />

            <svg
              v-else
              class="google-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill="#4285F4"
                d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z"
              />

              <path
                fill="#34A853"
                d="M12 22c2.7 0 4.97-.9 6.63-2.36l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.05v2.62A10 10 0 0 0 12 22Z"
              />

              <path
                fill="#FBBC05"
                d="M6.39 13.93A6 6 0 0 1 6.08 12c0-.67.12-1.32.31-1.93V7.45H3.05A10 10 0 0 0 2 12c0 1.62.39 3.15 1.05 4.55l3.34-2.62Z"
              />

              <path
                fill="#EA4335"
                d="M12 5.94c1.47 0 2.79.51 3.83 1.5l2.87-2.87A9.65 9.65 0 0 0 12 2a10 10 0 0 0-8.95 5.45l3.34 2.62C7.18 7.7 9.39 5.94 12 5.94Z"
              />
            </svg>

            <span>
              {{
                loadingAuth
                  ? "Iniciando sesión..."
                  : "Continuar con Google"
              }}
            </span>
          </button>

          <div
            v-if="errorAuth"
            class="error-message"
            role="alert"
          >
            <div class="error-icon">
              !
            </div>

            <p>{{ errorAuth }}</p>
          </div>

          <div class="divider">
            <span />
            <p>Acceso seguro</p>
            <span />
          </div>

          <div class="login-information">
            <div class="information-icon">
              ✓
            </div>

            <p>
              Al iniciar sesión por primera vez se creará
              automáticamente tu perfil en la plataforma.
            </p>
          </div>

          <div class="security-message">
            <span class="security-icon">
              🔒
            </span>

            <p>
              Tus datos serán utilizados únicamente dentro del
              seguimiento del torneo.
            </p>
          </div>

          <p class="terms">
            Al continuar, aceptas utilizar esta plataforma con fines
            académicos.
          </p>
        </div>
      </div>
    </section>

    <div class="decoration decoration-one" />
    <div class="decoration decoration-two" />
  </main>
</template>

<script setup lang="ts">
const {
  currentUser,
  loadingAuth,
  errorAuth,
  initAuth,
  login
} = useAuth()

useHead({
  title: "Iniciar sesión | World Cup Tracker 2026",
  meta: [
    {
      name: "description",
      content:
        "Inicia sesión con Google para acceder al World Cup Tracker 2026."
    }
  ]
})

onMounted(() => {
  initAuth()
})

watch(
  currentUser,
  async (user) => {
    if (user) {
      await navigateTo("/")
    }
  },
  {
    immediate: true
  }
)
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.login-page {
  --black: #0b0d0c;
  --black-soft: #131614;
  --black-card: #181c19;
  --lime: #9dca53;
  --lime-dark: #7fae3d;
  --lime-soft: #d9edb5;
  --white: #ffffff;
  --off-white: #f6f7f5;
  --gray-light: #e3e6e1;
  --gray: #8e968f;
  --text-dark: #151815;
  --error: #c33b3b;

  position: relative;
  display: grid;
  min-height: 100vh;
  padding: 32px;
  overflow: hidden;
  font-family:
    Inter,
    Arial,
    Helvetica,
    sans-serif;
  background:
    radial-gradient(
      circle at 10% 15%,
      rgba(157, 202, 83, 0.13),
      transparent 28%
    ),
    radial-gradient(
      circle at 90% 85%,
      rgba(157, 202, 83, 0.1),
      transparent 26%
    ),
    #e9ece7;
}

.login-container {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns:
    minmax(0, 1.08fr)
    minmax(420px, 0.92fr);
  width: min(1180px, 100%);
  min-height: 690px;
  margin: auto;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 30px;
  background: var(--white);
  box-shadow:
    0 32px 90px rgba(15, 18, 15, 0.19);
}

/* Panel izquierdo */

.hero-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 52px;
  overflow: hidden;
  color: var(--white);
  background:
    linear-gradient(
      145deg,
      #080a09 0%,
      #101411 52%,
      #182018 100%
    );
}

.hero-panel::before {
  position: absolute;
  top: -125px;
  right: -120px;
  width: 360px;
  height: 360px;
  content: "";
  border: 1px solid rgba(157, 202, 83, 0.22);
  border-radius: 50%;
}

.hero-panel::after {
  position: absolute;
  right: -95px;
  bottom: -145px;
  width: 360px;
  height: 360px;
  content: "";
  border: 74px solid rgba(157, 202, 83, 0.055);
  border-radius: 50%;
}

.brand {
  position: relative;
  z-index: 2;
  display: flex;
  gap: 14px;
  align-items: center;
}

.brand-icon {
  display: grid;
  width: 56px;
  height: 56px;
  font-size: 27px;
  place-items: center;
  border: 1px solid rgba(157, 202, 83, 0.26);
  border-radius: 17px;
  background: rgba(157, 202, 83, 0.09);
  box-shadow:
    inset 0 0 24px rgba(157, 202, 83, 0.04);
}

.brand-subtitle {
  margin: 0 0 3px;
  font-size: 11px;
  font-weight: 700;
  color: var(--lime);
  letter-spacing: 2.2px;
}

.brand h1 {
  margin: 0;
  font-size: 25px;
  color: var(--white);
}

.hero-content {
  position: relative;
  z-index: 2;
  margin: auto 0;
}

.hero-badge {
  display: inline-flex;
  padding: 8px 15px;
  margin-bottom: 23px;
  font-size: 12px;
  font-weight: 800;
  color: var(--lime-soft);
  text-transform: uppercase;
  letter-spacing: 1px;
  border: 1px solid rgba(157, 202, 83, 0.28);
  border-radius: 999px;
  background: rgba(157, 202, 83, 0.09);
}

.hero-content h2 {
  max-width: 540px;
  margin: 0;
  font-size: clamp(42px, 5vw, 63px);
  line-height: 1.04;
  letter-spacing: -2px;
}

.hero-content h2 span {
  display: block;
  color: var(--lime);
}

.hero-description {
  max-width: 520px;
  margin: 25px 0 35px;
  font-size: 16px;
  line-height: 1.75;
  color: rgba(255, 255, 255, 0.68);
}

.features {
  display: grid;
  gap: 12px;
}

.feature {
  display: flex;
  gap: 14px;
  align-items: center;
  width: min(100%, 410px);
  padding: 14px 16px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.045);
  transition:
    border-color 180ms ease,
    background 180ms ease,
    transform 180ms ease;
}

.feature:hover {
  border-color: rgba(157, 202, 83, 0.25);
  background: rgba(157, 202, 83, 0.07);
  transform: translateX(3px);
}

.feature-icon {
  display: grid;
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  font-size: 19px;
  place-items: center;
  border: 1px solid rgba(157, 202, 83, 0.17);
  border-radius: 12px;
  background: rgba(157, 202, 83, 0.08);
}

.feature strong,
.feature small {
  display: block;
}

.feature strong {
  margin-bottom: 3px;
  font-size: 14px;
  color: var(--white);
}

.feature small {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
}

.hero-footer {
  position: relative;
  z-index: 2;
  display: flex;
  gap: 9px;
  align-items: center;
  margin-top: 25px;
}

.hero-footer p {
  margin: 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.42);
  letter-spacing: 0.7px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--lime);
  box-shadow:
    0 0 10px rgba(157, 202, 83, 0.55);
}

/* Panel derecho */

.form-panel {
  display: grid;
  padding: 60px;
  place-items: center;
  background:
    linear-gradient(
      180deg,
      #ffffff 0%,
      #f7f8f6 100%
    );
}

.login-card {
  width: min(100%, 430px);
}

.mobile-brand {
  display: none;
}

.form-header {
  margin-bottom: 34px;
}

.welcome-label {
  display: inline-block;
  padding: 7px 11px;
  margin-bottom: 15px;
  font-size: 11px;
  font-weight: 900;
  color: #587b26;
  text-transform: uppercase;
  letter-spacing: 1.8px;
  border-radius: 999px;
  background: #eaf4d9;
}

.form-header h2 {
  margin: 0 0 14px;
  font-size: 41px;
  color: var(--text-dark);
  letter-spacing: -1.4px;
}

.form-header p {
  margin: 0;
  font-size: 15px;
  line-height: 1.65;
  color: #687068;
}

.google-button {
  display: flex;
  gap: 13px;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 59px;
  padding: 14px 22px;
  font: inherit;
  font-size: 15px;
  font-weight: 800;
  color: var(--white);
  cursor: pointer;
  border: 1px solid var(--black);
  border-radius: 15px;
  background: var(--black);
  box-shadow:
    0 10px 25px rgba(11, 13, 12, 0.16);
  transition:
    transform 180ms ease,
    background 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.google-button:hover:not(:disabled) {
  color: var(--black);
  border-color: var(--lime);
  background: var(--lime);
  box-shadow:
    0 13px 30px rgba(126, 164, 66, 0.27);
  transform: translateY(-2px);
}

.google-button:active:not(:disabled) {
  transform: translateY(0);
}

.google-button:focus-visible {
  outline: 3px solid rgba(157, 202, 83, 0.32);
  outline-offset: 3px;
}

.google-button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.google-icon {
  width: 23px;
  height: 23px;
  flex: 0 0 auto;
  padding: 2px;
  border-radius: 50%;
  background: var(--white);
}

.spinner {
  width: 22px;
  height: 22px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: var(--lime);
  border-radius: 50%;
  animation: spin 700ms linear infinite;
}

.error-message {
  display: flex;
  gap: 11px;
  align-items: flex-start;
  padding: 14px 15px;
  margin-top: 16px;
  color: #8f2626;
  border: 1px solid #efc1c1;
  border-radius: 13px;
  background: #fff1f1;
}

.error-icon {
  display: grid;
  width: 22px;
  height: 22px;
  flex: 0 0 auto;
  font-size: 13px;
  font-weight: 900;
  color: var(--white);
  place-items: center;
  border-radius: 50%;
  background: var(--error);
}

.error-message p {
  margin: 1px 0 0;
  font-size: 13px;
  line-height: 1.45;
}

.divider {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 12px;
  align-items: center;
  margin: 30px 0;
}

.divider span {
  height: 1px;
  background: #dfe3dd;
}

.divider p {
  margin: 0;
  font-size: 10px;
  font-weight: 800;
  color: #9aa19a;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.login-information {
  display: flex;
  gap: 13px;
  align-items: flex-start;
  padding: 16px;
  border: 1px solid #dce9c8;
  border-radius: 15px;
  background: #f3f8ea;
}

.information-icon {
  display: grid;
  width: 26px;
  height: 26px;
  flex: 0 0 auto;
  font-size: 13px;
  font-weight: 900;
  color: var(--black);
  place-items: center;
  border-radius: 50%;
  background: var(--lime);
}

.login-information p {
  margin: 1px 0 0;
  font-size: 13px;
  line-height: 1.55;
  color: #526045;
}

.security-message {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-top: 17px;
}

.security-icon {
  flex: 0 0 auto;
  font-size: 14px;
}

.security-message p {
  margin: 0;
  font-size: 12px;
  line-height: 1.55;
  color: #899089;
}

.terms {
  margin: 25px 0 0;
  font-size: 11px;
  line-height: 1.55;
  color: #a0a6a0;
  text-align: center;
}

/* Decoraciones */

.decoration {
  position: absolute;
  z-index: 1;
  border-radius: 50%;
}

.decoration-one {
  top: -70px;
  right: 7%;
  width: 170px;
  height: 170px;
  border: 38px solid rgba(157, 202, 83, 0.11);
}

.decoration-two {
  bottom: -90px;
  left: 4%;
  width: 210px;
  height: 210px;
  border: 48px solid rgba(11, 13, 12, 0.055);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */

@media (max-width: 900px) {
  .login-page {
    padding: 22px;
  }

  .login-container {
    grid-template-columns: 1fr;
    width: min(560px, 100%);
    min-height: auto;
  }

  .hero-panel {
    display: none;
  }

  .form-panel {
    min-height: 680px;
    padding: 50px 42px;
  }

  .mobile-brand {
    display: flex;
    gap: 11px;
    align-items: center;
    margin-bottom: 55px;
  }

  .mobile-brand-icon {
    display: grid;
    width: 44px;
    height: 44px;
    font-size: 21px;
    place-items: center;
    border-radius: 13px;
    background: var(--black);
  }

  .mobile-brand small,
  .mobile-brand strong {
    display: block;
  }

  .mobile-brand small {
    margin-bottom: 2px;
    font-size: 9px;
    font-weight: 900;
    color: var(--lime-dark);
    letter-spacing: 1.5px;
  }

  .mobile-brand strong {
    font-size: 15px;
    color: var(--black);
  }
}

@media (max-width: 520px) {
  .login-page {
    padding: 0;
    background: var(--white);
  }

  .login-container {
    min-height: 100vh;
    border: 0;
    border-radius: 0;
    box-shadow: none;
  }

  .form-panel {
    min-height: 100vh;
    padding: 35px 24px;
  }

  .mobile-brand {
    margin-bottom: 50px;
  }

  .form-header h2 {
    font-size: 35px;
  }

  .form-header p {
    font-size: 14px;
  }

  .divider p {
    font-size: 9px;
  }
}
</style>