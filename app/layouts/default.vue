<template>
  <div class="layout-container">
    <!-- Navbar / Sidebar -->
    <header class="glass topbar">
      <div class="logo">
        <span class="text-gradient">WC Tracker '26</span>
      </div>
      <nav class="nav-links">
        <NuxtLink to="/" class="nav-link">Inicio</NuxtLink>
        <NuxtLink to="/teams" class="nav-link">Equipos</NuxtLink>
        <NuxtLink to="/perfil" class="nav-link">Perfil</NuxtLink>
      </nav>
      <div class="user-actions">
        <!-- Placeholder for user auth -->
        <button class="btn btn-secondary">Login</button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content container animate-fade-in">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.layout-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  margin: 16px 24px;
  position: sticky;
  top: 16px;
  z-index: 50;
}

.logo {
  font-size: 1.5rem;
  font-weight: 800;
}

.nav-links {
  display: flex;
  gap: 24px;
}

.nav-link {
  font-weight: 600;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.nav-link:hover, .nav-link.router-link-active {
  color: var(--text-primary);
}

.main-content {
  flex: 1;
  padding-top: 32px;
  padding-bottom: 64px;
}
</style>
