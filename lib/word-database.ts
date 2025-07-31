import { database, type FirebaseWord } from './firebase'
import { ref, push, onValue, remove, set, off } from 'firebase/database'

// Re-export FirebaseWord type for convenience
export type { FirebaseWord }

export class WordDatabaseService {
  private wordsRef = ref(database, 'words')
  private listeners: Array<(words: FirebaseWord[]) => void> = []

  // Authentifizierung prüfen
  private checkAuth(): boolean {
    // In einer echten App würdest du hier Firebase Auth verwenden
    // Für jetzt nehmen wir an, dass die Authentifizierung über das UI erfolgt
    return true
  }

  // Wörter in Echtzeit abonnieren
  subscribeToWords(callback: (words: FirebaseWord[]) => void): () => void {
    this.listeners.push(callback)

    const unsubscribe = onValue(this.wordsRef, (snapshot) => {
      const data = snapshot.val()
      const words: FirebaseWord[] = []
      
      if (data) {
        Object.entries(data).forEach(([firebaseId, wordData]: [string, any]) => {
          words.push({
            id: wordData.id || firebaseId,
            text: wordData.text,
            category: wordData.category,
            hint: wordData.hint,
            dateAdded: wordData.dateAdded
          })
        })
      }
      
      // Alle Listener benachrichtigen
      this.listeners.forEach(listener => listener(words))
    }, (error) => {
      console.error('Firebase error:', error)
      // Fallback: leere Liste
      this.listeners.forEach(listener => listener([]))
    })

    // Cleanup-Funktion zurückgeben
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
      off(this.wordsRef, 'value', unsubscribe)
    }
  }

  // Neues Wort hinzufügen (passwortgeschützt)
  async addWord(word: Omit<FirebaseWord, 'id' | 'dateAdded'>): Promise<boolean> {
    if (!this.checkAuth()) return false

    try {
      const newWord: Omit<FirebaseWord, 'id'> = {
        ...word,
        dateAdded: new Date().toISOString()
      }

      const newRef = push(this.wordsRef)
      const wordWithId = {
        ...newWord,
        id: newRef.key!
      }

      await set(newRef, wordWithId)
      return true
    } catch (error) {
      console.error('Error adding word:', error)
      return false
    }
  }

  // Wort löschen (passwortgeschützt)
  async removeWord(wordId: string): Promise<boolean> {
    if (!this.checkAuth()) return false

    try {
      // Finde das Wort mit der entsprechenden ID
      const snapshot = await new Promise<any>((resolve, reject) => {
        onValue(this.wordsRef, resolve, reject, { onlyOnce: true })
      })

      const data = snapshot.val()
      if (!data) return false

      // Finde Firebase-Key basierend auf der Wort-ID
      let firebaseKey: string | null = null
      Object.entries(data).forEach(([key, wordData]: [string, any]) => {
        if (wordData.id === wordId || key === wordId) {
          firebaseKey = key
        }
      })

      if (!firebaseKey) return false

      const wordRef = ref(database, `words/${firebaseKey}`)
      await remove(wordRef)
      return true
    } catch (error) {
      console.error('Error removing word:', error)
      return false
    }
  }

  // Multiple Wörter importieren (passwortgeschützt)
  async importWords(words: Array<Omit<FirebaseWord, 'id' | 'dateAdded'>>): Promise<boolean> {
    if (!this.checkAuth()) return false

    try {
      const promises = words.map(word => this.addWord(word))
      const results = await Promise.all(promises)
      return results.every(result => result)
    } catch (error) {
      console.error('Error importing words:', error)
      return false
    }
  }

  // Alle Wörter als JSON exportieren
  async exportWords(): Promise<FirebaseWord[]> {
    return new Promise((resolve, reject) => {
      onValue(this.wordsRef, (snapshot) => {
        const data = snapshot.val()
        const words: FirebaseWord[] = []
        
        if (data) {
          Object.entries(data).forEach(([firebaseId, wordData]: [string, any]) => {
            words.push({
              id: wordData.id || firebaseId,
              text: wordData.text,
              category: wordData.category,
              hint: wordData.hint,
              dateAdded: wordData.dateAdded
            })
          })
        }
        
        resolve(words)
      }, reject, { onlyOnce: true })
    })
  }
}

// Singleton Instance
export const wordDatabase = new WordDatabaseService()
