export interface Team {
  id?: string
  name: string
  group: string
  flag: string
  coach: string
  confederation: string
  fifaRanking: number
}

export interface Player {
  id?: string
  teamId: string
  name: string
  number: number
  position: string
  club: string
  goals: number

}