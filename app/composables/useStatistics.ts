import { computed } from "vue";

interface StatisticsPlayer {
  id?: string;
  teamId: string;
  name: string;
  number: number;
  position: string;
  club: string;
  goals: number;
}

interface StatisticsTeam {
  id?: string;
  name: string;
  flag?: string;
}

interface StatisticsMatch {
  id?: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
}

export interface ScorerStatistic {
  id: string;
  rank: number;
  teamId: string;
  teamName: string;
  teamFlag: string;
  name: string;
  number: number;
  position: string;
  club: string;
  goals: number;
}

export interface TeamStatistic {
  teamId: string;
  name: string;
  flag: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  winPercentage: number;
}

export function useStatistics() {
  const { getCollection } = useFirestore();

  const scorers = useState<ScorerStatistic[]>("statistics-scorers", () => []);

  const teamStatistics = useState<TeamStatistic[]>(
    "statistics-teams",
    () => [],
  );

  const matchesPlayed = useState<number>("statistics-matches-played", () => 0);

  const tournamentGoals = useState<number>(
    "statistics-tournament-goals",
    () => 0,
  );

  const matchesWithWinner = useState<number>(
    "statistics-matches-with-winner",
    () => 0,
  );

  const loading = useState<boolean>("statistics-loading", () => false);

  const error = useState<string | null>("statistics-error", () => null);

  const totalGoals = computed(() => tournamentGoals.value);

  const playersWithGoals = computed(() => {
    return scorers.value.filter((player) => player.goals > 0).length;
  });

  const topScorer = computed(() => {
    return scorers.value[0] ?? null;
  });

  const highestScoringTeam = computed(() => {
    const teamsWithMatches = teamStatistics.value.filter(
      (team) => team.played > 0,
    );

    return (
      [...teamsWithMatches].sort((firstTeam, secondTeam) => {
        if (secondTeam.goalsFor !== firstTeam.goalsFor) {
          return secondTeam.goalsFor - firstTeam.goalsFor;
        }

        return firstTeam.name.localeCompare(secondTeam.name, "es");
      })[0] ?? null
    );
  });

  const leastConcededTeam = computed(() => {
    const teamsWithMatches = teamStatistics.value.filter(
      (team) => team.played > 0,
    );

    return (
      [...teamsWithMatches].sort((firstTeam, secondTeam) => {
        if (firstTeam.goalsAgainst !== secondTeam.goalsAgainst) {
          return firstTeam.goalsAgainst - secondTeam.goalsAgainst;
        }

        if (secondTeam.played !== firstTeam.played) {
          return secondTeam.played - firstTeam.played;
        }

        return firstTeam.name.localeCompare(secondTeam.name, "es");
      })[0] ?? null
    );
  });

  const averageGoals = computed(() => {
    if (matchesPlayed.value === 0) {
      return 0;
    }

    return Number((totalGoals.value / matchesPlayed.value).toFixed(2));
  });

  const victoryPercentage = computed(() => {
    if (matchesPlayed.value === 0) {
      return 0;
    }

    return Number(
      ((matchesWithWinner.value / matchesPlayed.value) * 100).toFixed(1),
    );
  });

  const hasStatisticsData = computed(() => {
    return (
      scorers.value.length > 0 ||
      teamStatistics.value.length > 0 ||
      matchesPlayed.value > 0
    );
  });

  function parseScore(score: unknown): number | null {
    const parsedScore = Number(score);

    if (!Number.isFinite(parsedScore) || parsedScore < 0) {
      return null;
    }

    return parsedScore;
  }

  async function fetchStatistics() {
    loading.value = true;
    error.value = null;

    try {
      const [playersData, teamsData, matchesData] = await Promise.all([
        getCollection("players"),
        getCollection("teams"),
        getCollection("matches"),
      ]);

      const players = playersData as StatisticsPlayer[];
      const teams = teamsData as StatisticsTeam[];
      const matches = matchesData as StatisticsMatch[];

      const teamsById = new Map<string, StatisticsTeam>();

      for (const team of teams) {
        if (team.id) {
          teamsById.set(team.id, team);
        }
      }

      scorers.value = players
        .map((player) => {
          const team = teamsById.get(player.teamId);
          const parsedGoals = Number(player.goals);

          return {
            id: player.id ?? `${player.teamId}-${player.name}-${player.number}`,
            rank: 0,
            teamId: player.teamId,
            teamName: team?.name ?? "Selección no encontrada",
            teamFlag: team?.flag ?? "🏳️",
            name: player.name,
            number: Number(player.number),
            position: player.position,
            club: player.club,
            goals:
              Number.isFinite(parsedGoals) && parsedGoals >= 0
                ? parsedGoals
                : 0,
          };
        })
        .sort((firstPlayer, secondPlayer) => {
          if (secondPlayer.goals !== firstPlayer.goals) {
            return secondPlayer.goals - firstPlayer.goals;
          }

          return firstPlayer.name.localeCompare(secondPlayer.name, "es");
        })
        .map((player, index) => ({
          ...player,
          rank: index + 1,
        }));

      const statisticsByTeamId = new Map<string, TeamStatistic>();

      for (const team of teams) {
        if (!team.id) {
          continue;
        }

        statisticsByTeamId.set(team.id, {
          teamId: team.id,
          name: team.name,
          flag: team.flag ?? "🏳️",
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          winPercentage: 0,
        });
      }

      let completedMatches = 0;
      let goalsInCompletedMatches = 0;
      let completedMatchesWithWinner = 0;

      for (const match of matches) {
        if (match.status !== "Finalizado") {
          continue;
        }

        const homeScore = parseScore(match.homeScore);
        const awayScore = parseScore(match.awayScore);

        if (homeScore === null || awayScore === null) {
          continue;
        }

        completedMatches += 1;
        goalsInCompletedMatches += homeScore + awayScore;

        if (homeScore !== awayScore) {
          completedMatchesWithWinner += 1;
        }

        const homeTeam = statisticsByTeamId.get(match.homeTeamId);
        const awayTeam = statisticsByTeamId.get(match.awayTeamId);

        if (homeTeam) {
          homeTeam.played += 1;
          homeTeam.goalsFor += homeScore;
          homeTeam.goalsAgainst += awayScore;
        }

        if (awayTeam) {
          awayTeam.played += 1;
          awayTeam.goalsFor += awayScore;
          awayTeam.goalsAgainst += homeScore;
        }

        if (homeScore > awayScore) {
          if (homeTeam) {
            homeTeam.wins += 1;
          }

          if (awayTeam) {
            awayTeam.losses += 1;
          }
        } else if (awayScore > homeScore) {
          if (awayTeam) {
            awayTeam.wins += 1;
          }

          if (homeTeam) {
            homeTeam.losses += 1;
          }
        } else {
          if (homeTeam) {
            homeTeam.draws += 1;
          }

          if (awayTeam) {
            awayTeam.draws += 1;
          }
        }
      }

      teamStatistics.value = Array.from(statisticsByTeamId.values())
        .map((team) => ({
          ...team,
          winPercentage:
            team.played === 0
              ? 0
              : Number(((team.wins / team.played) * 100).toFixed(1)),
        }))
        .sort((firstTeam, secondTeam) =>
          firstTeam.name.localeCompare(secondTeam.name, "es"),
        );

      matchesPlayed.value = completedMatches;
      tournamentGoals.value = goalsInCompletedMatches;
      matchesWithWinner.value = completedMatchesWithWinner;
    } catch (caughtError) {
      error.value = "No se pudieron cargar las estadísticas.";

      console.error("[useStatistics] fetchStatistics:", caughtError);
    } finally {
      loading.value = false;
    }
  }

  return {
    scorers,
    teamStatistics,
    loading,
    error,
    totalGoals,
    playersWithGoals,
    topScorer,
    highestScoringTeam,
    leastConcededTeam,
    matchesPlayed,
    averageGoals,
    victoryPercentage,
    hasStatisticsData,
    fetchStatistics,
  };
}