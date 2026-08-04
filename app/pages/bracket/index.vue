<template>
  <div class="page-wrapper">
    <AppHeader
      :loading="
        loadingAuth ||
        loading ||
        savingResult
      "
      @logout="logout"
    />

    <main class="bracket-page">
      <section class="main-content">
        <NuxtLink
          to="/standings"
          class="back-link"
        >
          ← Volver a posiciones
        </NuxtLink>

        <header class="page-header">
          <div>
            <span class="page-label">
              Fase eliminatoria
            </span>

            <h1>Bracket del Mundial</h1>

            <p>
              Consulta los cruces desde dieciseisavos hasta
              la final y registra los resultados para avanzar
              automáticamente a cada selección.
            </p>
          </div>

          <div class="header-actions">
            <button
              type="button"
              class="secondary-button"
              :disabled="loading"
              @click="loadPage"
            >
              Recargar
            </button>

            <button
              v-if="bracketExists"
              type="button"
              class="danger-button"
              :disabled="loading"
              @click="resetTournamentBracket"
            >
              Reiniciar bracket
            </button>

            <button
              v-else
              type="button"
              class="generate-button"
              :disabled="
                loading ||
                !qualificationSummary
                  .isReadyForBracket
              "
              @click="generateTournamentBracket"
            >
              {{
                loading
                  ? "Generando..."
                  : "Generar bracket"
              }}
            </button>
          </div>
        </header>

        <div
          v-if="pageMessage"
          class="message success-message"
          role="status"
        >
          <span>✓</span>

          <p>
            {{ pageMessage }}
          </p>
        </div>

        <div
          v-if="pageError || error"
          class="message error-message"
          role="alert"
        >
          <span>!</span>

          <p>
            {{ pageError || error }}
          </p>
        </div>

        <!-- Estado de la clasificación -->
        <section
          v-if="!bracketExists"
          class="qualification-card"
        >
          <div class="qualification-header">
            <div>
              <span class="section-label">
                Estado de la clasificación
              </span>

              <h2>
                {{
                  qualificationSummary
                    .isReadyForBracket
                    ? "Todo está listo"
                    : "El bracket todavía está bloqueado"
                }}
              </h2>

              <p>
                {{
                  qualificationSummary
                    .isReadyForBracket
                    ? "Ya existen 32 selecciones clasificadas y los 12 grupos están terminados."
                    : "Primero deben terminarse los 12 grupos y obtenerse los 32 clasificados."
                }}
              </p>
            </div>

            <div
              class="status-circle"
              :class="{
                'ready-circle':
                  qualificationSummary
                    .isReadyForBracket
              }"
            >
              {{
                qualificationSummary
                  .isReadyForBracket
                  ? "✓"
                  : "!"
              }}
            </div>
          </div>

          <div class="summary-grid">
            <article class="summary-item">
              <span>
                Grupos registrados
              </span>

              <strong>
                {{
                  qualificationSummary
                    .groupsWithStandings
                }}/12
              </strong>
            </article>

            <article class="summary-item">
              <span>
                Grupos terminados
              </span>

              <strong>
                {{
                  qualificationSummary
                    .completedGroups
                }}/12
              </strong>
            </article>

            <article class="summary-item">
              <span>
                Primeros y segundos
              </span>

              <strong>
                {{
                  qualificationSummary
                    .directQualifiers
                }}/24
              </strong>
            </article>

            <article class="summary-item featured-item">
              <span>
                Clasificados totales
              </span>

              <strong>
                {{
                  qualificationSummary
                    .totalQualified
                }}/32
              </strong>
            </article>
          </div>

          <div class="qualification-help">
            <strong>
              ¿Por qué no se puede generar todavía?
            </strong>

            <p>
              Primero deben terminarse los doce grupos y
              existir exactamente treinta y dos selecciones
              clasificadas para construir los cruces.
            </p>
          </div>
        </section>

        <!-- Campeón -->
        <section
          v-if="champion"
          class="champion-card"
        >
          <span class="champion-icon">
            🏆
          </span>

          <div>
            <span>
              Campeón del torneo
            </span>

            <h2>
              {{ champion }}
            </h2>
          </div>
        </section>

        <!-- Editor de resultados -->
        <section
          v-if="selectedMatch"
          class="result-editor"
        >
          <div class="result-editor-header">
            <div>
              <span class="section-label">
                Registrar resultado
              </span>

              <h2>
                {{ selectedMatch.bracketCode }}
              </h2>

              <p>
                {{ selectedMatch.stage }}
              </p>
            </div>

            <button
              type="button"
              class="close-button"
              :disabled="savingResult"
              aria-label="Cerrar editor de resultado"
              @click="closeResultEditor"
            >
              ×
            </button>
          </div>

          <div class="result-teams">
            <div class="result-team">
              <span>
                Local
              </span>

              <strong>
                {{ selectedMatch.homeTeam }}
              </strong>

              <input
                v-model.number="
                  resultForm.homeScore
                "
                type="number"
                min="0"
                :disabled="savingResult"
                aria-label="Goles del equipo local"
              >
            </div>

            <div class="result-versus">
              VS
            </div>

            <div class="result-team">
              <span>
                Visitante
              </span>

              <strong>
                {{ selectedMatch.awayTeam }}
              </strong>

              <input
                v-model.number="
                  resultForm.awayScore
                "
                type="number"
                min="0"
                :disabled="savingResult"
                aria-label="Goles del equipo visitante"
              >
            </div>
          </div>

          <div
            v-if="showPenaltyInputs"
            class="penalties-section"
          >
            <div>
              <span>
                Penales local
              </span>

              <input
                v-model.number="
                  resultForm.homePenaltyScore
                "
                type="number"
                min="0"
                :disabled="savingResult"
                aria-label="Penales del equipo local"
              >
            </div>

            <strong>
              Penales
            </strong>

            <div>
              <span>
                Penales visitante
              </span>

              <input
                v-model.number="
                  resultForm.awayPenaltyScore
                "
                type="number"
                min="0"
                :disabled="savingResult"
                aria-label="Penales del equipo visitante"
              >
            </div>
          </div>

          <p
            v-if="showPenaltyInputs"
            class="penalty-help"
          >
            Como el partido terminó empatado, debes indicar
            el resultado de la tanda de penales.
          </p>

          <div class="result-actions">
            <button
              type="button"
              class="secondary-button"
              :disabled="savingResult"
              @click="closeResultEditor"
            >
              Cancelar
            </button>

            <button
              type="button"
              class="generate-button"
              :disabled="savingResult"
              @click="saveSelectedResult"
            >
              {{
                savingResult
                  ? "Guardando..."
                  : "Guardar resultado"
              }}
            </button>
          </div>
        </section>

        <!-- Bracket -->
        <section
          v-if="bracketExists"
          class="bracket-section"
        >
          <div class="bracket-heading">
            <div>
              <span class="section-label">
                Cruces eliminatorios
              </span>

              <h2>
                Camino hacia la final
              </h2>

              <p>
                Los ganadores avanzan automáticamente a la
                siguiente ronda.
              </p>
            </div>

            <span class="match-counter">
              {{ bracketMatches.length }}
              partidos
            </span>
          </div>

          <!-- Navegación horizontal -->
          <div class="bracket-navigation">
            <div class="navigation-information">
              <span class="navigation-label">
                Navegación del bracket
              </span>

              <strong>
                Recorre las rondas sin bajar hasta la barra
                inferior
              </strong>
            </div>

            <div class="navigation-actions">
              <button
                type="button"
                class="edge-navigation-button"
                :disabled="
                  loading ||
                  !canScrollLeft
                "
                aria-label="Ir al inicio del bracket"
                @click="goToBracketEdge('start')"
              >
                Inicio
              </button>

              <button
                type="button"
                class="navigation-button"
                :disabled="
                  loading ||
                  !canScrollLeft
                "
                aria-label="Mover bracket hacia la izquierda"
                @click="moveBracket('left')"
              >
                ← Anterior
              </button>

              <button
                type="button"
                class="navigation-button"
                :disabled="
                  loading ||
                  !canScrollRight
                "
                aria-label="Mover bracket hacia la derecha"
                @click="moveBracket('right')"
              >
                Siguiente →
              </button>

              <button
                type="button"
                class="edge-navigation-button"
                :disabled="
                  loading ||
                  !canScrollRight
                "
                aria-label="Ir al final del bracket"
                @click="goToBracketEdge('end')"
              >
                Final
              </button>
            </div>
          </div>

          <div
            ref="bracketScroll"
            class="bracket-scroll"
            @scroll="updateBracketNavigation"
          >
            <div class="bracket-board">
              <section
                v-for="column in stageColumns"
                :key="column.stage"
                class="stage-column"
              >
                <header class="stage-header">
                  <span>
                    {{
                      getStageShortLabel(
                        column.stage
                      )
                    }}
                  </span>

                  <h3>
                    {{ column.stage }}
                  </h3>

                  <small>
                    {{ column.matches.length }}
                    {{
                      column.matches.length === 1
                        ? "partido"
                        : "partidos"
                    }}
                  </small>
                </header>

                <div class="stage-matches">
                  <article
                    v-for="match in column.matches"
                    :key="match.id"
                    class="bracket-match"
                    :class="{
                      'finished-match':
                        match.status ===
                        'Finalizado'
                    }"
                  >
                    <div class="match-top">
                      <span>
                        {{ match.bracketCode }}
                      </span>

                      <small>
                        {{ match.status }}
                      </small>
                    </div>

                    <div class="bracket-team">
                      <div>
                        <strong>
                          {{
                            match.homeTeam ||
                            match.homeSource
                          }}
                        </strong>

                        <small
                          v-if="match.homeTeam"
                        >
                          {{ match.homeSource }}
                        </small>
                      </div>

                      <span class="score">
                        {{
                          match.status ===
                          "Finalizado"
                            ? match.homeScore
                            : "-"
                        }}
                      </span>
                    </div>

                    <div class="bracket-team">
                      <div>
                        <strong>
                          {{
                            match.awayTeam ||
                            match.awaySource
                          }}
                        </strong>

                        <small
                          v-if="match.awayTeam"
                        >
                          {{ match.awaySource }}
                        </small>
                      </div>

                      <span class="score">
                        {{
                          match.status ===
                          "Finalizado"
                            ? match.awayScore
                            : "-"
                        }}
                      </span>
                    </div>

                    <div
                      v-if="
                        match.homePenaltyScore !==
                          null &&
                        match.awayPenaltyScore !==
                          null
                      "
                      class="penalty-result"
                    >
                      Penales:
                      {{ match.homePenaltyScore }}
                      -
                      {{ match.awayPenaltyScore }}
                    </div>

                    <div
                      v-if="
                        match.status ===
                        'Finalizado'
                      "
                      class="winner-box"
                    >
                      <span>
                        Ganador
                      </span>

                      <strong>
                        {{ match.winnerTeam }}
                      </strong>
                    </div>

                    <p class="match-kickoff">
                      {{
                        formatKickoff(
                          match.kickoff
                        )
                      }}
                    </p>

                    <div class="match-actions">
                      <button
                        v-if="
                          match.homeTeamId &&
                          match.awayTeamId
                        "
                        type="button"
                        class="edit-result-button"
                        :disabled="
                          loading ||
                          savingResult
                        "
                        @click="
                          openResultEditor(
                            match
                          )
                        "
                      >
                        {{
                          match.status ===
                          "Finalizado"
                            ? "Editar resultado"
                            : "Registrar resultado"
                        }}
                      </button>

                      <button
                        v-if="
                          match.status ===
                          'Finalizado'
                        "
                        type="button"
                        class="clear-result-button"
                        :disabled="
                          loading ||
                          savingResult
                        "
                        @click="
                          removeMatchResult(
                            match
                          )
                        "
                      >
                        Limpiar
                      </button>
                    </div>

                    <p
                      v-if="
                        !match.homeTeamId ||
                        !match.awayTeamId
                      "
                      class="waiting-message"
                    >
                      Esperando selecciones de la ronda
                      anterior.
                    </p>
                  </article>
                </div>
              </section>
            </div>
          </div>

          <p class="scroll-help">
            También puedes usar Shift + rueda del mouse o la
            barra inferior para desplazarte horizontalmente.
          </p>
        </section>

        <section
          v-else-if="loading"
          class="state-card"
        >
          <span class="spinner" />

          <h2>
            Cargando bracket
          </h2>

          <p>
            Consultando los partidos eliminatorios.
          </p>
        </section>
      </section>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import {
  useAuth
} from "../../composables/useAuth"

import {
  BRACKET_STAGES,
  useBracket,
  type BracketMatch,
  type BracketStage
} from "../../composables/useBracket"

import {
  useStandings
} from "../../composables/useStandings"

type ResultForm = {
  homeScore: number
  awayScore: number
  homePenaltyScore: number
  awayPenaltyScore: number
}

type BracketDirection =
  | "left"
  | "right"

type BracketEdge =
  | "start"
  | "end"

const {
  currentUser,
  loadingAuth,
  initAuth,
  logout
} = useAuth()

const {
  qualificationSummary,
  fetchAllStandings
} = useStandings()

const {
  bracketMatches,
  bracketByStage,
  bracketExists,
  champion,

  loading,
  error,

  fetchBracketMatches,
  generateBracket,
  saveBracketResult,
  clearBracketResult,
  resetBracket
} = useBracket()

const selectedMatchId =
  ref<string | null>(null)

const bracketScroll =
  ref<HTMLElement | null>(null)

const canScrollLeft = ref(false)
const canScrollRight = ref(false)

const savingResult = ref(false)
const pageError = ref("")
const pageMessage = ref("")

const resultForm = reactive<ResultForm>({
  homeScore: 0,
  awayScore: 0,
  homePenaltyScore: 0,
  awayPenaltyScore: 0
})

const selectedMatch =
  computed<BracketMatch | null>(() => {
    if (!selectedMatchId.value) {
      return null
    }

    return (
      bracketMatches.value.find(
        match => {
          return (
            match.id ===
            selectedMatchId.value
          )
        }
      ) ?? null
    )
  })

const showPenaltyInputs =
  computed<boolean>(() => {
    return (
      resultForm.homeScore ===
      resultForm.awayScore
    )
  })

const stageColumns = computed(() => {
  return BRACKET_STAGES.map(
    stage => {
      return {
        stage,

        matches:
          bracketByStage.value[
            stage
          ]
      }
    }
  )
})

const updateBracketNavigation =
  (): void => {
    const container =
      bracketScroll.value

    if (!container) {
      canScrollLeft.value = false
      canScrollRight.value = false
      return
    }

    const tolerance = 3

    canScrollLeft.value =
      container.scrollLeft >
      tolerance

    canScrollRight.value =
      container.scrollLeft +
      container.clientWidth <
      container.scrollWidth -
      tolerance
  }

const moveBracket = (
  direction: BracketDirection
): void => {
  const container =
    bracketScroll.value

  if (!container) {
    return
  }

  const movement =
    Math.max(
      300,
      container.clientWidth * 0.75
    )

  container.scrollBy({
    left:
      direction === "right"
        ? movement
        : -movement,

    behavior: "smooth"
  })

  window.setTimeout(
    updateBracketNavigation,
    450
  )
}

const goToBracketEdge = (
  edge: BracketEdge
): void => {
  const container =
    bracketScroll.value

  if (!container) {
    return
  }

  container.scrollTo({
    left:
      edge === "start"
        ? 0
        : container.scrollWidth,

    behavior: "smooth"
  })

  window.setTimeout(
    updateBracketNavigation,
    450
  )
}

const loadPage =
  async (): Promise<void> => {
    pageError.value = ""
    pageMessage.value = ""

    try {
      await Promise.all([
        fetchAllStandings(),
        fetchBracketMatches()
      ])

      await nextTick()

      updateBracketNavigation()
    } catch (caughtError) {
      pageError.value =
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudo cargar el bracket."

      console.error(
        "[bracket/index] loadPage:",
        caughtError
      )
    }
  }

const generateTournamentBracket =
  async (): Promise<void> => {
    pageError.value = ""
    pageMessage.value = ""

    try {
      await generateBracket()

      pageMessage.value =
        "El bracket fue generado correctamente."

      await nextTick()

      updateBracketNavigation()
    } catch (caughtError) {
      pageError.value =
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudo generar el bracket."
    }
  }

const resetTournamentBracket =
  async (): Promise<void> => {
    const confirmed = window.confirm(
      "¿Deseas eliminar todos los partidos del bracket? Los partidos de fase de grupos no se eliminarán."
    )

    if (!confirmed) {
      return
    }

    pageError.value = ""
    pageMessage.value = ""

    try {
      await resetBracket()

      selectedMatchId.value = null

      pageMessage.value =
        "El bracket fue reiniciado correctamente."

      await nextTick()

      updateBracketNavigation()
    } catch (caughtError) {
      pageError.value =
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudo reiniciar el bracket."
    }
  }

const openResultEditor = (
  match: BracketMatch
): void => {
  pageError.value = ""
  pageMessage.value = ""

  if (
    !match.homeTeamId ||
    !match.awayTeamId
  ) {
    pageError.value =
      "El partido todavía no tiene las dos selecciones asignadas."

    return
  }

  selectedMatchId.value = match.id

  resultForm.homeScore =
    match.homeScore

  resultForm.awayScore =
    match.awayScore

  resultForm.homePenaltyScore =
    match.homePenaltyScore ?? 0

  resultForm.awayPenaltyScore =
    match.awayPenaltyScore ?? 0

  nextTick(() => {
    window.scrollTo({
      top: 250,
      behavior: "smooth"
    })
  })
}

const closeResultEditor = (): void => {
  selectedMatchId.value = null

  Object.assign(
    resultForm,
    {
      homeScore: 0,
      awayScore: 0,
      homePenaltyScore: 0,
      awayPenaltyScore: 0
    }
  )
}

const saveSelectedResult =
  async (): Promise<void> => {
    if (!selectedMatch.value) {
      return
    }

    savingResult.value = true
    pageError.value = ""
    pageMessage.value = ""

    try {
      await saveBracketResult(
        selectedMatch.value.id,
        {
          homeScore:
            Number(
              resultForm.homeScore
            ),

          awayScore:
            Number(
              resultForm.awayScore
            ),

          homePenaltyScore:
            showPenaltyInputs.value
              ? Number(
                  resultForm
                    .homePenaltyScore
                )
              : null,

          awayPenaltyScore:
            showPenaltyInputs.value
              ? Number(
                  resultForm
                    .awayPenaltyScore
                )
              : null
        }
      )

      pageMessage.value =
        "El resultado fue guardado y el ganador avanzó automáticamente."

      closeResultEditor()
    } catch (caughtError) {
      pageError.value =
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudo guardar el resultado."
    } finally {
      savingResult.value = false
    }
  }

const removeMatchResult =
  async (
    match: BracketMatch
  ): Promise<void> => {
    const confirmed = window.confirm(
      `¿Deseas limpiar el resultado de ${match.bracketCode}?`
    )

    if (!confirmed) {
      return
    }

    savingResult.value = true
    pageError.value = ""
    pageMessage.value = ""

    try {
      await clearBracketResult(
        match.id
      )

      if (
        selectedMatchId.value ===
        match.id
      ) {
        closeResultEditor()
      }

      pageMessage.value =
        "El resultado fue eliminado correctamente."
    } catch (caughtError) {
      pageError.value =
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudo limpiar el resultado."
    } finally {
      savingResult.value = false
    }
  }

const getStageShortLabel = (
  stage: BracketStage
): string => {
  const labels: Record<
    BracketStage,
    string
  > = {
    Dieciseisavos: "R32",
    Octavos: "R16",
    Cuartos: "QF",
    Semifinal: "SF",
    "Tercer lugar": "3.º",
    Final: "Final"
  }

  return labels[stage]
}

const getKickoffDate = (
  kickoff: unknown
): Date | null => {
  if (
    typeof kickoff === "object" &&
    kickoff !== null &&
    "toDate" in kickoff
  ) {
    const value = kickoff as {
      toDate?: () => Date
    }

    if (
      typeof value.toDate ===
      "function"
    ) {
      return value.toDate()
    }
  }

  if (kickoff instanceof Date) {
    return kickoff
  }

  return null
}

const formatKickoff = (
  kickoff: unknown
): string => {
  const date =
    getKickoffDate(kickoff)

  if (!date) {
    return "Fecha por definir"
  }

  return new Intl.DateTimeFormat(
    "es-CR",
    {
      dateStyle: "medium",
      timeStyle: "short"
    }
  ).format(date)
}

watch(
  [loadingAuth, currentUser],
  async ([authLoading, user]) => {
    if (!authLoading && !user) {
      await navigateTo("/login")
    }
  }
)

watch(
  () => bracketMatches.value.length,
  async () => {
    await nextTick()

    updateBracketNavigation()
  }
)

useHead({
  title:
    "Bracket | World Cup Tracker 2026",

  meta: [
    {
      name: "description",

      content:
        "Consulta y administra el bracket de la fase eliminatoria."
    }
  ]
})

onMounted(async () => {
  initAuth()

  await loadPage()

  window.addEventListener(
    "resize",
    updateBracketNavigation
  )
})

onBeforeUnmount(() => {
  window.removeEventListener(
    "resize",
    updateBracketNavigation
  )
})
</script>

<style scoped>
.page-wrapper {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  background: #eef1ec;
}

.bracket-page {
  --black: #0b0d0c;
  --lime: #9dca53;
  --lime-dark: #729c34;
  --lime-soft: #edf6df;
  --white: #ffffff;
  --border: #dce1d9;
  --gray: #747c74;
  --text: #171a17;

  flex: 1;
  color: var(--text);

  background:
    radial-gradient(
      circle at 8% 8%,
      rgba(157, 202, 83, 0.13),
      transparent 24%
    ),
    #eef1ec;
}

.main-content {
  width: min(1450px, calc(100% - 48px));
  margin: 0 auto;
  padding: 45px 0 75px;
}

.back-link {
  display: inline-flex;
  margin-bottom: 30px;
  font-size: 12px;
  font-weight: 800;
  color: var(--lime-dark);
  text-decoration: none;
}

.page-header {
  display: flex;
  gap: 35px;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 28px;
}

.page-label,
.section-label {
  display: block;
  margin-bottom: 8px;
  font-size: 9px;
  font-weight: 900;
  color: var(--lime-dark);
  text-transform: uppercase;
  letter-spacing: 1.4px;
}

.page-header h1 {
  margin: 0 0 12px;
  font-size: clamp(40px, 6vw, 62px);
  line-height: 1;
  letter-spacing: -3px;
}

.page-header p {
  max-width: 720px;
  margin: 0;
  color: var(--gray);
  line-height: 1.6;
}

.header-actions,
.result-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.header-actions button,
.result-actions button {
  min-height: 45px;
  padding: 11px 16px;
  font: inherit;
  font-size: 11px;
  font-weight: 900;
  cursor: pointer;
  border-radius: 11px;
}

.generate-button {
  color: var(--black);
  border: 1px solid var(--lime);
  background: var(--lime);
}

.generate-button:hover:not(:disabled) {
  color: var(--white);
  border-color: var(--black);
  background: var(--black);
}

.secondary-button {
  color: var(--text);
  border: 1px solid var(--border);
  background: var(--white);
}

.danger-button {
  color: #922f2f;
  border: 1px solid #efc5c5;
  background: #fff0f0;
}

.header-actions button:disabled,
.result-actions button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.message {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 14px 16px;
  margin-bottom: 18px;
  border-radius: 12px;
}

.message span {
  display: grid;
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
  font-size: 11px;
  font-weight: 900;
  place-items: center;
  border-radius: 50%;
}

.message p {
  margin: 0;
  font-size: 12px;
}

.success-message {
  color: #486426;
  border: 1px solid #cee2ad;
  background: #f0f7e5;
}

.success-message span {
  color: var(--black);
  background: var(--lime);
}

.error-message {
  color: #842e2e;
  border: 1px solid #efc4c4;
  background: #fff1f1;
}

.error-message span {
  color: var(--white);
  background: #b83a3a;
}

.qualification-card,
.result-editor,
.bracket-section,
.champion-card {
  padding: 28px;
  margin-bottom: 24px;
  border: 1px solid var(--border);
  border-radius: 22px;
  background: var(--white);
  box-shadow: 0 14px 38px rgba(20, 25, 20, 0.06);
}

.qualification-header,
.result-editor-header,
.bracket-heading {
  display: flex;
  gap: 25px;
  align-items: flex-start;
  justify-content: space-between;
}

.qualification-header {
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border);
}

.qualification-header h2,
.result-editor-header h2,
.bracket-heading h2 {
  margin: 0 0 8px;
  font-size: 27px;
}

.qualification-header p,
.result-editor-header p,
.bracket-heading p {
  max-width: 690px;
  margin: 0;
  font-size: 12px;
  line-height: 1.55;
  color: var(--gray);
}

.status-circle {
  display: grid;
  width: 48px;
  height: 48px;
  flex: 0 0 auto;
  font-size: 18px;
  font-weight: 900;
  color: var(--white);
  place-items: center;
  border-radius: 50%;
  background: #b48d27;
}

.ready-circle {
  color: var(--black);
  background: var(--lime);
}

.summary-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 15px;
  margin: 24px 0;
}

.summary-item {
  display: grid;
  min-height: 115px;
  padding: 18px;
  align-content: space-between;
  border: 1px solid var(--border);
  border-radius: 15px;
  background: #f9faf8;
}

.summary-item span {
  font-size: 9px;
  font-weight: 900;
  color: var(--gray);
  text-transform: uppercase;
}

.summary-item strong {
  font-size: 27px;
}

.featured-item {
  color: var(--white);
  border-color: var(--black);
  background: var(--black);
}

.featured-item span {
  color: var(--lime);
}

.qualification-help {
  padding: 17px;
  color: #705817;
  border: 1px solid #e8cf83;
  border-radius: 13px;
  background: #fff8df;
}

.qualification-help strong {
  font-size: 12px;
}

.qualification-help p {
  margin: 5px 0 0;
  font-size: 11px;
  line-height: 1.5;
}

.champion-card {
  display: flex;
  gap: 18px;
  align-items: center;
  color: var(--white);
  border-color: var(--black);
  background: var(--black);
}

.champion-icon {
  display: grid;
  width: 65px;
  height: 65px;
  flex: 0 0 auto;
  font-size: 34px;
  place-items: center;
  border-radius: 18px;
  background: var(--lime);
}

.champion-card span {
  font-size: 9px;
  font-weight: 900;
  color: var(--lime);
  text-transform: uppercase;
  letter-spacing: 1.3px;
}

.champion-card h2 {
  margin: 4px 0 0;
  font-size: 31px;
}

.close-button {
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  font-size: 22px;
  cursor: pointer;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: #f4f5f3;
}

.result-teams {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    auto
    minmax(0, 1fr);
  gap: 20px;
  align-items: center;
  margin: 28px 0;
}

.result-team {
  display: grid;
  gap: 10px;
  text-align: center;
}

.result-team > span,
.penalties-section span {
  font-size: 9px;
  font-weight: 900;
  color: var(--gray);
  text-transform: uppercase;
}

.result-team strong {
  font-size: 19px;
}

.result-team input,
.penalties-section input {
  width: 90px;
  min-height: 55px;
  margin: auto;
  font: inherit;
  font-size: 23px;
  font-weight: 900;
  text-align: center;
  border: 1px solid #d4dad1;
  border-radius: 12px;
}

.result-team input:focus,
.penalties-section input:focus {
  border-color: var(--lime-dark);
  outline: none;
  box-shadow:
    0 0 0 4px
    rgba(157, 202, 83, 0.18);
}

.result-versus {
  font-size: 13px;
  font-weight: 900;
  color: var(--gray);
}

.penalties-section {
  display: grid;
  grid-template-columns:
    1fr auto 1fr;
  gap: 20px;
  align-items: center;
  padding: 20px;
  border-radius: 15px;
  background: var(--lime-soft);
}

.penalties-section > div {
  display: grid;
  gap: 8px;
  text-align: center;
}

.penalty-help {
  margin: 10px 0 0;
  font-size: 10px;
  color: var(--gray);
  text-align: center;
}

.result-actions {
  justify-content: flex-end;
  margin-top: 22px;
}

.bracket-heading {
  padding-bottom: 22px;
  margin-bottom: 18px;
  border-bottom: 1px solid var(--border);
}

.match-counter {
  padding: 8px 12px;
  font-size: 9px;
  font-weight: 900;
  color: #4c6a25;
  border-radius: 999px;
  background: var(--lime-soft);
}

/* Navegación horizontal superior */
.bracket-navigation {
  position: sticky;
  top: 12px;
  z-index: 20;

  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: space-between;

  padding: 13px 14px;
  margin-bottom: 15px;

  border: 1px solid var(--border);
  border-radius: 14px;

  background:
    rgba(255, 255, 255, 0.96);

  box-shadow:
    0 9px 24px
    rgba(20, 25, 20, 0.11);

  backdrop-filter: blur(10px);
}

.navigation-information {
  display: grid;
  gap: 3px;
}

.navigation-label {
  font-size: 8px;
  font-weight: 900;
  color: var(--lime-dark);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.navigation-information strong {
  font-size: 10px;
  color: var(--gray);
}

.navigation-actions {
  display: flex;
  gap: 8px;
  flex: 0 0 auto;
}

.navigation-actions button {
  min-height: 38px;
  padding: 8px 13px;
  font: inherit;
  font-size: 9px;
  font-weight: 900;
  cursor: pointer;
  border-radius: 9px;
  transition:
    color 160ms ease,
    background 160ms ease,
    border-color 160ms ease,
    transform 160ms ease;
}

.navigation-button {
  color: var(--white);
  border: 1px solid var(--black);
  background: var(--black);
}

.navigation-button:hover:not(:disabled) {
  color: var(--black);
  border-color: var(--lime);
  background: var(--lime);
  transform: translateY(-1px);
}

.edge-navigation-button {
  color: var(--text);
  border: 1px solid var(--border);
  background: #f4f6f2;
}

.edge-navigation-button:hover:not(:disabled) {
  border-color: var(--lime-dark);
  background: var(--lime-soft);
}

.navigation-actions button:disabled {
  cursor: not-allowed;
  opacity: 0.38;
}

.bracket-scroll {
  overflow-x: auto;
  overscroll-behavior-inline: contain;
  padding: 4px 2px 16px;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color:
    var(--lime-dark)
    #e2e5e0;
}

.bracket-scroll::-webkit-scrollbar {
  height: 10px;
}

.bracket-scroll::-webkit-scrollbar-track {
  border-radius: 999px;
  background: #e2e5e0;
}

.bracket-scroll::-webkit-scrollbar-thumb {
  border: 2px solid #e2e5e0;
  border-radius: 999px;
  background: var(--lime-dark);
}

.bracket-scroll::-webkit-scrollbar-thumb:hover {
  background: #557b27;
}

.bracket-board {
  display: grid;
  grid-template-columns:
    repeat(6, minmax(260px, 1fr));
  gap: 18px;
  min-width: 1720px;
}

.stage-column {
  min-width: 0;
}

.stage-header {
  padding: 16px;
  margin-bottom: 13px;
  color: var(--white);
  border-radius: 14px;
  background: var(--black);
}

.stage-header > span {
  display: inline-grid;
  min-width: 37px;
  min-height: 27px;
  margin-bottom: 9px;
  font-size: 9px;
  font-weight: 900;
  color: var(--black);
  place-items: center;
  border-radius: 7px;
  background: var(--lime);
}

.stage-header h3 {
  margin: 0 0 4px;
  font-size: 16px;
}

.stage-header small {
  font-size: 9px;
  color: #bdc4ba;
}

.stage-matches {
  display: grid;
  gap: 12px;
  align-content: start;
}

.bracket-match {
  padding: 14px;
  border: 1px solid #dfe4dc;
  border-radius: 14px;
  background: #fafbf9;
}

.finished-match {
  border-color: #c8dca6;
  background: #f7fbea;
}

.match-top {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid #e1e5de;
}

.match-top span {
  font-size: 9px;
  font-weight: 900;
  color: var(--lime-dark);
}

.match-top small {
  font-size: 8px;
  color: var(--gray);
}

.bracket-team {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 9px;
  align-items: center;
  min-height: 50px;
  padding: 9px;
  margin-bottom: 7px;
  border-radius: 9px;
  background: var(--white);
}

.bracket-team > div {
  display: grid;
  gap: 3px;
}

.bracket-team strong {
  font-size: 10px;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.bracket-team small {
  font-size: 7px;
  color: var(--gray);
}

.score {
  display: grid;
  width: 30px;
  height: 30px;
  font-size: 12px;
  font-weight: 900;
  place-items: center;
  border-radius: 8px;
  background: var(--lime-soft);
}

.penalty-result {
  padding: 7px;
  margin: 8px 0;
  font-size: 9px;
  font-weight: 800;
  text-align: center;
  border-radius: 8px;
  background: #fff1bd;
}

.winner-box {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  padding: 8px 9px;
  margin-top: 8px;
  color: var(--white);
  border-radius: 8px;
  background: var(--black);
}

.winner-box span {
  font-size: 7px;
  color: var(--lime);
  text-transform: uppercase;
}

.winner-box strong {
  font-size: 9px;
}

.match-kickoff {
  margin: 10px 0;
  font-size: 8px;
  color: var(--gray);
  text-align: center;
}

.match-actions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 7px;
}

.match-actions:has(.clear-result-button) {
  grid-template-columns:
    1fr auto;
}

.match-actions button {
  min-height: 34px;
  padding: 7px 9px;
  font: inherit;
  font-size: 8px;
  font-weight: 900;
  cursor: pointer;
  border-radius: 8px;
}

.edit-result-button {
  color: var(--black);
  border: 1px solid var(--lime);
  background: var(--lime);
}

.clear-result-button {
  color: #8f3030;
  border: 1px solid #ecc3c3;
  background: #fff0f0;
}

.waiting-message {
  margin: 10px 0 0;
  font-size: 8px;
  line-height: 1.45;
  color: var(--gray);
  text-align: center;
}

.scroll-help {
  margin: 11px 0 0;
  font-size: 9px;
  color: var(--gray);
  text-align: center;
}

.state-card {
  display: grid;
  min-height: 300px;
  text-align: center;
  place-content: center;
}

.state-card h2 {
  margin: 17px 0 7px;
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

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .page-header {
    display: grid;
    align-items: stretch;
  }

  .summary-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .bracket-navigation {
    display: grid;
  }

  .navigation-actions {
    width: 100%;
  }

  .navigation-actions button {
    flex: 1;
  }
}

@media (max-width: 600px) {
  .main-content {
    width: min(100% - 28px, 1450px);
    padding: 35px 0 55px;
  }

  .qualification-card,
  .result-editor,
  .bracket-section,
  .champion-card {
    padding: 20px;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .qualification-header,
  .result-editor-header,
  .bracket-heading {
    display: grid;
  }

  .result-teams {
    grid-template-columns: 1fr;
  }

  .result-versus {
    text-align: center;
  }

  .penalties-section {
    grid-template-columns: 1fr;
  }

  .header-actions,
  .result-actions {
    display: grid;
  }

  .header-actions button,
  .result-actions button {
    width: 100%;
  }

  .bracket-navigation {
    top: 8px;
    padding: 12px;
  }

  .navigation-actions {
    display: grid;
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .navigation-actions button {
    width: 100%;
  }

  .navigation-information strong {
    line-height: 1.4;
  }
}
</style>