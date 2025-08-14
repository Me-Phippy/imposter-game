// Firebase Configuration
import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

// Firebase configuration for imposter-game-mocha
const firebaseConfig = {
  apiKey: "AIzaSyDjiibL8ycxYEI4tvDTLJoBlbR-79a9bMU",
  authDomain: "imposter-game-mocha.firebaseapp.com",
  databaseURL: "https://imposter-game-mocha-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "imposter-game-mocha",
  storageBucket: "imposter-game-mocha.firebasestorage.app",
  messagingSenderId: "192106771312",
  appId: "1:192106771312:web:b0252343e14e57344055b5",
  measurementId: "G-HDY61VDMZ6"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app)

// Export types for consistency
export interface FirebaseWord {
  id: string
  word: string
  category: string
  imposterTip: string
  dateAdded: string
  addedBy?: string
}

// Game-specific data interfaces
export interface BombGameWord {
  id: string
  word: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  timeLimit: number
  dateAdded: string
  addedBy?: string
}

export interface WordAssassinationWord {
  id: string
  word: string
  category: string
  clues: string[]
  forbiddenWords: string[]
  points: number
  dateAdded: string
  addedBy?: string
}

export interface HeadsUpCard {
  id: string
  word: string
  category: string
  hints: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  dateAdded: string
  addedBy?: string
}

export interface BetBuddyChallenge {
  id: string
  title: string
  description: string
  category: string
  betType: 'time' | 'accuracy' | 'creativity' | 'knowledge'
  minPlayers: number
  maxPlayers: number
  estimatedTime: number
  dateAdded: string
  addedBy?: string
}
