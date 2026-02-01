import { create } from "zustand";
import type { CourtPositions, Player } from "@/types";
import type { MatchResponse } from "@/api/client";

interface Score {
  sets: number;
  games: number;
  points: number;
}

interface MatchState {
  // Игроки для сканирования
  players: Player[];
  
  // Позиции на корте
  positions: CourtPositions;
  currentPlayer: Player | null;
  matchId: string | null;
  matchScore: MatchResponse["score"] | null;
  scoreTeamA: Score;
  scoreTeamB: Score;
  
  // Actions
  addPlayer: (player: Player) => void;
  clearPlayers: () => void;
  setPosition: (quadrant: 1 | 2 | 3 | 4, player: Player) => void;
  setCurrentPlayer: (player: Player | null) => void;
  setMatchId: (id: string | null) => void;
  setMatchScore: (score: MatchResponse["score"] | null) => void;
  resetMatch: () => void;
}

const emptyPositions: CourtPositions = {
  1: null,
  2: null,
  3: null,
  4: null,
};

const initialScore: Score = { sets: 0, games: 0, points: 0 };

export const useAppStore = create<MatchState>((set) => ({
  // Игроки для сканирования
  players: [],
  
  // Позиции на корте
  positions: { ...emptyPositions },
  currentPlayer: null,
  matchId: null,
  matchScore: null,
  scoreTeamA: { ...initialScore },
  scoreTeamB: { ...initialScore },
  
  // Actions
  addPlayer: (player: Player) =>
    set((state) => ({
      players: [...state.players, player]
    })),
    
  clearPlayers: () =>
    set({ players: [] }),
    
  setPosition: (quadrant: 1 | 2 | 3 | 4, player: Player) =>
    set((state) => ({
      positions: { ...state.positions, [quadrant]: player },
    })),
    
  setCurrentPlayer: (player: Player | null) => set({ currentPlayer: player }),
  setMatchId: (id: string | null) => set({ matchId: id }),
  setMatchScore: (score: MatchResponse["score"] | null) => set({ matchScore: score }),
  resetMatch: () =>
    set({
      players: [],
      positions: { ...emptyPositions },
      currentPlayer: null,
      matchId: null,
      matchScore: null,
      scoreTeamA: { ...initialScore },
      scoreTeamB: { ...initialScore },
    }),
}));
