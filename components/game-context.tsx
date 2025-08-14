"use client"

import type React from "react"

import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"
import { useFirebaseWords } from "@/hooks/use-firebase-words"

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
  | { type: "LOAD_PLAYERS"; players: Player[] }
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
  // Keine Standard-Wörter - alles kommt aus Firebase
]

// Funktion zum Laden der Spieler aus localStorage
function loadPlayersFromStorage(): Player[] {
  if (typeof window === 'undefined') return []
  try {
    const saved = localStorage.getItem('imposter-game-players')
    return saved ? JSON.parse(saved) : []
  } catch (error) {
    console.error('Fehler beim Laden der Spieler aus localStorage:', error)
    return []
  }
}

// Funktion zum Speichern der Spieler in localStorage
function savePlayersToStorage(players: Player[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('imposter-game-players', JSON.stringify(players))
  } catch (error) {
    console.error('Fehler beim Speichern der Spieler in localStorage:', error)
  }
}

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
  let newState: GameState
  
  switch (action.type) {
    case "ADD_PLAYER":
      newState = {
        ...state,
        players: [...state.players, action.player],
      }
      savePlayersToStorage(newState.players)
      return newState
    case "REMOVE_PLAYER":
      newState = {
        ...state,
        players: state.players.filter((p) => p.id !== action.playerId),
        selectedPlayers: state.selectedPlayers.filter((id) => id !== action.playerId),
      }
      savePlayersToStorage(newState.players)
      return newState
    case "UPDATE_PLAYER":
      newState = {
        ...state,
        players: state.players.map((p) => (p.id === action.player.id ? action.player : p)),
      }
      savePlayersToStorage(newState.players)
      return newState
    case "LOAD_PLAYERS":
      return {
        ...state,
        players: action.players,
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
      
      // Keep players in their original order (no shuffling)
      const playersInOrder = [...selectedPlayerObjects]
      
      // Bestimme die Anzahl der Imposter (max. Anzahl der ausgewählten Spieler)
      const actualImposterCount = Math.min(state.imposterCount, playersInOrder.length)
      
      // Wähle zufällige Imposter aus den Spielern aus
      const imposterIndices = new Set<number>()
      while (imposterIndices.size < actualImposterCount) {
        imposterIndices.add(Math.floor(Math.random() * playersInOrder.length))
      }

      const playersWithRoles = playersInOrder.map((player, index) => ({
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
  
  // ✅ Firebase-Wörter direkt im GameProvider laden (ohne Authentifizierung)
  const { words: firebaseWords } = useFirebaseWords()

  // Lade Spieler aus localStorage beim ersten Rendern
  useEffect(() => {
    const savedPlayers = loadPlayersFromStorage()
    if (savedPlayers.length > 0) {
      dispatch({ type: "LOAD_PLAYERS", players: savedPlayers })
    }
  }, [])

  // ✅ Synchronisiere Firebase-Wörter automatisch mit Game State
  useEffect(() => {
    if (firebaseWords.length > 0) {
      const firebaseWordEntries: WordEntry[] = firebaseWords.map(word => ({
        word: word.word,
        category: word.category,
        imposterTip: word.imposterTip
      }))
      
      dispatch({ type: "SET_WORD_ENTRIES", wordEntries: firebaseWordEntries })
    } else {
      // Firebase ist leer oder nicht verbunden - keine Wörter verfügbar
      dispatch({ type: "SET_WORD_ENTRIES", wordEntries: [] })
    }
  }, [firebaseWords]) // ← Läuft automatisch wenn Firebase-Wörter geladen werden

  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error("useGame must be used within a GameProvider")
  }
  return context
}
