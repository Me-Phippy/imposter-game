"use client"

import type React from "react"

import { createContext, useContext, useReducer, type ReactNode } from "react"

export interface Player {
  id: string
  name: string
}

export interface WordEntry {
  word: string
  category: string
  imposterTip: string
}

export interface GameSession {
  secretWord: string
  imposterTip: string
  players: (Player & { role: "citizen" | "imposter"; association?: string })[]
  currentPlayerIndex: number
  associations: { playerId: string; word: string }[]
  votes: { voterId: string; targetId: string }[]
}

interface GameState {
  players: Player[]
  wordEntries: WordEntry[]
  selectedPlayers: string[]
  selectedCategories: string[]
  imposterTipEnabled: boolean
  imposterCount: number
  currentSession: GameSession | null
}

type GameAction =
  | { type: "ADD_PLAYER"; player: Player }
  | { type: "REMOVE_PLAYER"; playerId: string }
  | { type: "UPDATE_PLAYER"; player: Player }
  | { type: "ADD_WORD_ENTRY"; wordEntry: WordEntry }
  | { type: "REMOVE_WORD_ENTRY"; index: number }
  | { type: "UPDATE_WORD_ENTRY"; index: number; wordEntry: WordEntry }
  | { type: "SET_SELECTED_PLAYERS"; playerIds: string[] }
  | { type: "SET_SELECTED_CATEGORIES"; categories: string[] }
  | { type: "SET_IMPOSTER_TIP_ENABLED"; enabled: boolean }
  | { type: "SET_IMPOSTER_COUNT"; count: number }
  | { type: "START_GAME" }
  | { type: "ADD_ASSOCIATION"; playerId: string; word: string }
  | { type: "NEXT_PLAYER" }
  | { type: "ADD_VOTE"; voterId: string; targetId: string }
  | { type: "RESET_GAME" }
  | { type: "IMPORT_WORDS"; wordEntries: WordEntry[] }
  | { type: "SET_WORD_ENTRIES"; wordEntries: WordEntry[] }

const defaultWordEntries: WordEntry[] = [
  // Keine Standard-Wörter mehr - alles kommt aus Firebase
]

const initialState: GameState = {
  players: [],
  wordEntries: defaultWordEntries,
  selectedPlayers: [],
  selectedCategories: [],
  imposterTipEnabled: true,
  imposterCount: 1,
  currentSession: null,
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "ADD_PLAYER":
      return {
        ...state,
        players: [...state.players, action.player],
      }
    case "REMOVE_PLAYER":
      return {
        ...state,
        players: state.players.filter((p) => p.id !== action.playerId),
        selectedPlayers: state.selectedPlayers.filter((id) => id !== action.playerId),
      }
    case "UPDATE_PLAYER":
      return {
        ...state,
        players: state.players.map((p) => (p.id === action.player.id ? action.player : p)),
      }
    case "ADD_WORD_ENTRY":
      return {
        ...state,
        wordEntries: [...state.wordEntries, action.wordEntry],
      }
    case "REMOVE_WORD_ENTRY":
      return {
        ...state,
        wordEntries: state.wordEntries.filter((_, i) => i !== action.index),
      }
    case "UPDATE_WORD_ENTRY":
      return {
        ...state,
        wordEntries: state.wordEntries.map((entry, i) => (i === action.index ? action.wordEntry : entry)),
      }
    case "SET_SELECTED_PLAYERS":
      return {
        ...state,
        selectedPlayers: action.playerIds,
      }
    case "SET_SELECTED_CATEGORIES":
      return {
        ...state,
        selectedCategories: action.categories,
      }
    case "SET_IMPOSTER_TIP_ENABLED":
      return {
        ...state,
        imposterTipEnabled: action.enabled,
      }
    case "SET_IMPOSTER_COUNT":
      return {
        ...state,
        imposterCount: action.count,
      }
    case "START_GAME": {
      const selectedPlayerObjects = state.players.filter((p) => state.selectedPlayers.includes(p.id))

      const availableWords = state.wordEntries.filter(
        (entry) => state.selectedCategories.length === 0 || state.selectedCategories.includes(entry.category),
      )

      if (availableWords.length === 0 || selectedPlayerObjects.length < 3) {
        return state
      }

      const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)]
      
      // Bestimme die Anzahl der Imposter (max. Anzahl der ausgewählten Spieler)
      const actualImposterCount = Math.min(state.imposterCount, selectedPlayerObjects.length)
      
      // Wähle zufällige Imposter aus
      const imposterIndices = new Set<number>()
      while (imposterIndices.size < actualImposterCount) {
        imposterIndices.add(Math.floor(Math.random() * selectedPlayerObjects.length))
      }

      const playersWithRoles = selectedPlayerObjects.map((player, index) => ({
        ...player,
        role: imposterIndices.has(index) ? ("imposter" as const) : ("citizen" as const),
      }))

      const startPlayerIndex = Math.floor(Math.random() * playersWithRoles.length)

      return {
        ...state,
        currentSession: {
          secretWord: randomWord.word,
          imposterTip: randomWord.imposterTip,
          players: playersWithRoles,
          currentPlayerIndex: startPlayerIndex,
          associations: [],
          votes: [],
        },
      }
    }
    case "ADD_ASSOCIATION":
      if (!state.currentSession) return state
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          associations: [...state.currentSession.associations, { playerId: action.playerId, word: action.word }],
        },
      }
    case "NEXT_PLAYER":
      if (!state.currentSession) return state
      const nextIndex = (state.currentSession.currentPlayerIndex + 1) % state.currentSession.players.length

      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          currentPlayerIndex: nextIndex,
        },
      }
    case "ADD_VOTE":
      if (!state.currentSession) return state
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          votes: [
            ...state.currentSession.votes.filter((v) => v.voterId !== action.voterId),
            { voterId: action.voterId, targetId: action.targetId },
          ],
        },
      }
    case "RESET_GAME":
      return {
        ...state,
        currentSession: null,
      }
    case "IMPORT_WORDS":
      return {
        ...state,
        wordEntries: [...state.wordEntries, ...action.wordEntries],
      }
    case "SET_WORD_ENTRIES":
      return {
        ...state,
        wordEntries: action.wordEntries,
      }
    default:
      return state
  }
}

const GameContext = createContext<{
  state: GameState
  dispatch: React.Dispatch<GameAction>
} | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error("useGame must be used within a GameProvider")
  }
  return context
}
