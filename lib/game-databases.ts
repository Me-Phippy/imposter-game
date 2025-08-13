import { 
  database, 
  type BombGameWord, 
  type WordAssassinationWord, 
  type HeadsUpCard, 
  type BetBuddyChallenge 
} from './firebase'
import { ref, push, onValue, remove, set, off } from 'firebase/database'

// Generic Database Service Class
abstract class BaseGameDatabaseService<T> {
  protected tableName: string
  protected dataRef: any
  protected listeners: Array<(data: T[]) => void> = []

  constructor(tableName: string) {
    this.tableName = tableName
    this.dataRef = ref(database, tableName)
  }

  // Authentifizierung prüfen
  protected checkAuth(): boolean {
    return true // Placeholder - würde Firebase Auth verwenden
  }

  // Daten in Echtzeit abonnieren
  subscribeToData(callback: (data: T[]) => void): () => void {
    this.listeners.push(callback)

    const unsubscribe = onValue(this.dataRef, (snapshot) => {
      const data = snapshot.val()
      const items: T[] = []
      
      if (data) {
        Object.entries(data).forEach(([firebaseId, itemData]: [string, any]) => {
          items.push({
            id: itemData.id || firebaseId,
            ...itemData
          } as T)
        })
      }
      
      this.listeners.forEach(listener => listener(items))
    }, (error) => {
      console.error(`Firebase error for ${this.tableName}:`, error)
      this.listeners.forEach(listener => listener([]))
    })

    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
      off(this.dataRef, 'value', unsubscribe)
    }
  }

  // Neuen Eintrag hinzufügen
  async addItem(item: Omit<T, 'id' | 'dateAdded'>): Promise<boolean> {
    if (!this.checkAuth()) return false

    try {
      const newItem: Omit<T, 'id'> = {
        ...item,
        dateAdded: new Date().toISOString()
      } as Omit<T, 'id'>

      const newRef = push(this.dataRef)
      const itemWithId = {
        ...newItem,
        id: newRef.key!
      }

      await set(newRef, itemWithId)
      return true
    } catch (error) {
      console.error(`Error adding item to ${this.tableName}:`, error)
      return false
    }
  }

  // Eintrag löschen
  async removeItem(itemId: string): Promise<boolean> {
    if (!this.checkAuth()) return false

    try {
      const snapshot = await new Promise<any>((resolve, reject) => {
        onValue(this.dataRef, resolve, reject, { onlyOnce: true })
      })

      const data = snapshot.val()
      if (!data) return false

      let firebaseKey: string | null = null
      Object.entries(data).forEach(([key, itemData]: [string, any]) => {
        if ((itemData as any).id === itemId || key === itemId) {
          firebaseKey = key
        }
      })

      if (!firebaseKey) return false

      const itemRef = ref(database, `${this.tableName}/${firebaseKey}`)
      await remove(itemRef)
      return true
    } catch (error) {
      console.error(`Error removing item from ${this.tableName}:`, error)
      return false
    }
  }

  // Multiple Einträge importieren
  async importItems(items: Array<Omit<T, 'id' | 'dateAdded'>>): Promise<boolean> {
    if (!this.checkAuth()) return false

    try {
      const promises = items.map(item => this.addItem(item))
      const results = await Promise.all(promises)
      return results.every(result => result)
    } catch (error) {
      console.error(`Error importing items to ${this.tableName}:`, error)
      return false
    }
  }

  // Alle Einträge exportieren
  async exportItems(): Promise<T[]> {
    return new Promise((resolve, reject) => {
      onValue(this.dataRef, (snapshot) => {
        const data = snapshot.val()
        const items: T[] = []
        
        if (data) {
          Object.entries(data).forEach(([firebaseId, itemData]: [string, any]) => {
            items.push({
              id: itemData.id || firebaseId,
              ...itemData
            } as T)
          })
        }
        
        resolve(items)
      }, reject, { onlyOnce: true })
    })
  }
}

// Bomb Game Database Service
export class BombGameDatabaseService extends BaseGameDatabaseService<BombGameWord> {
  constructor() {
    super('bomb_game_words')
  }

  // Spezielle Methoden für Bomb Game
  async getWordsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): Promise<BombGameWord[]> {
    const allWords = await this.exportItems()
    return allWords.filter(word => word.difficulty === difficulty)
  }

  async getWordsByTimeLimit(minTime: number, maxTime: number): Promise<BombGameWord[]> {
    const allWords = await this.exportItems()
    return allWords.filter(word => word.timeLimit >= minTime && word.timeLimit <= maxTime)
  }
}

// Word Assassination Database Service
export class WordAssassinationDatabaseService extends BaseGameDatabaseService<WordAssassinationWord> {
  constructor() {
    super('word_assassination_words')
  }

  // Spezielle Methoden für Word Assassination
  async getWordsByPoints(minPoints: number): Promise<WordAssassinationWord[]> {
    const allWords = await this.exportItems()
    return allWords.filter(word => word.points >= minPoints)
  }

  async getWordsWithForbiddenWords(): Promise<WordAssassinationWord[]> {
    const allWords = await this.exportItems()
    return allWords.filter(word => word.forbiddenWords.length > 0)
  }
}

// Heads Up Database Service
export class HeadsUpDatabaseService extends BaseGameDatabaseService<HeadsUpCard> {
  constructor() {
    super('heads_up_cards')
  }

  // Spezielle Methoden für Heads Up
  async getCardsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): Promise<HeadsUpCard[]> {
    const allCards = await this.exportItems()
    return allCards.filter(card => card.difficulty === difficulty)
  }

  async getCardsWithHints(): Promise<HeadsUpCard[]> {
    const allCards = await this.exportItems()
    return allCards.filter(card => card.hints.length > 0)
  }
}

// Bet Buddy Database Service
export class BetBuddyDatabaseService extends BaseGameDatabaseService<BetBuddyChallenge> {
  constructor() {
    super('bet_buddy_challenges')
  }

  // Spezielle Methoden für Bet Buddy
  async getChallengesByType(betType: 'time' | 'accuracy' | 'creativity' | 'knowledge'): Promise<BetBuddyChallenge[]> {
    const allChallenges = await this.exportItems()
    return allChallenges.filter(challenge => challenge.betType === betType)
  }

  async getChallengesByPlayerCount(playerCount: number): Promise<BetBuddyChallenge[]> {
    const allChallenges = await this.exportItems()
    return allChallenges.filter(challenge => 
      playerCount >= challenge.minPlayers && playerCount <= challenge.maxPlayers
    )
  }

  async getChallengesByDuration(maxTime: number): Promise<BetBuddyChallenge[]> {
    const allChallenges = await this.exportItems()
    return allChallenges.filter(challenge => challenge.estimatedTime <= maxTime)
  }
}

// Singleton Instances
export const bombGameDatabase = new BombGameDatabaseService()
export const wordAssassinationDatabase = new WordAssassinationDatabaseService()
export const headsUpDatabase = new HeadsUpDatabaseService()
export const betBuddyDatabase = new BetBuddyDatabaseService()

// Export types
export type {
  BombGameWord,
  WordAssassinationWord, 
  HeadsUpCard,
  BetBuddyChallenge
}
