import type { Team } from '../types/team'
import { useFirestore } from './useFirestore'

export function useTeams() {
  const {
    getCollection,
    getDocument,
    createDocument,
    updateDocument,
    deleteDocument
  } = useFirestore()

  const teams = useState<Team[]>('teams', () => [])
  const loading = useState<boolean>('teams-loading', () => false)
  const error = useState<string | null>('teams-error', () => null)

  async function fetchTeams() {
    loading.value = true
    error.value = null

    try {
      teams.value = await getCollection('teams') as Team[]
    } catch (e) {
      error.value = 'No se pudieron cargar los equipos. Intenta de nuevo.'
      console.error('[useTeams] fetchTeams:', e)
    } finally {
      loading.value = false
    }
  }

  return {
  teams,
  loading,
  error,
  fetchTeams,
  fetchTeamById,
  createTeam,
  updateTeam,
  deleteTeam
}

  async function fetchTeamById(id: string): Promise<Team | null> {
    loading.value = true
    error.value = null

    try {
      return await getDocument('teams', id) as Team | null
    } catch (e) {
      error.value = 'No se pudo cargar el equipo.'
      console.error('[useTeams] fetchTeamById:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  async function createTeam(data: Omit<Team, 'id'>) {
    error.value = null

    try {
      const createdTeam = await createDocument('teams', data)
      await fetchTeams()

      return createdTeam.id
    } catch (e) {
      error.value = 'No se pudo crear el equipo.'
      console.error('[useTeams] createTeam:', e)
      throw e
    }
  }

  async function updateTeam(id: string, data: Partial<Team>) {
    error.value = null

    try {
      await updateDocument('teams', id, data)
      await fetchTeams()
    } catch (e) {
      error.value = 'No se pudo actualizar el equipo.'
      console.error('[useTeams] updateTeam:', e)
      throw e
    }
  }

  async function deleteTeam(id: string) {
    error.value = null

    try {
      await deleteDocument('teams', id)

      teams.value = teams.value.filter(team => team.id !== id)
    } catch (e) {
      error.value = 'No se pudo eliminar el equipo.'
      console.error('[useTeams] deleteTeam:', e)
      throw e
    }
  }

  return {
    teams,
    loading,
    error,
    fetchTeams,
    fetchTeamById,
    createTeam,
    updateTeam,
    deleteTeam
  }
}