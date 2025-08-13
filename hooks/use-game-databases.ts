import { useState, useEffect } from 'react'
import { 
  bombGameDatabase, 
  wordAssassinationDatabase, 
  headsUpDatabase, 
  betBuddyDatabase,
  type BombGameWord,
  type WordAssassinationWord,
  type HeadsUpCard,
  type BetBuddyChallenge
} from '@/lib/game-databases'

// Hook for Bomb Game data
export function useBombGameWords() {
  const [words, setWords] = useState<BombGameWord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(true)

  useEffect(() => {
    const unsubscribe = bombGameDatabase.subscribeToData((newWords) => {
      setWords(newWords)
      setIsConnected(true)
      setIsLoading(false)
    })

    return unsubscribe
  }, [])

  const addWord = async (wordData: Omit<BombGameWord, 'id' | 'dateAdded'>) => {
    return await bombGameDatabase.addItem(wordData)
  }

  const removeWord = async (wordId: string) => {
    return await bombGameDatabase.removeItem(wordId)
  }

  const importWords = async (wordsData: Array<Omit<BombGameWord, 'id' | 'dateAdded'>>) => {
    return await bombGameDatabase.importItems(wordsData)
  }

  const exportWords = async () => {
    return await bombGameDatabase.exportItems()
  }

  const getWordsByDifficulty = async (difficulty: 'easy' | 'medium' | 'hard') => {
    return await bombGameDatabase.getWordsByDifficulty(difficulty)
  }

  return {
    words,
    isLoading,
    isConnected,
    addWord,
    removeWord,
    importWords,
    exportWords,
    getWordsByDifficulty
  }
}

// Hook for Word Assassination data
export function useWordAssassinationWords() {
  const [words, setWords] = useState<WordAssassinationWord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(true)

  useEffect(() => {
    const unsubscribe = wordAssassinationDatabase.subscribeToData((newWords) => {
      setWords(newWords)
      setIsConnected(true)
      setIsLoading(false)
    })

    return unsubscribe
  }, [])

  const addWord = async (wordData: Omit<WordAssassinationWord, 'id' | 'dateAdded'>) => {
    return await wordAssassinationDatabase.addItem(wordData)
  }

  const removeWord = async (wordId: string) => {
    return await wordAssassinationDatabase.removeItem(wordId)
  }

  const importWords = async (wordsData: Array<Omit<WordAssassinationWord, 'id' | 'dateAdded'>>) => {
    return await wordAssassinationDatabase.importItems(wordsData)
  }

  const exportWords = async () => {
    return await wordAssassinationDatabase.exportItems()
  }

  const getWordsByPoints = async (minPoints: number) => {
    return await wordAssassinationDatabase.getWordsByPoints(minPoints)
  }

  return {
    words,
    isLoading,
    isConnected,
    addWord,
    removeWord,
    importWords,
    exportWords,
    getWordsByPoints
  }
}

// Hook for Heads Up data
export function useHeadsUpCards() {
  const [cards, setCards] = useState<HeadsUpCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(true)

  useEffect(() => {
    const unsubscribe = headsUpDatabase.subscribeToData((newCards) => {
      setCards(newCards)
      setIsConnected(true)
      setIsLoading(false)
    })

    return unsubscribe
  }, [])

  const addCard = async (cardData: Omit<HeadsUpCard, 'id' | 'dateAdded'>) => {
    return await headsUpDatabase.addItem(cardData)
  }

  const removeCard = async (cardId: string) => {
    return await headsUpDatabase.removeItem(cardId)
  }

  const importCards = async (cardsData: Array<Omit<HeadsUpCard, 'id' | 'dateAdded'>>) => {
    return await headsUpDatabase.importItems(cardsData)
  }

  const exportCards = async () => {
    return await headsUpDatabase.exportItems()
  }

  const getCardsByDifficulty = async (difficulty: 'easy' | 'medium' | 'hard') => {
    return await headsUpDatabase.getCardsByDifficulty(difficulty)
  }

  return {
    cards,
    isLoading,
    isConnected,
    addCard,
    removeCard,
    importCards,
    exportCards,
    getCardsByDifficulty
  }
}

// Hook for Bet Buddy data
export function useBetBuddyChallenges() {
  const [challenges, setChallenges] = useState<BetBuddyChallenge[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(true)

  useEffect(() => {
    const unsubscribe = betBuddyDatabase.subscribeToData((newChallenges) => {
      setChallenges(newChallenges)
      setIsConnected(true)
      setIsLoading(false)
    })

    return unsubscribe
  }, [])

  const addChallenge = async (challengeData: Omit<BetBuddyChallenge, 'id' | 'dateAdded'>) => {
    return await betBuddyDatabase.addItem(challengeData)
  }

  const removeChallenge = async (challengeId: string) => {
    return await betBuddyDatabase.removeItem(challengeId)
  }

  const importChallenges = async (challengesData: Array<Omit<BetBuddyChallenge, 'id' | 'dateAdded'>>) => {
    return await betBuddyDatabase.importItems(challengesData)
  }

  const exportChallenges = async () => {
    return await betBuddyDatabase.exportItems()
  }

  const getChallengesByType = async (betType: 'time' | 'accuracy' | 'creativity' | 'knowledge') => {
    return await betBuddyDatabase.getChallengesByType(betType)
  }

  const getChallengesByPlayerCount = async (playerCount: number) => {
    return await betBuddyDatabase.getChallengesByPlayerCount(playerCount)
  }

  return {
    challenges,
    isLoading,
    isConnected,
    addChallenge,
    removeChallenge,
    importChallenges,
    exportChallenges,
    getChallengesByType,
    getChallengesByPlayerCount
  }
}
