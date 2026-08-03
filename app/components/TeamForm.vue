<script setup lang="ts">
import type { Team } from '~/types/team'

const props = defineProps<{
  initialData?: Partial<Team>
  submitting?: boolean
}>()

const emit = defineEmits<{
  submit: [data: Omit<Team, 'id'>]
  cancel: []
}>()

const form = reactive<Omit<Team, 'id'>>({
  name: props.initialData?.name ?? '',
  group: props.initialData?.group ?? '',
  flag: props.initialData?.flag ?? '',
  coach: props.initialData?.coach ?? '',
  confederation: props.initialData?.confederation ?? '',
  fifaRanking: props.initialData?.fifaRanking ?? 0
})

const errors = reactive<Record<string, string>>({})

const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
const confederations = ['CONMEBOL', 'UEFA', 'CONCACAF', 'CAF', 'AFC', 'OFC']

function validate(): boolean {
  errors.name = form.name.trim() ? '' : 'El nombre es obligatorio.'
  errors.group = form.group ? '' : 'Selecciona un grupo.'
  errors.coach = form.coach.trim() ? '' : 'El entrenador es obligatorio.'
  errors.confederation = form.confederation ? '' : 'Selecciona una confederación.'
  errors.fifaRanking = form.fifaRanking > 0 ? '' : 'El ranking debe ser mayor a 0.'
  return Object.values(errors).every(e => !e)
}

function handleSubmit() {
  if (!validate()) return
  emit('submit', { ...form })
}
</script>

<template>
  <form class="team-form" @submit.prevent="handleSubmit">
    <div class="field">
      <label for="name">Nombre</label>
      <input id="name" v-model="form.name" type="text" placeholder="Ej. Costa Rica" />
      <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
    </div>

    <div class="field">
      <label for="flag">URL de bandera</label>
      <input id="flag" v-model="form.flag" type="text" placeholder="https://..." />
    </div>

    <div class="field">
      <label for="group">Grupo</label>
      <select id="group" v-model="form.group">
        <option value="" disabled>Selecciona un grupo</option>
        <option v-for="g in groups" :key="g" :value="g">{{ g }}</option>
      </select>
      <span v-if="errors.group" class="field-error">{{ errors.group }}</span>
    </div>

    <div class="field">
      <label for="coach">Entrenador</label>
      <input id="coach" v-model="form.coach" type="text" placeholder="Nombre del entrenador" />
      <span v-if="errors.coach" class="field-error">{{ errors.coach }}</span>
    </div>

    <div class="field">
      <label for="confederation">Confederación</label>
      <select id="confederation" v-model="form.confederation">
        <option value="" disabled>Selecciona una confederación</option>
        <option v-for="c in confederations" :key="c" :value="c">{{ c }}</option>
      </select>
      <span v-if="errors.confederation" class="field-error">{{ errors.confederation }}</span>
    </div>

    <div class="field">
      <label for="fifaRanking">Ranking FIFA</label>
      <input id="fifaRanking" v-model.number="form.fifaRanking" type="number" min="1" />
      <span v-if="errors.fifaRanking" class="field-error">{{ errors.fifaRanking }}</span>
    </div>

    <div class="actions">
      <button type="button" class="btn-secondary" :disabled="submitting" @click="emit('cancel')">
        Cancelar
      </button>
      <button type="submit" class="btn-primary" :disabled="submitting">
        {{ submitting ? 'Guardando...' : 'Guardar' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.team-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 420px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.field label {
  font-size: 0.85rem;
  font-weight: 600;
}
.field input,
.field select {
  padding: 0.5rem 0.6rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.95rem;
}
.field-error {
  color: #c0392b;
  font-size: 0.8rem;
}
.actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}
.btn-primary,
.btn-secondary {
  padding: 0.55rem 1.1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
}
.btn-primary {
  background: #2c6e49;
  color: white;
}
.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-secondary {
  background: #eee;
  color: #333;
}
</style>