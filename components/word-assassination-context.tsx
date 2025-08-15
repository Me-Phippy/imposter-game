"use client"

import { createContext, useContext, useReducer, ReactNode } from "react"
import { useGame } from "@/components/game-context"

export interface Player {
  id: string
  name: string
}

export interface WordAssassinationAssignment {
  playerId: string
  playerName: string
  targetId: string
  targetName: string
  word: string
}

export interface WordAssassinationState {
  gamePhase: 'setup' | 'assignment' | 'reveal' | 'playing' | 'finished'
  selectedPlayers: string[]
  words: string[]
  assignments: WordAssassinationAssignment[]
  currentRevealIndex: number
  gameStarted: boolean
}

type WordAssassinationAction =
  | { type: 'SET_SELECTED_PLAYERS'; playerIds: string[] }
  | { type: 'SET_WORDS'; words: string[] }
  | { type: 'START_ASSIGNMENT'; globalPlayers: Player[] }
  | { type: 'START_REVEAL' }
  | { type: 'NEXT_REVEAL' }
  | { type: 'START_GAME' }
  | { type: 'FINISH_GAME' }
  | { type: 'RESET_GAME' }

const initialState: WordAssassinationState = {
  gamePhase: 'setup',
  selectedPlayers: [],
  words: [],
  assignments: [],
  currentRevealIndex: 0,
  gameStarted: false
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function createAssignments(selectedPlayerIds: string[], globalPlayers: Player[], words: string[]): WordAssassinationAssignment[] {
  if (selectedPlayerIds.length < 2) return []
  if (words.length === 0) return []

  // Get selected players from global players
  const selectedPlayers = globalPlayers.filter(p => selectedPlayerIds.includes(p.id))

  // Shuffle players to create random target assignments
  const shuffledPlayers = shuffleArray(selectedPlayers)
  
  // Shuffle words to assign randomly
  const shuffledWords = shuffleArray(words)

  // Create ring structure: each player targets the next player in the shuffled list
  const assignments: WordAssassinationAssignment[] = []
  
  for (let i = 0; i < shuffledPlayers.length; i++) {
    const player = shuffledPlayers[i]
    const target = shuffledPlayers[(i + 1) % shuffledPlayers.length] // Ring structure
    const word = shuffledWords[i % shuffledWords.length] // Cycle through words if fewer words than players

    assignments.push({
      playerId: player.id,
      playerName: player.name,
      targetId: target.id,
      targetName: target.name,
      word: word
    })
  }

  return assignments
}

function wordAssassinationReducer(state: WordAssassinationState, action: WordAssassinationAction): WordAssassinationState {
  switch (action.type) {
    case 'SET_SELECTED_PLAYERS':
      return { ...state, selectedPlayers: action.playerIds }
      
    case 'SET_WORDS':
      return { ...state, words: action.words }
      
    case 'START_ASSIGNMENT':
      const assignments = createAssignments(state.selectedPlayers, action.globalPlayers, state.words)
      return { 
        ...state, 
        gamePhase: 'assignment',
        assignments,
        currentRevealIndex: 0
      }
      
    case 'START_REVEAL':
      return { ...state, gamePhase: 'reveal', currentRevealIndex: 0 }
      
    case 'NEXT_REVEAL':
      const nextIndex = state.currentRevealIndex + 1
      if (nextIndex >= state.assignments.length) {
        return { ...state, gamePhase: 'playing', currentRevealIndex: 0 }
      }
      return { ...state, currentRevealIndex: nextIndex }
      
    case 'START_GAME':
      return { ...state, gamePhase: 'playing', gameStarted: true }
      
    case 'FINISH_GAME':
      return { ...state, gamePhase: 'finished' }
      
    case 'RESET_GAME':
      return initialState
      
    default:
      return state
  }
}

const WordAssassinationContext = createContext<{
  state: WordAssassinationState
  dispatch: React.Dispatch<WordAssassinationAction>
  globalPlayers: Player[]
} | null>(null)

export function WordAssassinationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wordAssassinationReducer, initialState)
  const { state: gameState } = useGame()
  
  // Get global players from the main game context
  const globalPlayers = gameState.players

  return (
    <WordAssassinationContext.Provider value={{ state, dispatch, globalPlayers }}>
      {children}
    </WordAssassinationContext.Provider>
  )
}

export function useWordAssassination() {
  const context = useContext(WordAssassinationContext)
  if (!context) {
    throw new Error('useWordAssassination must be used within a WordAssassinationProvider')
  }
  return context
}
