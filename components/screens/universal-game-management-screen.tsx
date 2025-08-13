"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Trash2, Edit, Search, Database, Lock, Wifi, WifiOff, Download, Upload, AlertTriangle } from "lucide-react"
import { PasswordInput } from "@/components/ui/password-input"
import { ThemeToggle } from "@/components/theme-toggle"
import type { Screen } from "@/app/page"

// Game-specific hooks
import { useFirebaseWords } from "@/hooks/use-firebase-words"
import { useBombGameWords } from "@/hooks/use-game-databases"
import { useWordAssassinationWords } from "@/hooks/use-game-databases"
import { useHeadsUpCards } from "@/hooks/use-game-databases"
import { useBetBuddyChallenges } from "@/hooks/use-game-databases"

// Game configuration
interface GameConfig {
  title: string
  emoji: string
  description: string
  databaseName: string
  fields: {
    word: string
    category: string
    imposterTip?: boolean // Only for Imposter game
  }
  hook: any
}

const gameConfigs: Record<string, GameConfig> = {
  imposter: {
    title: "Imposter Wörter",
    emoji: "🎭",
    description: "Verwalte Wörter für das Imposter-Spiel mit speziellen Imposter-Tipps",
    databaseName: "Firebase-Datenbank",
    fields: { word: "Wort", category: "Kategorie", imposterTip: true },
    hook: useFirebaseWords
  },
  'bomb-game': {
    title: "Bomb Game Wörter", 
    emoji: "💣",
    description: "Verwalte Wörter für das explosive Bomb Game",
    databaseName: "Bomb Game Datenbank",
    fields: { word: "Wort", category: "Kategorie" },
    hook: useBombGameWords
  },
  'word-assassination': {
    title: "Word Assassination Wörter",
    emoji: "🎯", 
    description: "Verwalte Zielwörter für Word Assassination",
    databaseName: "Word Assassination Datenbank",
    fields: { word: "Wort", category: "Kategorie" },
    hook: useWordAssassinationWords
  },
  'heads-up': {
    title: "Heads Up Karten",
    emoji: "👁️",
    description: "Verwalte Karten für das Heads Up Spiel",
    databaseName: "Heads Up Datenbank", 
    fields: { word: "Begriff", category: "Kategorie" },
    hook: useHeadsUpCards
  },
  'bet-buddy': {
    title: "Bet Buddy Herausforderungen",
    emoji: "💰",
    description: "Verwalte Herausforderungen für Bet Buddy",
    databaseName: "Bet Buddy Datenbank",
    fields: { word: "Titel", category: "Kategorie" },
    hook: useBetBuddyChallenges
  }
}

interface UniversalGameManagementScreenProps {
  gameType: keyof typeof gameConfigs
  onNavigate: (screen: Screen) => void
}

export function UniversalGameManagementScreen({ gameType, onNavigate }: UniversalGameManagementScreenProps) {
  const config = gameConfigs[gameType]
  
  // Use the appropriate hook based on game type
  const gameData = config.hook()
  
  // Extract data with fallback for different hook structures
  const words = gameData.words || gameData.cards || gameData.challenges || []
  const { isLoading, isConnected, addWord, addCard, addChallenge, removeWord, removeCard, removeChallenge, importWords } = gameData
  
  // Form States
  const [newWord, setNewWord] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [newTip, setNewTip] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editWord, setEditWord] = useState("")
  const [editCategory, setEditCategory] = useState("")
  const [editTip, setEditTip] = useState("")
  
  // Auth State
  const [showPasswordInput, setShowPasswordInput] = useState(false)
  const [canEdit, setCanEdit] = useState(false)
  const [lastSyncMessage, setLastSyncMessage] = useState<string>("")
  const [pendingAction, setPendingAction] = useState<string>("")

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>()
    words.forEach((word: any) => {
      if (word.category) cats.add(word.category)
    })
    return Array.from(cats).sort()
  }, [words])

  const showSyncMessage = (message: string) => {
    setLastSyncMessage(message)
    setTimeout(() => setLastSyncMessage(""), 5000)
  }

  const requirePassword = (action: string) => {
    setPendingAction(action)
    setShowPasswordInput(true)
  }

  const handlePasswordSuccess = () => {
    setCanEdit(true)
    setShowPasswordInput(false)
    showSyncMessage(`✅ Admin-Modus aktiviert für ${config.title}`)
    setPendingAction("")
  }

  const handleAddWord = async () => {
    if (!newWord.trim() || !newCategory.trim()) return
    if (config.fields.imposterTip && !newTip.trim()) return

    const wordData: any = {
      [gameType === 'bet-buddy' ? 'title' : gameType === 'heads-up' ? 'word' : 'word']: newWord.trim(),
      category: newCategory.trim(),
      addedBy: 'Manual'
    }

    // Add imposter tip only for imposter game
    if (config.fields.imposterTip) {
      wordData.imposterTip = newTip.trim()
    }

    // Add game-specific fields
    if (gameType === 'word-assassination') {
      wordData.clues = []
      wordData.forbiddenWords = []
      wordData.points = 10
    } else if (gameType === 'heads-up') {
      wordData.hints = []
      wordData.difficulty = 'medium'
    } else if (gameType === 'bomb-game') {
      wordData.difficulty = 'medium'
      wordData.timeLimit = 30
    } else if (gameType === 'bet-buddy') {
      wordData.description = newWord.trim() + " Herausforderung"
      wordData.betType = 'time'
      wordData.minPlayers = 2
      wordData.maxPlayers = 6
      wordData.estimatedTime = 5
    }

    const addFunction = addWord || addCard || addChallenge
    const success = await addFunction(wordData)
    
    if (success) {
      setNewWord("")
      setNewCategory("")
      setNewTip("")
      showSyncMessage(`✅ "${newWord}" zur ${config.databaseName} hinzugefügt`)
    } else {
      showSyncMessage(`❌ Fehler beim Hinzufügen von "${newWord}"`)
    }
  }

  const handleDeleteWord = async (wordId: string, wordText: string) => {
    if (!confirm(`Möchtest du "${wordText}" wirklich aus der ${config.databaseName} löschen?`)) return

    const deleteFunction = removeWord || removeCard || removeChallenge
    const success = await deleteFunction(wordId)
    
    if (success) {
      showSyncMessage(`✅ "${wordText}" aus der ${config.databaseName} gelöscht`)
    } else {
      showSyncMessage(`❌ Fehler beim Löschen von "${wordText}"`)
    }
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(words, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `${gameType}-words-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const importedWords = JSON.parse(text)
      
      if (!Array.isArray(importedWords)) {
        alert("Ungültiges Dateiformat")
        return
      }

      if (importWords) {
        const success = await importWords(importedWords)
        if (success) {
          showSyncMessage(`${importedWords.length} Wörter in die ${config.databaseName} importiert`)
        } else {
          alert("Fehler beim Importieren der Wörter")
        }
      }
    } catch (error) {
      alert("Fehler beim Lesen der Datei")
    }
    
    // Reset file input
    event.target.value = ""
  }

  // Filter words
  const filteredEntries = words.filter((word: any) => {
    const searchLower = searchTerm.toLowerCase()
    const wordText = word.word || word.title || ""
    const categoryText = word.category || ""
    const tipText = word.imposterTip || word.description || ""
    
    return (
      wordText.toLowerCase().includes(searchLower) ||
      categoryText.toLowerCase().includes(searchLower) ||
      tipText.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="min-h-screen p-2 sm:p-6 bg-gradient-to-br from-purple-100 to-blue-200 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 relative">
      {/* Theme Toggle - Fixed Position */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
        <ThemeToggle />
      </div>
      
      <div className="max-w-4xl mx-auto space-y-3 sm:space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onNavigate("database-management")}
                  className="shrink-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-xl sm:text-2xl">
                    <span className="hidden sm:inline">{config.emoji} {config.title} Verwaltung</span>
                    <span className="sm:hidden">{config.emoji} {config.title.split(' ')[0]}</span>
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {config.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isConnected ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <Wifi className="h-4 w-4" />
                    <span className="text-xs sm:text-sm">Online ({words.length})</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <WifiOff className="h-4 w-4" />
                    <span className="text-xs sm:text-sm">Offline</span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Sync Message */}
        {lastSyncMessage && (
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50">
            <CardContent className="p-3 sm:pt-4">
              <p className="text-blue-800 dark:text-blue-200 text-xs sm:text-sm">{lastSyncMessage}</p>
            </CardContent>
          </Card>
        )}

        {/* Read-Only Mode */}
        {!canEdit && (
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200 text-lg sm:text-xl">
                <Database className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">{config.databaseName} (Nur-Lesen-Modus)</span>
                <span className="sm:hidden">Nur-Lesen-Modus</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <p className="text-blue-700 dark:text-blue-300 text-xs sm:text-sm mb-4">
                Du kannst alle {config.title.toLowerCase()} einsehen und durchsuchen. Für das Bearbeiten, Hinzufügen oder Löschen
                benötigst du das Admin-Passwort.
              </p>
              {!showPasswordInput ? (
                <Button 
                  variant="outline" 
                  onClick={() => setShowPasswordInput(true)}
                  className="w-full h-12 border-blue-300 text-blue-800 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-200 dark:hover:bg-blue-900/50 text-sm"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Admin-Modus aktivieren (zum Bearbeiten)</span>
                  <span className="sm:hidden">Admin-Modus</span>
                </Button>
              ) : (
                <PasswordInput
                  onCorrectPassword={handlePasswordSuccess}
                  title={pendingAction ? `Authentifizierung für: ${pendingAction}` : "Admin-Modus aktivieren"}
                  placeholder="Admin-Passwort eingeben"
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Admin Mode Active */}
        {canEdit && (
          <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/50">
            <CardContent className="p-4 sm:pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-green-700 dark:text-green-300 text-xs sm:text-sm font-medium">
                    <span className="hidden sm:inline">Admin-Modus aktiv - Vollzugriff auf {config.databaseName}</span>
                    <span className="sm:hidden">Admin-Modus aktiv</span>
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCanEdit(false)}
                  className="text-green-700 border-green-300 hover:bg-green-100 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-900/50 text-xs sm:text-sm"
                >
                  Beenden
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Import/Export */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleExport} variant="outline" className="flex-1 bg-transparent h-10 sm:h-auto">
            <Download className="h-4 w-4 mr-2" />
            <span className="text-sm">Exportieren</span>
          </Button>
          {canEdit ? (
            <div className="flex-1">
              <input 
                type="file" 
                accept=".json" 
                onChange={handleImport} 
                className="hidden" 
                id="import-file" 
              />
              <Button asChild variant="outline" className="w-full bg-transparent h-10 sm:h-auto">
                <label htmlFor="import-file" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  <span className="text-sm">Importieren</span>
                </label>
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => requirePassword(`${config.title} importieren`)} 
              variant="outline" 
              className="flex-1 bg-transparent h-10 sm:h-auto"
            >
              <Lock className="h-4 w-4 mr-2" />
              <span className="text-sm">Importieren (Admin)</span>
            </Button>
          )}
        </div>

        {/* Add New Word (Admin Only) */}
        {canEdit && (
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Neues {config.fields.word} zur {config.databaseName} hinzufügen</span>
                <span className="sm:hidden">Neues {config.fields.word} hinzufügen</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="new-word" className="text-sm">{config.fields.word}</Label>
                <Input
                  id="new-word"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  placeholder={`z.B. ${gameType === 'bet-buddy' ? 'Würfelglück' : gameType === 'heads-up' ? 'Elefant' : 'Apfel'}`}
                  className="h-10 sm:h-auto"
                />
              </div>
              <div>
                <Label htmlFor="new-category" className="text-sm">{config.fields.category}</Label>
                <Input
                  id="new-category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder={`z.B. ${gameType === 'bet-buddy' ? 'Glücksspiel' : gameType === 'heads-up' ? 'Tiere' : 'Obst'}`}
                  list="categories"
                  className="h-10 sm:h-auto"
                />
                <datalist id="categories">
                  {categories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
              {config.fields.imposterTip && (
                <div>
                  <Label htmlFor="new-tip" className="text-sm">Imposter-Tipp</Label>
                  <Textarea
                    id="new-tip"
                    value={newTip}
                    onChange={(e) => setNewTip(e.target.value)}
                    placeholder="z.B. Etwas Essbares, meist rot oder grün"
                    rows={2}
                    className="min-h-[60px] sm:min-h-[80px]"
                  />
                </div>
              )}
              <Button
                onClick={handleAddWord}
                disabled={!newWord.trim() || !newCategory.trim() || (config.fields.imposterTip && !newTip.trim()) || !isConnected}
                className="w-full h-10 sm:h-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Zur {config.databaseName} hinzufügen</span>
                <span className="sm:hidden">Hinzufügen</span>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">{config.title} durchsuchen ({filteredEntries.length} von {words.length})</span>
              <span className="sm:hidden">Suche ({filteredEntries.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <Input
              placeholder={`${config.title} durchsuchen...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 sm:h-auto"
            />
          </CardContent>
        </Card>

        {/* Words List */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">
              {config.title} ({filteredEntries.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {isLoading ? (
              <p className="text-center py-8 text-muted-foreground text-sm">Lade {config.title.toLowerCase()}...</p>
            ) : filteredEntries.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">
                {searchTerm ? "Keine Suchergebnisse gefunden." : `Keine ${config.title.toLowerCase()} gefunden.`}
              </p>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {filteredEntries.map((word: any) => {
                  const wordText = word.word || word.title || ""
                  const isEditing = editingId === word.id
                  
                  return (
                    <div key={word.id} className="border rounded-lg p-3 sm:p-4 bg-card">
                      {isEditing ? (
                        <div className="space-y-3">
                          <Input
                            value={editWord}
                            onChange={(e) => setEditWord(e.target.value)}
                            placeholder={config.fields.word}
                            className="h-10 sm:h-auto"
                          />
                          <Input
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            placeholder={config.fields.category}
                            className="h-10 sm:h-auto"
                          />
                          {config.fields.imposterTip && (
                            <Textarea
                              value={editTip}
                              onChange={(e) => setEditTip(e.target.value)}
                              placeholder="Imposter-Tipp"
                              rows={2}
                              className="min-h-[60px] sm:min-h-[80px]"
                            />
                          )}
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button size="sm" onClick={() => setEditingId(null)} className="h-8 sm:h-auto text-xs sm:text-sm">
                              Abbrechen
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 sm:h-auto text-xs sm:text-sm">
                              Speichern
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base sm:text-lg break-words">{wordText}</h3>
                              <p className="text-muted-foreground text-sm">Kategorie: {word.category}</p>
                              {word.imposterTip && (
                                <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 mt-1 break-words">
                                  💡 {word.imposterTip}
                                </p>
                              )}
                              {word.description && word.description !== wordText + " Herausforderung" && (
                                <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">
                                  {word.description}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-2">
                                <span className="hidden sm:inline">Hinzugefügt: {new Date(word.dateAdded).toLocaleString('de-DE')}</span>
                                <span className="sm:hidden">{new Date(word.dateAdded).toLocaleDateString('de-DE')}</span>
                                {word.addedBy && ` von ${word.addedBy}`}
                              </p>
                            </div>
                            {canEdit && (
                              <div className="flex gap-1 shrink-0">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 sm:h-auto sm:w-auto p-1 sm:p-2"
                                  onClick={() => {
                                    setEditingId(word.id)
                                    setEditWord(wordText)
                                    setEditCategory(word.category)
                                    setEditTip(word.imposterTip || "")
                                  }}
                                >
                                  <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600 hover:text-red-700 h-8 w-8 sm:h-auto sm:w-auto p-1 sm:p-2"
                                  onClick={() => handleDeleteWord(word.id, wordText)}
                                >
                                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
