// composables/usePlayers.ts
import { where } from 'firebase/firestore'
import type { Player } from '~/types/team'
import { useFirestore } from '~/composables/useFirestore'

export function usePlayers() {
  const { getCollection, createDocument, updateDocument, deleteDocument } = useFirestore()

  const players = useState<Player[]>('players', () => [])
  const loading = useState<boolean>('players-loading', () => false)
  const error = useState<string | null>('players-error', () => null)

  // Relación: jugadores por selección (where teamId == id)
  async function fetchPlayersByTeam(teamId: string) {
    loading.value = true
    error.value = null
    try {
      players.value = (await getCollection('players', [where('teamId', '==', teamId)])) as Player[]
    } catch (e) {
      error.value = 'No se pudo cargar la plantilla.'
      console.error('[usePlayers] fetchPlayersByTeam:', e)
    } finally {
      loading.value = false
    }
  }

  async function createPlayer(data: Omit<Player, 'id'>) {
    error.value = null
    try {
      const created = await createDocument('players', data)
      await fetchPlayersByTeam(data.teamId)
      return created.id as string
    } catch (e) {
      error.value = 'No se pudo agregar el jugador.'
      console.error('[usePlayers] createPlayer:', e)
      throw e
    }
  }

  async function updatePlayer(id: string, data: Partial<Player>) {
    error.value = null
    try {
      await updateDocument('players', id, data)
      if (data.teamId) await fetchPlayersByTeam(data.teamId)
    } catch (e) {
      error.value = 'No se pudo actualizar el jugador.'
      console.error('[usePlayers] updatePlayer:', e)
      throw e
    }
  }

  async function deletePlayer(id: string) {
    error.value = null
    try {
      await deleteDocument('players', id)
      players.value = players.value.filter(p => p.id !== id)
    } catch (e) {
      error.value = 'No se pudo eliminar el jugador.'
      console.error('[usePlayers] deletePlayer:', e)
      throw e
    }
  }

  return {
    players,
    loading,
    error,
    fetchPlayersByTeam,
    createPlayer,
    updatePlayer,
    deletePlayer
  }
}