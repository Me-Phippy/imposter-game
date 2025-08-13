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
const bombGameSampleData: Array<Omit<BombGameWord, 'id' | 'dateAdded'>> = [
  {
    word: "Pizza",
    category: "Essen",
    difficulty: "easy",
    timeLimit: 30,
    addedBy: "System"
  },
  {
    word: "Quantencomputer",
    category: "Technologie", 
    difficulty: "hard",
    timeLimit: 60,
    addedBy: "System"
  },
  {
    word: "Regenschirm",
    category: "Gegenstände",
    difficulty: "medium",
    timeLimit: 45,
    addedBy: "System"
  },
  {
    word: "Feuerwehrmann",
    category: "Berufe",
    difficulty: "medium",
    timeLimit: 40,
    addedBy: "System"
  },
  {
    word: "Schokolade",
    category: "Essen",
    difficulty: "easy",
    timeLimit: 25,
    addedBy: "System"
  }
]

// Sample data for Word Assassination
const wordAssassinationSampleData: Array<Omit<WordAssassinationWord, 'id' | 'dateAdded'>> = [
  {
    word: "Kaffee",
    category: "Getränke",
    clues: ["Wachmacher", "Schwarz oder mit Milch", "Morgens getrunken"],
    forbiddenWords: ["Bohne", "Espresso", "Cappuccino", "Tasse", "heiß"],
    points: 3,
    addedBy: "System"
  },
  {
    word: "Computer",
    category: "Technologie",
    clues: ["Elektronisches Gerät", "Zum Arbeiten verwendet", "Hat Tastatur und Bildschirm"],
    forbiddenWords: ["PC", "Laptop", "Maus", "Monitor", "Tastatur"],
    points: 4,
    addedBy: "System"
  },
  {
    word: "Fußball",
    category: "Sport",
    clues: ["Mannschaftssport", "Runder Gegenstand", "22 Spieler auf dem Feld"],
    forbiddenWords: ["Ball", "Tor", "Elfmeter", "WM", "Stadion"],
    points: 3,
    addedBy: "System"
  },
  {
    word: "Sonnenschein",
    category: "Wetter",
    clues: ["Macht gute Laune", "Gelb und warm", "Kommt vom Himmel"],
    forbiddenWords: ["Sonne", "hell", "Wärme", "Sommer", "Licht"],
    points: 4,
    addedBy: "System"
  },
  {
    word: "Geburtstag",
    category: "Ereignisse",
    clues: ["Einmal im Jahr", "Wird gefeiert", "Kerzen werden angezündet"],
    forbiddenWords: ["Kuchen", "Kerze", "Party", "Geschenk", "feiern"],
    points: 5,
    addedBy: "System"
  }
]

// Sample data for Heads Up
const headsUpSampleData: Array<Omit<HeadsUpCard, 'id' | 'dateAdded'>> = [
  {
    word: "Elefant",
    category: "Tiere",
    hints: ["Sehr groß", "Hat einen Rüssel", "Lebt in Afrika oder Asien"],
    difficulty: "easy",
    addedBy: "System"
  },
  {
    word: "Zahnbürste",
    category: "Gegenstände",
    hints: ["Benutzt man morgens und abends", "Für die Mundhygiene", "Hat Borsten"],
    difficulty: "medium",
    addedBy: "System"
  },
  {
    word: "Astronaut",
    category: "Berufe",
    hints: ["Arbeitet im Weltall", "Trägt einen besonderen Anzug", "Fliegt mit Raketen"],
    difficulty: "medium",
    addedBy: "System"
  },
  {
    word: "Photosynthese",
    category: "Wissenschaft",
    hints: ["Prozess in Pflanzen", "Wandelt Sonnenlicht um", "Produziert Sauerstoff"],
    difficulty: "hard",
    addedBy: "System"
  },
  {
    word: "Hausschlüssel",
    category: "Gegenstände",
    hints: ["Öffnet eine Tür", "Aus Metall", "Passt ins Schloss"],
    difficulty: "easy",
    addedBy: "System"
  }
]

// Sample data for Bet Buddy
const betBuddySampleData: Array<Omit<BetBuddyChallenge, 'id' | 'dateAdded'>> = [
  {
    title: "Wortketten-Sprint",
    description: "Wer kann in 60 Sekunden die längste Wortkette mit einem bestimmten Thema bilden?",
    category: "Wortspiele",
    betType: "time",
    minPlayers: 2,
    maxPlayers: 6,
    estimatedTime: 5,
    addedBy: "System"
  },
  {
    title: "Gedächtnis-Challenge",
    description: "Merke dir eine Liste von 20 Wörtern und wiederhole sie in der richtigen Reihenfolge.",
    category: "Gedächtnis",
    betType: "accuracy",
    minPlayers: 2,
    maxPlayers: 8,
    estimatedTime: 10,
    addedBy: "System"
  },
  {
    title: "Kreative Geschichte",
    description: "Erfinde eine Geschichte mit mindestens 5 vorgegebenen Wörtern. Die beste Geschichte gewinnt!",
    category: "Kreativität",
    betType: "creativity",
    minPlayers: 3,
    maxPlayers: 10,
    estimatedTime: 15,
    addedBy: "System"
  },
  {
    title: "Quiz-Duell",
    description: "Beantworte 10 Fragen zu einem zufälligen Thema. Höchste Punktzahl gewinnt.",
    category: "Wissen",
    betType: "knowledge",
    minPlayers: 2,
    maxPlayers: 4,
    estimatedTime: 8,
    addedBy: "System"
  },
  {
    title: "Tempo-Rechnen",
    description: "Löse 15 Matheaufgaben so schnell wie möglich. Zeit läuft!",
    category: "Mathematik",
    betType: "time",
    minPlayers: 2,
    maxPlayers: 6,
    estimatedTime: 3,
    addedBy: "System"
  }
]

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
