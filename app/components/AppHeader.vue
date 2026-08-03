<template>
  <header class="navbar">
    <NuxtLink
      to="/"
      class="brand"
      aria-label="Ir a la página principal"
    >
      <span class="brand-icon">⚽</span>

      <div>
        <small>FIFA WORLD CUP</small>
        <strong>Tracker 2026</strong>
      </div>
    </NuxtLink>

    <button
      class="logout-button"
      type="button"
      :disabled="loading"
      @click="emit('logout')"
    >
      {{ loading ? "Cerrando sesión..." : "Cerrar sesión" }}
    </button>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  loading: boolean
}>()

const emit = defineEmits<{
  logout: []
}>()
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 82px;
  padding: 14px max(28px, calc((100% - 1180px) / 2));
  color: #ffffff;
  background: #0b0d0c;
  border-bottom: 3px solid #9dca53;
}

.brand {
  display: flex;
  gap: 12px;
  align-items: center;
  color: inherit;
  text-decoration: none;
}

.brand-icon {
  display: grid;
  width: 46px;
  height: 46px;
  font-size: 22px;
  place-items: center;
  border: 1px solid rgba(157, 202, 83, 0.3);
  border-radius: 14px;
  background: rgba(157, 202, 83, 0.09);
}

.brand small,
.brand strong {
  display: block;
}

.brand small {
  margin-bottom: 2px;
  font-size: 9px;
  font-weight: 900;
  color: #9dca53;
  letter-spacing: 1.5px;
}

.brand strong {
  font-size: 17px;
}

.logout-button {
  min-height: 42px;
  padding: 10px 19px;
  font: inherit;
  font-size: 13px;
  font-weight: 800;
  color: #0b0d0c;
  cursor: pointer;
  border: 1px solid #9dca53;
  border-radius: 11px;
  background: #9dca53;
  transition:
    transform 180ms ease,
    color 180ms ease,
    background 180ms ease;
}

.logout-button:hover:not(:disabled) {
  color: #0b0d0c;
  background: #ffffff;
  transform: translateY(-2px);
}

.logout-button:focus-visible {
  outline: 3px solid rgba(157, 202, 83, 0.35);
  outline-offset: 3px;
}

.logout-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

@media (max-width: 520px) {
  .navbar {
    padding: 13px 18px;
  }

  .brand small {
    display: none;
  }

  .brand strong {
    font-size: 14px;
  }

  .logout-button {
    padding: 9px 13px;
    font-size: 11px;
  }
}
</style>