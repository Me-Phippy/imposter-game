"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"
import { useBombGameWords } from "@/hooks/use-game-databases"
import { useGame, type Player } from "@/components/game-context"

export interface BombGamePlayer extends Player {
  losses: number // Track how many times this player lost
}

export interface BombGameWord {
  word: string
  category: string
  difficulty: "easy" | "medium" | "hard"
}

export interface BombGameSession {
  words: BombGameWord[]
  players: BombGamePlayer[]
  currentWord: string
  bombTimer: number // in seconds
  isActive: boolean
  hasExploded: boolean
  explosionPlayerId: string | null
  selectedCategories: string[]
  trackLosses: boolean // Whether to track losses or not
}

interface BombGameState {
  currentSession: BombGameSession | null
  words: BombGameWord[]
  availableCategories: string[]
  playerLosses: Record<string, number> // Track losses per player ID
}

type BombGameAction =
  | { type: "START_GAME"; selectedPlayers: string[]; selectedCategories: string[]; trackLosses: boolean; globalPlayers: Player[] }
  | { type: "TICK_TIMER" }
  | { type: "EXPLODE_BOMB"; playerId: string }
  | { type: "RESET_GAME" }
  | { type: "SET_WORDS"; words: BombGameWord[] }

// Generate random timer between 12 seconds and 3 minutes (180 seconds)
function generateRandomTimer(): number {
  const min = 12 // 12 seconds
  const max = 180 // 3 minutes
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Load player losses from localStorage
function loadPlayerLossesFromStorage(): Record<string, number> {
  if (typeof window === 'undefined') return {}
  try {
    const saved = localStorage.getItem('bomb-game-player-losses')
    return saved ? JSON.parse(saved) : {}
  } catch (error) {
    console.error('Error loading bomb game player losses from localStorage:', error)
    return {}
  }
}

// Save player losses to localStorage
function savePlayerLossesToStorage(losses: Record<string, number>): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('bomb-game-player-losses', JSON.stringify(losses))
  } catch (error) {
    console.error('Error saving bomb game player losses to localStorage:', error)
  }
}

const initialState: BombGameState = {
  currentSession: null,
  words: [],
  availableCategories: [],
  playerLosses: {},
}

function bombGameReducer(state: BombGameState, action: BombGameAction): BombGameState {
  switch (action.type) {
    case "SET_WORDS":
      const categories = [...new Set(action.words.map(w => w.category))]
      return {
        ...state,
        words: action.words,
        availableCategories: categories,
      }

    case "START_GAME": {
      const selectedPlayerObjects = action.globalPlayers.filter((p) => 
        action.selectedPlayers.includes(p.id)
      )

      if (selectedPlayerObjects.length < 2) {
        return state // Need at least 2 players
      }

      // Filter words by selected categories
      const availableWords = state.words.filter(
        (word) => action.selectedCategories.length === 0 || 
        action.selectedCategories.includes(word.category)
      )

      if (availableWords.length === 0) {
        return state // Need at least one word
      }

      // Create bomb game players with loss data (keep original order)
      const bombGamePlayers: BombGamePlayer[] = selectedPlayerObjects.map(player => ({
        ...player,
        losses: state.playerLosses[player.id] || 0
      }))

      // Pick random starting player and word
      const currentWord = availableWords[Math.floor(Math.random() * availableWords.length)]

      return {
        ...state,
        currentSession: {
          words: availableWords,
          players: bombGamePlayers,
          currentWord: currentWord.word,
          bombTimer: generateRandomTimer(),
          isActive: true,
          hasExploded: false,
          explosionPlayerId: null,
          selectedCategories: action.selectedCategories,
          trackLosses: action.trackLosses,
        },
      }
    }

    case "TICK_TIMER":
      if (!state.currentSession || !state.currentSession.isActive) {
        return state
      }

      const newTimer = state.currentSession.bombTimer - 1

      if (newTimer <= 0) {
        // Bomb explodes! But we don't assign to a player yet - that will be done manually
        return {
          ...state,
          currentSession: {
            ...state.currentSession,
            bombTimer: 0,
            isActive: false,
            hasExploded: true,
            explosionPlayerId: null, // Will be set manually
          },
        }
      }

      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          bombTimer: newTimer,
        },
      }

    case "EXPLODE_BOMB":
      if (!state.currentSession) return state

      // Update player losses if tracking is enabled
      let updatedLosses = state.playerLosses
      if (state.currentSession.trackLosses && action.playerId) {
        updatedLosses = {
          ...state.playerLosses,
          [action.playerId]: (state.playerLosses[action.playerId] || 0) + 1
        }
        savePlayerLossesToStorage(updatedLosses)
      }

      return {
        ...state,
        playerLosses: updatedLosses,
        currentSession: {
          ...state.currentSession,
          isActive: false,
          hasExploded: true,
          explosionPlayerId: action.playerId,
          players: state.currentSession.players.map(p =>
            p.id === action.playerId && state.currentSession!.trackLosses
              ? { ...p, losses: updatedLosses[p.id] || 0 }
              : p
          )
        },
      }

    case "RESET_GAME":
      return {
        ...state,
        currentSession: null,
      }

    default:
      return state
  }
}

const BombGameContext = createContext<{
  state: BombGameState
  dispatch: React.Dispatch<BombGameAction>
  globalPlayers: Player[]
} | null>(null)

export function BombGameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bombGameReducer, initialState)
  const { words: bombWords } = useBombGameWords()
  const { state: globalGameState } = useGame() // Get global players

  // Load player losses from localStorage on first render
  useEffect(() => {
    const savedLosses = loadPlayerLossesFromStorage()
    if (Object.keys(savedLosses).length > 0) {
      dispatch({ 
        type: "SET_WORDS", 
        words: state.words 
      })
    }
  }, [])

  // Initialize player losses
  useEffect(() => {
    const savedLosses = loadPlayerLossesFromStorage()
    return () => {
      // Component cleanup
    }
  }, [])

  // Synchronize bomb game words
  useEffect(() => {
    if (bombWords.length > 0) {
      const gameWords: BombGameWord[] = bombWords.map(word => ({
        word: word.word,
        category: word.category,
        difficulty: word.difficulty || 'medium'
      }))
      dispatch({ type: "SET_WORDS", words: gameWords })
    }
  }, [bombWords])

  // Timer effect - runs every second when game is active
  useEffect(() => {
    if (state.currentSession?.isActive) {
      const interval = setInterval(() => {
        dispatch({ type: "TICK_TIMER" })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [state.currentSession?.isActive])

  return (
    <BombGameContext.Provider value={{ state, dispatch, globalPlayers: globalGameState.players }}>
      {children}
    </BombGameContext.Provider>
  )
}

export function useBombGame() {
  const context = useContext(BombGameContext)
  if (!context) {
    throw new Error("useBombGame must be used within a BombGameProvider")
  }
  return context
}
