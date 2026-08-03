import { where } from 'firebase/firestore'
import { useFirestore } from './useFirestore'

interface Player {
  id?: string
  teamId: string
  name: string
  number: number
  position: string
  club: string
}


export function usePlayers() {
  const {
    getCollection,
    getDocument,
    createDocument,
    updateDocument,
    deleteDocument
  } = useFirestore()

  const players = useState<Player[]>('players', () => [])
  const loading = useState<boolean>('players-loading', () => false)
  const error = useState<string | null>('players-error', () => null)

  async function fetchPlayers() {
    loading.value = true
    error.value = null

    try {
      players.value = await getCollection('players') as Player[]
    } catch (e) {
      error.value = 'No se pudieron cargar los jugadores.'
      console.error('[usePlayers] fetchPlayers:', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchPlayersByTeam(teamId: string) {
    loading.value = true
    error.value = null

    try {
      players.value = await getCollection(
        'players',
        [where('teamId', '==', teamId)]
      ) as Player[]
    } catch (e) {
      error.value = 'No se pudieron cargar los jugadores del equipo.'
      console.error('[usePlayers] fetchPlayersByTeam:', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchPlayerById(id: string): Promise<Player | null> {
    loading.value = true
    error.value = null

    try {
      return await getDocument('players', id) as Player | null
    } catch (e) {
      error.value = 'No se pudo cargar el jugador.'
      console.error('[usePlayers] fetchPlayerById:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  async function createPlayer(data: Omit<Player, 'id'>) {
    error.value = null

    try {
      const createdPlayer = await createDocument('players', data)
      await fetchPlayers()

      return createdPlayer.id
    } catch (e) {
      error.value = 'No se pudo crear el jugador.'
      console.error('[usePlayers] createPlayer:', e)
      throw e
    }
  }

  async function updatePlayer(
    id: string,
    data: Partial<Player>
  ) {
    error.value = null

    try {
      await updateDocument('players', id, data)
      await fetchPlayers()
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

      players.value = players.value.filter(
        player => player.id !== id
      )
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
    fetchPlayers,
    fetchPlayersByTeam,
    fetchPlayerById,
    createPlayer,
    updatePlayer,
    deletePlayer
  }
}