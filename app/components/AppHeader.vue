<template>
  <header class="site-header">
    <div class="navbar">
      <!-- Marca -->
      <NuxtLink
        to="/"
        class="brand"
        aria-label="Ir a la página principal"
        @click="closeMenus"
      >
        <span class="brand-icon">
          ⚽
        </span>

        <div class="brand-information">
          <small>FIFA WORLD CUP</small>
          <strong>Tracker 2026</strong>
        </div>
      </NuxtLink>

      <!-- Navegación de escritorio -->
      <nav
        class="desktop-navigation"
        aria-label="Navegación principal"
      >
        <NuxtLink
          v-for="item in navigationItems"
          :key="item.to"
          :to="item.to"
          class="navigation-link"
          :class="{
            'active-navigation-link':
              isNavigationItemActive(item)
          }"
          :aria-current="
            isNavigationItemActive(item)
              ? 'page'
              : undefined
          "
          @click="closeMenus"
        >
          <span
            class="navigation-icon"
            aria-hidden="true"
          >
            {{ item.icon }}
          </span>

          <span>
            {{ item.label }}
          </span>
        </NuxtLink>
      </nav>

      <!-- Acciones de escritorio -->
      <div class="desktop-actions">
        <!-- Menú de gestión -->
        <div
          ref="managementMenu"
          class="management-menu"
        >
          <button
            type="button"
            class="management-button"
            :class="{
              'active-management-button':
                isManagementRoute
            }"
            :aria-expanded="managementOpen"
            aria-haspopup="true"
            @click.stop="
              managementOpen =
                !managementOpen
            "
          >
            <span
              class="management-button-icon"
              aria-hidden="true"
            >
              ⚙
            </span>

            <span>Gestionar</span>

            <span
              class="dropdown-arrow"
              :class="{
                'rotated-arrow':
                  managementOpen
              }"
              aria-hidden="true"
            >
              ▾
            </span>
          </button>

          <Transition name="dropdown">
            <div
              v-if="managementOpen"
              class="management-dropdown"
            >
              <div class="dropdown-header">
                <span>Administración</span>

                <strong>
                  Gestionar contenido
                </strong>
              </div>

              <NuxtLink
                v-for="item in managementItems"
                :key="item.to"
                :to="item.to"
                class="management-link"
                :class="{
                  'active-management-link':
                    isRouteActive(item.to)
                }"
                @click="closeMenus"
              >
                <span
                  class="management-link-icon"
                  aria-hidden="true"
                >
                  {{ item.icon }}
                </span>

                <span class="management-link-text">
                  <strong>
                    {{ item.label }}
                  </strong>

                  <small>
                    {{ item.description }}
                  </small>
                </span>

                <span
                  class="management-link-arrow"
                  aria-hidden="true"
                >
                  →
                </span>
              </NuxtLink>
            </div>
          </Transition>
        </div>

        <span
          class="actions-separator"
          aria-hidden="true"
        />

        <button
          class="logout-button"
          type="button"
          :disabled="props.loading"
          @click="handleLogout"
        >
          <span
            class="logout-icon"
            aria-hidden="true"
          >
            ↪
          </span>

          <span>
            {{
              props.loading
                ? "Cerrando..."
                : "Salir"
            }}
          </span>
        </button>
      </div>

      <!-- Botón del menú móvil -->
      <button
        type="button"
        class="mobile-menu-button"
        :class="{
          'mobile-menu-button-open':
            mobileMenuOpen
        }"
        :aria-expanded="mobileMenuOpen"
        aria-label="Abrir menú de navegación"
        @click="
          mobileMenuOpen =
            !mobileMenuOpen
        "
      >
        <span />
        <span />
        <span />
      </button>
    </div>

    <!-- Navegación móvil -->
    <Transition name="mobile-menu">
      <div
        v-if="mobileMenuOpen"
        class="mobile-navigation"
      >
        <div class="mobile-navigation-content">
          <div class="mobile-section">
            <span class="mobile-section-label">
              Navegación
            </span>

            <nav
              class="mobile-links"
              aria-label="Navegación móvil"
            >
              <NuxtLink
                v-for="item in navigationItems"
                :key="item.to"
                :to="item.to"
                class="mobile-link"
                :class="{
                  'active-mobile-link':
                    isNavigationItemActive(
                      item
                    )
                }"
                @click="closeMenus"
              >
                <span
                  class="mobile-link-icon"
                  aria-hidden="true"
                >
                  {{ item.icon }}
                </span>

                <strong>
                  {{ item.label }}
                </strong>

                <span
                  class="mobile-link-arrow"
                  aria-hidden="true"
                >
                  →
                </span>
              </NuxtLink>
            </nav>
          </div>

          <div class="mobile-section">
            <span class="mobile-section-label">
              Administración
            </span>

            <nav
              class="mobile-management-grid"
              aria-label="Administración"
            >
              <NuxtLink
                v-for="item in managementItems"
                :key="item.to"
                :to="item.to"
                class="mobile-management-link"
                :class="{
                  'active-mobile-management-link':
                    isRouteActive(item.to)
                }"
                @click="closeMenus"
              >
                <span aria-hidden="true">
                  {{ item.icon }}
                </span>

                <div>
                  <strong>
                    {{ item.label }}
                  </strong>

                  <small>
                    {{ item.shortDescription }}
                  </small>
                </div>
              </NuxtLink>
            </nav>
          </div>

          <button
            type="button"
            class="mobile-logout-button"
            :disabled="props.loading"
            @click="handleLogout"
          >
            <span aria-hidden="true">
              ↪
            </span>

            {{
              props.loading
                ? "Cerrando sesión..."
                : "Cerrar sesión"
            }}
          </button>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
type NavigationItem = {
  label: string
  to: string
  icon: string
  matchPaths: string[]
}

type ManagementItem = {
  label: string
  to: string
  icon: string
  description: string
  shortDescription: string
}

const props = withDefaults(
  defineProps<{
    loading?: boolean
  }>(),
  {
    loading: false
  }
)

const emit = defineEmits<{
  logout: []
}>()

const route = useRoute()

const managementMenu =
  ref<HTMLElement | null>(null)

const managementOpen = ref(false)
const mobileMenuOpen = ref(false)

const navigationItems:
  NavigationItem[] = [
    {
      label: "Inicio",
      to: "/",
      icon: "⌂",
      matchPaths: ["/"]
    },
    {
      label: "Equipos",
      to: "/teams",
      icon: "◆",
      matchPaths: ["/teams"]
    },
    {
      label: "Jugadores",
      to: "/players",
      icon: "★",
      matchPaths: ["/players"]
    },
    {
      label: "Partidos",
      to: "/matches",
      icon: "⚽",
      matchPaths: ["/matches"]
    },
    {
      label: "Posiciones",
      to: "/standings",
      icon: "▦",
      matchPaths: [
        "/standings",
        "/groups"
      ]
    },
    {
      label: "Bracket",
      to: "/bracket",
      icon: "⌁",
      matchPaths: ["/bracket"]
    },
    {
      label: "Simulación",
      to: "/simulation",
      icon: "◈",
      matchPaths: ["/simulation"]
    }
  ]

const managementItems:
  ManagementItem[] = [
    {
      label: "Gestionar equipos",
      to: "/teams/manage",
      icon: "◆",
      description:
        "Crear, editar y eliminar selecciones.",
      shortDescription:
        "Administrar selecciones"
    },
    {
      label: "Gestionar jugadores",
      to: "/players/manage",
      icon: "★",
      description:
        "Registrar y modificar jugadores.",
      shortDescription:
        "Administrar jugadores"
    },
    {
      label: "Gestionar partidos",
      to: "/matches/manage",
      icon: "⚽",
      description:
        "Crear partidos y registrar resultados.",
      shortDescription:
        "Administrar encuentros"
    }
  ]

const managementPaths =
  managementItems.map(
    item => item.to
  )

const isManagementRoute =
  computed<boolean>(() => {
    return managementPaths.some(
      path => {
        return (
          route.path === path ||
          route.path.startsWith(
            `${path}/`
          )
        )
      }
    )
  })

const isRouteActive = (
  path: string
): boolean => {
  return (
    route.path === path ||
    route.path.startsWith(
      `${path}/`
    )
  )
}

const isNavigationItemActive = (
  item: NavigationItem
): boolean => {
  if (item.to === "/") {
    return route.path === "/"
  }

  /*
   * Cuando se está en una ruta de gestión,
   * únicamente se marca el botón Gestionar.
   */
  if (
    route.path.startsWith(
      `${item.to}/manage`
    )
  ) {
    return false
  }

  return item.matchPaths.some(
    path => {
      return (
        route.path === path ||
        route.path.startsWith(
          `${path}/`
        )
      )
    }
  )
}

const closeMenus = (): void => {
  managementOpen.value = false
  mobileMenuOpen.value = false
}

const handleLogout = (): void => {
  closeMenus()
  emit("logout")
}

const handleDocumentClick = (
  event: MouseEvent
): void => {
  const target =
    event.target as Node | null

  if (
    !target ||
    !managementMenu.value
  ) {
    return
  }

  if (
    !managementMenu.value.contains(
      target
    )
  ) {
    managementOpen.value = false
  }
}

const handleEscapeKey = (
  event: KeyboardEvent
): void => {
  if (event.key === "Escape") {
    closeMenus()
  }
}

watch(
  () => route.fullPath,
  () => {
    closeMenus()
  }
)

onMounted(() => {
  document.addEventListener(
    "click",
    handleDocumentClick
  )

  document.addEventListener(
    "keydown",
    handleEscapeKey
  )
})

onBeforeUnmount(() => {
  document.removeEventListener(
    "click",
    handleDocumentClick
  )

  document.removeEventListener(
    "keydown",
    handleEscapeKey
  )
})
</script>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 1000;

  color: #ffffff;
  border-bottom: 3px solid #9dca53;
  background:
    linear-gradient(
      110deg,
      #080a09 0%,
      #101410 55%,
      #0b0d0c 100%
    );

  box-shadow:
    0 12px 35px
    rgba(0, 0, 0, 0.2);
}

.navbar {
  display: flex;
  gap: 24px;
  align-items: center;

  width:
    min(
      1450px,
      calc(100% - 48px)
    );

  min-height: 82px;
  margin: 0 auto;
}

/* Marca */

.brand {
  display: flex;
  gap: 12px;
  align-items: center;
  flex: 0 0 auto;

  color: inherit;
  text-decoration: none;
}

.brand-icon {
  display: grid;
  width: 47px;
  height: 47px;
  flex: 0 0 auto;

  font-size: 22px;
  place-items: center;

  border:
    1px solid
    rgba(157, 202, 83, 0.34);

  border-radius: 14px;

  background:
    linear-gradient(
      145deg,
      rgba(157, 202, 83, 0.17),
      rgba(157, 202, 83, 0.05)
    );

  box-shadow:
    inset 0 1px
    rgba(255, 255, 255, 0.08);

  transition:
    transform 180ms ease,
    border-color 180ms ease;
}

.brand:hover .brand-icon {
  border-color: #9dca53;
  transform:
    translateY(-2px)
    rotate(-5deg);
}

.brand-information {
  min-width: max-content;
}

.brand small,
.brand strong {
  display: block;
}

.brand small {
  margin-bottom: 2px;

  font-size: 8px;
  font-weight: 900;
  color: #9dca53;

  letter-spacing: 1.6px;
}

.brand strong {
  font-size: 16px;
  letter-spacing: -0.3px;
}

/* Navegación principal */

.desktop-navigation {
  display: flex;
  gap: 3px;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.navigation-link {
  position: relative;

  display: flex;
  gap: 7px;
  align-items: center;

  min-height: 42px;
  padding: 9px 10px;

  font-size: 10px;
  font-weight: 800;
  color: #c7ccc5;

  text-decoration: none;
  white-space: nowrap;

  border:
    1px solid
    transparent;

  border-radius: 10px;

  transition:
    color 160ms ease,
    background 160ms ease,
    border-color 160ms ease,
    transform 160ms ease;
}

.navigation-link:hover {
  color: #ffffff;

  border-color:
    rgba(157, 202, 83, 0.18);

  background:
    rgba(157, 202, 83, 0.08);

  transform: translateY(-1px);
}

.navigation-icon {
  display: grid;
  width: 21px;
  height: 21px;

  font-size: 10px;
  color: #9dca53;

  place-items: center;
  border-radius: 6px;

  background:
    rgba(157, 202, 83, 0.09);
}

.active-navigation-link {
  color: #ffffff;

  border-color:
    rgba(157, 202, 83, 0.28);

  background:
    rgba(157, 202, 83, 0.12);
}

.active-navigation-link::after {
  position: absolute;
  right: 10px;
  bottom: -2px;
  left: 10px;

  height: 2px;

  content: "";

  border-radius: 999px;
  background: #9dca53;
}

.active-navigation-link
.navigation-icon {
  color: #0b0d0c;
  background: #9dca53;
}

/* Acciones */

.desktop-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  flex: 0 0 auto;
}

.actions-separator {
  width: 1px;
  height: 30px;

  background:
    rgba(255, 255, 255, 0.12);
}

/* Menú de gestión */

.management-menu {
  position: relative;
}

.management-button {
  display: flex;
  gap: 7px;
  align-items: center;

  min-height: 42px;
  padding: 9px 11px;

  font: inherit;
  font-size: 10px;
  font-weight: 800;
  color: #d7dbd4;

  cursor: pointer;

  border:
    1px solid
    rgba(255, 255, 255, 0.12);

  border-radius: 10px;

  background:
    rgba(255, 255, 255, 0.04);

  transition:
    color 160ms ease,
    background 160ms ease,
    border-color 160ms ease;
}

.management-button:hover,
.active-management-button {
  color: #ffffff;

  border-color:
    rgba(157, 202, 83, 0.35);

  background:
    rgba(157, 202, 83, 0.1);
}

.management-button-icon {
  color: #9dca53;
  font-size: 13px;
}

.dropdown-arrow {
  font-size: 10px;

  transition:
    transform 180ms ease;
}

.rotated-arrow {
  transform: rotate(180deg);
}

.management-dropdown {
  position: absolute;
  top: calc(100% + 13px);
  right: 0;

  width: 330px;
  padding: 10px;

  color: #171a17;

  border:
    1px solid
    #dce1d9;

  border-radius: 17px;

  background: #ffffff;

  box-shadow:
    0 22px 55px
    rgba(0, 0, 0, 0.24);
}

.management-dropdown::before {
  position: absolute;
  top: -7px;
  right: 35px;

  width: 13px;
  height: 13px;

  content: "";

  border-top:
    1px solid
    #dce1d9;

  border-left:
    1px solid
    #dce1d9;

  background: #ffffff;

  transform: rotate(45deg);
}

.dropdown-header {
  display: grid;
  gap: 3px;

  padding: 11px 12px 14px;
  margin-bottom: 6px;

  border-bottom:
    1px solid
    #e7ebe5;
}

.dropdown-header span {
  font-size: 8px;
  font-weight: 900;
  color: #729c34;

  text-transform: uppercase;
  letter-spacing: 1.2px;
}

.dropdown-header strong {
  font-size: 14px;
}

.management-link {
  display: grid;
  grid-template-columns:
    38px 1fr auto;

  gap: 11px;
  align-items: center;

  padding: 11px;
  margin-top: 4px;

  color: #171a17;
  text-decoration: none;

  border:
    1px solid
    transparent;

  border-radius: 12px;

  transition:
    background 160ms ease,
    border-color 160ms ease,
    transform 160ms ease;
}

.management-link:hover {
  border-color: #d7e7bc;
  background: #f2f8e9;
  transform: translateX(2px);
}

.active-management-link {
  border-color: #c6dda2;
  background: #edf6df;
}

.management-link-icon {
  display: grid;
  width: 38px;
  height: 38px;

  font-size: 14px;
  place-items: center;

  border-radius: 10px;
  background: #edf6df;
}

.management-link-text {
  display: grid;
  gap: 3px;
}

.management-link-text strong {
  font-size: 11px;
}

.management-link-text small {
  font-size: 8px;
  line-height: 1.4;
  color: #747c74;
}

.management-link-arrow {
  font-size: 13px;
  color: #729c34;
}

/* Botón de cerrar sesión */

.logout-button {
  display: flex;
  gap: 7px;
  align-items: center;

  min-height: 42px;
  padding: 9px 13px;

  font: inherit;
  font-size: 10px;
  font-weight: 900;
  color: #0b0d0c;

  cursor: pointer;

  border:
    1px solid
    #9dca53;

  border-radius: 10px;

  background: #9dca53;

  transition:
    color 180ms ease,
    background 180ms ease,
    border-color 180ms ease,
    transform 180ms ease;
}

.logout-button:hover:not(:disabled) {
  color: #0b0d0c;
  border-color: #ffffff;
  background: #ffffff;
  transform: translateY(-2px);
}

.logout-button:focus-visible,
.management-button:focus-visible,
.mobile-menu-button:focus-visible {
  outline:
    3px solid
    rgba(157, 202, 83, 0.35);

  outline-offset: 3px;
}

.logout-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.logout-icon {
  font-size: 13px;
}

/* Botón móvil */

.mobile-menu-button {
  display: none;

  width: 44px;
  height: 42px;
  padding: 10px;

  cursor: pointer;

  border:
    1px solid
    rgba(157, 202, 83, 0.28);

  border-radius: 11px;

  background:
    rgba(157, 202, 83, 0.08);
}

.mobile-menu-button span {
  display: block;
  width: 100%;
  height: 2px;
  margin: 4px 0;

  border-radius: 999px;
  background: #9dca53;

  transition:
    transform 180ms ease,
    opacity 180ms ease;
}

.mobile-menu-button-open
span:nth-child(1) {
  transform:
    translateY(6px)
    rotate(45deg);
}

.mobile-menu-button-open
span:nth-child(2) {
  opacity: 0;
}

.mobile-menu-button-open
span:nth-child(3) {
  transform:
    translateY(-6px)
    rotate(-45deg);
}

/* Menú móvil */

.mobile-navigation {
  display: none;

  border-top:
    1px solid
    rgba(255, 255, 255, 0.08);

  background: #0b0d0c;
}

.mobile-navigation-content {
  width:
    min(
      100% - 32px,
      750px
    );

  padding: 20px 0 24px;
  margin: 0 auto;
}

.mobile-section + .mobile-section {
  margin-top: 22px;
}

.mobile-section-label {
  display: block;

  margin-bottom: 10px;

  font-size: 8px;
  font-weight: 900;
  color: #9dca53;

  text-transform: uppercase;
  letter-spacing: 1.4px;
}

.mobile-links {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap: 8px;
}

.mobile-link {
  display: grid;
  grid-template-columns:
    32px 1fr auto;

  gap: 9px;
  align-items: center;

  min-height: 52px;
  padding: 9px 11px;

  color: #d9ddd6;
  text-decoration: none;

  border:
    1px solid
    rgba(255, 255, 255, 0.09);

  border-radius: 11px;

  background:
    rgba(255, 255, 255, 0.035);
}

.mobile-link-icon {
  display: grid;
  width: 32px;
  height: 32px;

  font-size: 11px;
  color: #9dca53;

  place-items: center;

  border-radius: 8px;

  background:
    rgba(157, 202, 83, 0.1);
}

.mobile-link strong {
  font-size: 10px;
}

.mobile-link-arrow {
  color: #697067;
}

.active-mobile-link {
  color: #ffffff;

  border-color:
    rgba(157, 202, 83, 0.38);

  background:
    rgba(157, 202, 83, 0.12);
}

.active-mobile-link
.mobile-link-icon {
  color: #0b0d0c;
  background: #9dca53;
}

.mobile-management-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));

  gap: 8px;
}

.mobile-management-link {
  display: flex;
  gap: 10px;
  align-items: center;

  min-height: 64px;
  padding: 10px;

  color: #d9ddd6;
  text-decoration: none;

  border:
    1px solid
    rgba(255, 255, 255, 0.09);

  border-radius: 11px;

  background:
    rgba(255, 255, 255, 0.035);
}

.mobile-management-link
> span {
  display: grid;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;

  place-items: center;

  border-radius: 9px;
  background:
    rgba(157, 202, 83, 0.1);
}

.mobile-management-link div {
  display: grid;
  gap: 2px;
}

.mobile-management-link strong {
  font-size: 9px;
}

.mobile-management-link small {
  font-size: 7px;
  color: #929990;
}

.active-mobile-management-link {
  border-color:
    rgba(157, 202, 83, 0.4);

  background:
    rgba(157, 202, 83, 0.12);
}

.mobile-logout-button {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;

  width: 100%;
  min-height: 45px;
  margin-top: 20px;

  font: inherit;
  font-size: 10px;
  font-weight: 900;
  color: #0b0d0c;

  cursor: pointer;

  border:
    1px solid
    #9dca53;

  border-radius: 10px;

  background: #9dca53;
}

.mobile-logout-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* Transiciones */

.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 150ms ease,
    transform 150ms ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-7px);
}

.mobile-menu-enter-active,
.mobile-menu-leave-active {
  overflow: hidden;

  transition:
    opacity 180ms ease,
    max-height 220ms ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  max-height: 0;
  opacity: 0;
}

.mobile-menu-enter-to,
.mobile-menu-leave-from {
  max-height: 700px;
  opacity: 1;
}

/* Responsive */

@media (max-width: 1250px) {
  .navbar {
    width:
      min(
        100% - 36px,
        1450px
      );
  }

  .navigation-link {
    padding: 9px 8px;
  }

  .navigation-icon {
    display: none;
  }
}

@media (max-width: 1080px) {
  .desktop-navigation,
  .desktop-actions {
    display: none;
  }

  .navbar {
    justify-content:
      space-between;
  }

  .mobile-menu-button {
    display: block;
  }

  .mobile-navigation {
    display: block;
  }
}

@media (max-width: 620px) {
  .navbar {
    width: calc(100% - 28px);
    min-height: 74px;
  }

  .brand-icon {
    width: 42px;
    height: 42px;
    font-size: 19px;
  }

  .brand small {
    font-size: 7px;
  }

  .brand strong {
    font-size: 14px;
  }

  .mobile-links {
    grid-template-columns: 1fr;
  }

  .mobile-management-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 380px) {
  .brand small {
    display: none;
  }

  .brand strong {
    font-size: 13px;
  }
}
</style>