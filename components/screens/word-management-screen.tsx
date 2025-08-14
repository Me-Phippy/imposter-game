"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Trash2, Edit, Search, Database, Lock, Wifi, WifiOff, Download, Upload, AlertTriangle, Copy } from "lucide-react"
import { PasswordInput } from "@/components/ui/password-input"
import type { Screen } from "@/app/page"
import { useGame, type WordEntry } from "@/components/game-context"
import { useFirebaseWords } from "@/hooks/use-firebase-words"
import type { FirebaseWord } from "@/lib/firebase"

interface WordManagementScreenProps {
  onNavigate: (screen: Screen) => void
}

export function WordManagementScreen({ onNavigate }: WordManagementScreenProps) {
  const { dispatch } = useGame()
  const { words, isLoading, isConnected, addWord, updateWord, deleteWord, importWords } = useFirebaseWords()
  
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
  const [showDuplicates, setShowDuplicates] = useState(false)

  // Duplicate Detection
  const duplicates = useMemo(() => {
    const wordMap = new Map<string, FirebaseWord[]>()
    
    console.log('🔍 Checking for duplicates in', words.length, 'words')
    console.log('📋 Words structure:', words.slice(0, 2)) // Show first 2 words to see structure
    
    // Gruppiere Wörter nach lowercase word
    words.forEach(word => {
      console.log('🔸 Word object:', word)
      const wordText = word.word || (word as any).text || 'NO_WORD_FOUND'
      const key = wordText.toLowerCase().trim()
      console.log(`🔸 Processing: "${wordText}" -> key: "${key}"`)
      if (!wordMap.has(key)) {
        wordMap.set(key, [])
      }
      wordMap.get(key)!.push(word)
    })
    
    // Finde alle Duplikate (Gruppen mit mehr als einem Wort)
    const duplicateWords: FirebaseWord[] = []
    wordMap.forEach((group, key) => {
      if (group.length > 1) {
        console.log(`🔥 Found duplicate group for "${key}":`, group.length, 'words')
        duplicateWords.push(...group)
      }
    })
    
    console.log('📊 Total duplicates found:', duplicateWords.length)
    return duplicateWords
  }, [words])

  const duplicateGroups = useMemo(() => {
    const wordMap = new Map<string, FirebaseWord[]>()
    
    // Gruppiere Wörter nach lowercase word
    words.forEach(word => {
      const key = word.word.toLowerCase().trim()
      if (!wordMap.has(key)) {
        wordMap.set(key, [])
      }
      wordMap.get(key)!.push(word)
    })
    
    // Finde alle Duplikate-Gruppen
    const groups: FirebaseWord[][] = []
    wordMap.forEach(group => {
      if (group.length > 1) {
        groups.push(group)
      }
    })
    
    return groups
  }, [words])

  // Synchronize Firebase words with Game Context
  useEffect(() => {
    const wordEntries: WordEntry[] = words.map(word => ({
      word: word.word,
      category: word.category,
      imposterTip: word.imposterTip
    }))
    dispatch({ type: "SET_WORD_ENTRIES", wordEntries })
  }, [words, dispatch])

  // Check for duplicates whenever words change
  useEffect(() => {
    if (words.length > 0 && duplicates.length > 0) {
      setShowDuplicates(true)
      setLastSyncMessage(`⚠️ ${duplicates.length} Duplikate in der Datenbank gefunden!`)
      setTimeout(() => setLastSyncMessage(""), 3000)
    } else if (duplicates.length === 0 && showDuplicates) {
      setShowDuplicates(false)
    }
  }, [duplicates, words, showDuplicates])

  // Helper Functions
  const showSyncMessage = useCallback((message: string) => {
    setLastSyncMessage(message)
    const timer = setTimeout(() => setLastSyncMessage(""), 3000)
    return () => clearTimeout(timer)
  }, [])

  const requirePassword = (action: string) => {
    setPendingAction(action)
    setShowPasswordInput(true)
  }

  const handlePasswordSuccess = () => {
    setCanEdit(true)
    setShowPasswordInput(false)
    setPendingAction("")
    showSyncMessage("Admin-Modus aktiviert - Vollzugriff auf Firebase-Datenbank")
    
    // Check for duplicates after a short delay to allow state to settle
    setTimeout(() => {
      if (duplicates.length > 0) {
        setShowDuplicates(true)
        showSyncMessage(`⚠️ ${duplicates.length} Duplikate in der Datenbank gefunden!`)
      }
    }, 500)
  }

  // CRUD Functions
  const handleAddWord = async () => {
    if (!newWord.trim() || !newCategory.trim() || !newTip.trim()) return

    const success = await addWord({
      word: newWord.trim(),
      category: newCategory.trim(),
      imposterTip: newTip.trim(),
      dateAdded: new Date().toISOString(),
      addedBy: "Admin"
    })

    if (success) {
      showSyncMessage(`Wort "${newWord.trim()}" zur Firebase-Datenbank hinzugefügt`)
      setNewWord("")
      setNewCategory("")
      setNewTip("")
    } else {
      alert("Fehler beim Hinzufügen des Wortes")
    }
  }

  const handleDeleteWord = async (wordId: string, wordText: string) => {
    if (!confirm(`Möchtest du das Wort "${wordText}" wirklich löschen?`)) return

    const success = await deleteWord(wordId)
    if (success) {
      showSyncMessage(`Wort "${wordText}" aus der Firebase-Datenbank entfernt`)
    } else {
      alert("Fehler beim Löschen des Wortes")
    }
  }

  const handleEditWord = (word: FirebaseWord) => {
    if (!canEdit) {
      requirePassword("Wort bearbeiten")
      return
    }
    
    setEditingId(word.id)
    setEditWord(word.word)
    setEditCategory(word.category)
    setEditTip(word.imposterTip)
  }

  const handleSaveEdit = async () => {
    if (!editingId || !editWord.trim() || !editCategory.trim() || !editTip.trim()) return

    const originalWord = words.find(w => w.id === editingId)
    if (!originalWord) return

    const success = await updateWord(editingId, {
      word: editWord.trim(),
      category: editCategory.trim(),
      imposterTip: editTip.trim(),
      dateAdded: originalWord.dateAdded,
      addedBy: originalWord.addedBy || "Admin"
    })

    if (success) {
      showSyncMessage(`Wort "${editWord.trim()}" in der Firebase-Datenbank aktualisiert`)
      setEditingId(null)
      setEditWord("")
      setEditCategory("")
      setEditTip("")
    } else {
      alert("Fehler beim Aktualisieren des Wortes")
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditWord("")
    setEditCategory("")
    setEditTip("")
  }

  const handleDeleteAllDuplicates = async () => {
    if (duplicateGroups.length === 0) return

    const totalDuplicates = duplicates.length
    const groupsCount = duplicateGroups.length

    const confirmMessage = `Möchtest du alle älteren Duplikate löschen?\n\n` +
      `• ${groupsCount} Duplikat-Gruppen gefunden\n` +
      `• ${totalDuplicates} Wörter insgesamt\n` +
      `• Die neueste Version jeder Gruppe wird behalten\n` +
      `• ${totalDuplicates - groupsCount} Wörter werden gelöscht`

    if (!confirm(confirmMessage)) return

    let deletedCount = 0
    let errorCount = 0

    // Durchlaufe alle Duplikat-Gruppen
    for (const group of duplicateGroups) {
      // Sortiere nach Datum (neueste zuerst)
      const sortedGroup = [...group].sort((a, b) => 
        new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
      )
      
      // Behalte das neueste (erstes Element), lösche den Rest
      const toDelete = sortedGroup.slice(1)
      
      for (const word of toDelete) {
        try {
          const success = await deleteWord(word.id)
          if (success) {
            deletedCount++
          } else {
            errorCount++
          }
        } catch (error) {
          console.error(`Fehler beim Löschen von ${word.word}:`, error)
          errorCount++
        }
      }
    }

    if (errorCount === 0) {
      showSyncMessage(`✅ ${deletedCount} Duplikate erfolgreich gelöscht! ${groupsCount} eindeutige Wörter behalten.`)
    } else {
      showSyncMessage(`⚠️ ${deletedCount} Duplikate gelöscht, ${errorCount} Fehler aufgetreten.`)
    }
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(words, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `firebase-words-${new Date().toISOString().split('T')[0]}.json`
    
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

      const success = await importWords(importedWords)
      if (success) {
        showSyncMessage(`${importedWords.length} Wörter in die Firebase-Datenbank importiert`)
      } else {
        alert("Fehler beim Importieren der Wörter")
      }
    } catch (error) {
      alert("Fehler beim Lesen der Datei")
    }
    
    // Reset file input
    event.target.value = ""
  }

  // Filter words
  const filteredEntries = words.filter(word =>
    word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    word.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    word.imposterTip.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const categories = [...new Set(words.map(word => word.category))]

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => onNavigate("start-menu")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Wörter durchstöbern</h1>
        </div>

        {/* Firebase Connection Status */}
        <Card className={`${isConnected ? 'bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800'}`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {isLoading ? (
                <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse" />
              ) : isConnected ? (
                <Wifi className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-600 dark:text-red-400" />
              )}
              <div className="text-sm">
                <p className={`font-medium ${isConnected ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                  {isLoading ? 'Verbinde mit Firebase...' : isConnected ? 'Firebase-Datenbank verbunden' : 'Firebase-Verbindung unterbrochen'}
                </p>
                <p className={`${isConnected ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                  {isConnected 
                    ? 'Wörter werden live synchronisiert zwischen allen Geräten'
                    : 'Keine Verbindung zur Cloud-Datenbank'
                  }
                </p>
              </div>
            </div>
            {lastSyncMessage && (
              <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-900/50 rounded text-xs text-blue-800 dark:text-blue-200">
                {lastSyncMessage}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Password Protection - Only shown for CRUD operations */}
        {!canEdit && (
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <Database className="h-5 w-5" />
                Firebase-Datenbank (Nur-Lesen-Modus)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700 dark:text-blue-300 text-sm mb-4">
                Du kannst alle Wörter einsehen und durchsuchen. Für das Bearbeiten, Hinzufügen oder Löschen von Wörtern
                benötigst du das Admin-Passwort.
              </p>
              {!showPasswordInput ? (
                <Button 
                  variant="outline" 
                  onClick={() => setShowPasswordInput(true)}
                  className="w-full h-12 border-blue-300 text-blue-800 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-200 dark:hover:bg-blue-900/50"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Admin-Modus aktivieren (zum Bearbeiten)
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
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-green-700 dark:text-green-300 text-sm font-medium">
                    Admin-Modus aktiv - Vollzugriff auf Firebase-Datenbank
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCanEdit(false)}
                  className="text-green-700 border-green-300 hover:bg-green-100 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-900/50"
                >
                  Beenden
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Duplicate Detection */}
        {duplicateGroups.length > 0 && (
          <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                <AlertTriangle className="h-5 w-5" />
                Duplikate gefunden ({duplicates.length} Wörter)
                <div className="ml-auto flex gap-2">
                  {canEdit && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteAllDuplicates}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Alle älteren löschen
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDuplicates(!showDuplicates)}
                    className="text-orange-700 hover:bg-orange-100 dark:text-orange-300 dark:hover:bg-orange-900/50"
                  >
                    {showDuplicates ? 'Ausblenden' : 'Anzeigen'}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            {showDuplicates && (
              <CardContent>
                {!canEdit && (
                  <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-950/50 rounded-lg border border-yellow-200 dark:border-yellow-700">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        Admin-Modus erforderlich
                      </span>
                    </div>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      Um Duplikate zu löschen, musst du zuerst den Admin-Modus mit dem Passwort aktivieren.
                    </p>
                  </div>
                )}
                {canEdit && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Auto-Bereinigung verfügbar
                      </span>
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                      Der "Alle älteren löschen" Button behält automatisch die <strong>neueste Version</strong> jedes Duplikats 
                      und löscht alle älteren Versionen basierend auf dem Hinzufügungsdatum.
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-green-100 dark:bg-green-950/50 p-2 rounded">
                        <strong className="text-green-800 dark:text-green-200">Behalten:</strong>
                        <br />✓ {duplicateGroups.length} neueste Wörter
                      </div>
                      <div className="bg-red-100 dark:bg-red-950/50 p-2 rounded">
                        <strong className="text-red-800 dark:text-red-200">Löschen:</strong>
                        <br />✗ {duplicates.length - duplicateGroups.length} ältere Versionen
                      </div>
                    </div>
                  </div>
                )}
                <div className="space-y-4">
                  {duplicateGroups.map((group, groupIndex) => {
                    // Sortiere Gruppe nach Datum (neueste zuerst) für Anzeige
                    const sortedGroup = [...group].sort((a, b) => 
                      new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
                    )
                    return (
                      <div key={groupIndex} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-700">
                        <div className="flex items-center gap-2 mb-3">
                          <Copy className="h-4 w-4 text-orange-600" />
                          <span className="font-medium text-orange-800 dark:text-orange-200">
                            "{group[0].word}" ({group.length} Duplikate)
                          </span>
                        </div>
                        <div className="space-y-2">
                          {sortedGroup.map((word, index) => (
                            <div key={word.id} className={`flex items-center justify-between p-2 rounded border ${
                              index === 0 
                                ? 'bg-green-50 dark:bg-green-950/25 border-green-200 dark:border-green-700' 
                                : 'bg-red-50 dark:bg-red-950/25 border-red-200 dark:border-red-700'
                            }`}>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm">
                                    <span className="font-medium">{word.word}</span> 
                                    <span className="text-muted-foreground"> • {word.category}</span>
                                  </p>
                                  {index === 0 && (
                                    <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">NEUESTE</span>
                                  )}
                                  {index > 0 && (
                                    <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">ÄLTER</span>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">{word.imposterTip}</p>
                                <p className="text-xs text-muted-foreground">
                                  ID: {word.id} • {new Date(word.dateAdded).toLocaleDateString('de-DE')} {new Date(word.dateAdded).toLocaleTimeString('de-DE')}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteWord(word.id, word.word)}
                                className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-950/50"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 text-xs text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/50 p-2 rounded">
                          💡 Die Auto-Bereinigung behält automatisch die grün markierte (neueste) Version
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Import/Export - Export available for everyone, Import only for admins */}
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" className="flex-1 bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Exportieren
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
              <Button asChild variant="outline" className="w-full bg-transparent">
                <label htmlFor="import-file" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Importieren
                </label>
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => requirePassword("Wörter importieren")} 
              variant="outline" 
              className="flex-1 bg-transparent"
            >
              <Lock className="h-4 w-4 mr-2" />
              Importieren (Admin)
            </Button>
          )}
        </div>

        {canEdit && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Neues Wort zur Firebase-Datenbank hinzufügen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="new-word">Wort</Label>
                  <Input
                    id="new-word"
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    placeholder="z.B. Apfel"
                  />
                </div>
                <div>
                  <Label htmlFor="new-category">Kategorie</Label>
                  <Input
                    id="new-category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="z.B. Obst"
                    list="categories"
                  />
                  <datalist id="categories">
                    {categories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <Label htmlFor="new-tip">Imposter-Tipp</Label>
                  <Textarea
                    id="new-tip"
                    value={newTip}
                    onChange={(e) => setNewTip(e.target.value)}
                    placeholder="z.B. Etwas Essbares, meist rot oder grün"
                    rows={2}
                  />
                </div>
                <Button
                  onClick={handleAddWord}
                  disabled={!newWord.trim() || !newCategory.trim() || !newTip.trim() || !isConnected}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Zur Firebase-Datenbank hinzufügen
                </Button>
              </CardContent>
            </Card>
        )}

        {/* Search - Available for everyone */}
        <Card>
          <CardHeader>
            <CardTitle>Wörter durchsuchen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nach Wort, Kategorie oder Tipp suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchTerm && (
              <p className="text-xs text-muted-foreground mt-2">
                {filteredEntries.length} von {words.length} Wörtern gefunden
              </p>
            )}
          </CardContent>
        </Card>

        {/* Words List - Always accessible for reading */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                Firebase-Wörter ({filteredEntries.length} von {words.length})
                {!canEdit && <span className="text-xs ml-2 text-muted-foreground">(Nur-Lesen)</span>}
              </span>
              <Database className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-muted-foreground py-4">Lade Wörter aus Firebase...</p>
            ) : filteredEntries.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                {searchTerm ? "Keine Wörter gefunden" : "Noch keine Wörter in der Firebase-Datenbank"}
              </p>
            ) : (
              <div className="space-y-3">
                {filteredEntries.map((word) => (
                  <div key={word.id} className="border rounded-lg p-3">
                    {editingId === word.id ? (
                      <div className="space-y-3">
                        <Input
                          value={editWord}
                          onChange={(e) => setEditWord(e.target.value)}
                          placeholder="Wort"
                        />
                        <Input
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          placeholder="Kategorie"
                        />
                        <Textarea
                          value={editTip}
                          onChange={(e) => setEditTip(e.target.value)}
                          placeholder="Imposter-Tipp"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveEdit}>
                            Speichern
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                            Abbrechen
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium">{word.word}</h3>
                            <p className="text-sm text-muted-foreground">Kategorie: {word.category}</p>
                            <p className="text-sm text-muted-foreground">Tipp: {word.imposterTip}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Hinzugefügt: {new Date(word.dateAdded).toLocaleDateString('de-DE')}
                              {word.addedBy && ` von ${word.addedBy}`}
                            </p>
                          </div>
                          {canEdit && isConnected && (
                            <div className="flex gap-2 ml-4">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleEditWord(word)}
                                className="h-8 w-8"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDeleteWord(word.id, word.word)}
                                className="h-8 w-8 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          {!canEdit && (
                            <div className="flex items-center gap-2 ml-4">
                              <Database className="h-4 w-4 text-blue-500" />
                              <span className="text-xs text-blue-600">Nur-Lesen</span>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics - Available for everyone */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Firebase-Statistiken
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">{words.length}</div>
                <div className="text-xs text-muted-foreground">Firebase</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">{categories.length}</div>
                <div className="text-xs text-muted-foreground">Kategorien</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-600">{filteredEntries.length}</div>
                <div className="text-xs text-muted-foreground">Gefiltert</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}