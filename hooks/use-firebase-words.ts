import { useState, useEffect } from 'react'
import { database, type FirebaseWord } from '@/lib/firebase'
import { ref, push, onValue, remove, set, off } from 'firebase/database'

export function useFirebaseWords() {
  const [words, setWords] = useState<FirebaseWord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(true)

  useEffect(() => {
    const wordsRef = ref(database, 'words')
    
    const unsubscribe = onValue(
      wordsRef,
      (snapshot) => {
        const data = snapshot.val()
        if (data) {
          const wordsArray: FirebaseWord[] = Object.entries(data).map(([id, word]: [string, any]) => ({
            id,
            ...word
          }))
          setWords(wordsArray)
        } else {
          setWords([])
        }
        setIsConnected(true)
        setIsLoading(false)
      },
      (error) => {
        console.error('Firebase connection error:', error)
        setIsConnected(false)
        setIsLoading(false)
      }
    )

    return () => {
      off(wordsRef, 'value', unsubscribe)
    }
  }, [])

  const addWord = async (wordData: Omit<FirebaseWord, 'id'>) => {
    try {
      const wordsRef = ref(database, 'words')
      await push(wordsRef, wordData)
      return true
    } catch (error) {
      console.error('Error adding word:', error)
      return false
    }
  }

  const updateWord = async (id: string, wordData: Omit<FirebaseWord, 'id'>) => {
    try {
      const wordRef = ref(database, `words/${id}`)
      await set(wordRef, wordData)
      return true
    } catch (error) {
      console.error('Error updating word:', error)
      return false
    }
  }

  const deleteWord = async (id: string) => {
    try {
      const wordRef = ref(database, `words/${id}`)
      await remove(wordRef)
      return true
    } catch (error) {
      console.error('Error deleting word:', error)
      return false
    }
  }

  const importWords = async (wordsToImport: Array<{ word: string; category: string; imposterTip: string }>) => {
    try {
      const wordsRef = ref(database, 'words')
      let importCount = 0

      for (const wordData of wordsToImport) {
        const newWordData: Omit<FirebaseWord, 'id'> = {
          word: wordData.word,
          category: wordData.category,
          imposterTip: wordData.imposterTip,
          dateAdded: new Date().toISOString(),
          addedBy: 'Import'
        }
        await push(wordsRef, newWordData)
        importCount++
      }

      return importCount
    } catch (error) {
      console.error('Error importing words:', error)
      return 0
    }
  }

  return {
    words,
    isLoading,
    isConnected,
    addWord,
    updateWord,
    deleteWord,
    importWords
  }
}
