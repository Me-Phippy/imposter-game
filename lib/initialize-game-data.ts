import { 
  bombGameDatabase, 
  wordAssassinationDatabase, 
  headsUpDatabase, 
  betBuddyDatabase,
  type BombGameWord,
  type WordAssassinationWord,
  type HeadsUpCard,
  type BetBuddyChallenge
} from './game-databases'

// Sample data for Bomb Game
const bombGameSampleData: Array<Omit<BombGameWord, 'id' | 'dateAdded'>> = []

// Sample data for Word Assassination
const wordAssassinationSampleData: Array<Omit<WordAssassinationWord, 'id' | 'dateAdded'>> = []

// Sample data for Heads Up
const headsUpSampleData: Array<Omit<HeadsUpCard, 'id' | 'dateAdded'>> = []

// Sample data for Bet Buddy
const betBuddySampleData: Array<Omit<BetBuddyChallenge, 'id' | 'dateAdded'>> = []

// Initialization functions
export async function initializeBombGameData(): Promise<void> {
  console.log('Initializing Bomb Game database...')
  const success = await bombGameDatabase.importItems(bombGameSampleData)
  if (success) {
    console.log(`Successfully added ${bombGameSampleData.length} Bomb Game words`)
  } else {
    console.error('Failed to initialize Bomb Game data')
  }
}

export async function initializeWordAssassinationData(): Promise<void> {
  console.log('Initializing Word Assassination database...')
  const success = await wordAssassinationDatabase.importItems(wordAssassinationSampleData)
  if (success) {
    console.log(`Successfully added ${wordAssassinationSampleData.length} Word Assassination words`)
  } else {
    console.error('Failed to initialize Word Assassination data')
  }
}

export async function initializeHeadsUpData(): Promise<void> {
  console.log('Initializing Heads Up database...')
  const success = await headsUpDatabase.importItems(headsUpSampleData)
  if (success) {
    console.log(`Successfully added ${headsUpSampleData.length} Heads Up cards`)
  } else {
    console.error('Failed to initialize Heads Up data')
  }
}

export async function initializeBetBuddyData(): Promise<void> {
  console.log('Initializing Bet Buddy database...')
  const success = await betBuddyDatabase.importItems(betBuddySampleData)
  if (success) {
    console.log(`Successfully added ${betBuddySampleData.length} Bet Buddy challenges`)
  } else {
    console.error('Failed to initialize Bet Buddy data')
  }
}

// Initialize all game databases
export async function initializeAllGameDatabases(): Promise<void> {
  console.log('🎮 Initializing all game databases...')
  
  try {
    await Promise.all([
      initializeBombGameData(),
      initializeWordAssassinationData(), 
      initializeHeadsUpData(),
      initializeBetBuddyData()
    ])
    
    console.log('✅ All game databases initialized successfully!')
  } catch (error) {
    console.error('❌ Error initializing game databases:', error)
  }
}

// Export sample data for reference
export {
  bombGameSampleData,
  wordAssassinationSampleData,
  headsUpSampleData,
  betBuddySampleData
}
