"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Trash2, Search, Database, Lock, Cloud, Wifi, WifiOff, Download, Upload, Edit, AlertCircle } from "lucide-react"
import { PasswordInput } from "@/components/ui/password-input"
import type { Screen } from "@/app/page"
import { useGame, type WordEntry } from "@/components/game-context"
import { database, type FirebaseWord } from "@/lib/firebase"
import { ref, push, onValue, remove, set, off } from "firebase/database"

interface WordManagementScreenProps {
  onNavigate: (screen: Screen) => void
}

export function WordManagementScreen({ onNavigate }: WordManagementScreenProps) {
  const { dispatch } = useGame()
  
  // Firebase State
  const [firebaseWords, setFirebaseWords] = useState<FirebaseWord[]>([])
  const [isConnected, setIsConnected] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  
  // Form States
  const [newWord, setNewWord] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [newHint, setNewHint] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editWord, setEditWord] = useState("")
  const [editCategory, setEditCategory] = useState("")
  const [editHint, setEditHint] = useState("")
  
  // Auth State
  const [showPasswordInput, setShowPasswordInput] = useState(false)
  const [canEdit, setCanEdit] = useState(false)
  const [lastSyncMessage, setLastSyncMessage] = useState<string>("")
  const [pendingAction, setPendingAction] = useState<string>("")

  // Firebase Words laden und live updates
  useEffect(() => {
    setIsLoading(true)
    const wordsRef = ref(database, 'words')
    
    const unsubscribe = onValue(wordsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const wordsArray: FirebaseWord[] = Object.entries(data).map(([id, word]: [string, any]) => ({
          id,
          ...word
        }))
        setFirebaseWords(wordsArray)
        
        // Game Context synchronisieren
        const wordEntries: WordEntry[] = wordsArray.map(word => ({
          word: word.word,
          category: word.category,
          imposterTip: word.imposterTip
        }))
        dispatch({ type: "SET_WORD_ENTRIES", wordEntries })
      } else {
        setFirebaseWords([])
        dispatch({ type: "SET_WORD_ENTRIES", wordEntries: [] })
      }
      setIsConnected(true)
      setIsLoading(false)
    }, (error) => {
      console.error("Firebase connection error:", error)
      setIsConnected(false)
      setIsLoading(false)
    })

    return () => {
      off(wordsRef, 'value', unsubscribe)
    }
  }, [dispatch])

  // Helper Functions
  const showSyncMessage = (message: string) => {
    setLastSyncMessage(message)
    setTimeout(() => setLastSyncMessage(""), 3000)
  }

  const requirePassword = (action: string) => {
    setPendingAction(action)
    setShowPasswordInput(true)
  }

  const handlePasswordSuccess = () => {
    setCanEdit(true)
    setShowPasswordInput(false)
    setPendingAction("")
  }

  // Firebase Operations
  const addWordToFirebase = async () => {
    if (!canEdit) {
      requirePassword("Wort hinzufügen")
      return
    }

    if (!newWord.trim() || !newCategory.trim() || !newHint.trim()) return

    try {
      const wordsRef = ref(database, 'words')
      const newWordData: Omit<FirebaseWord, 'id'> = {
        word: newWord.trim(),
        category: newCategory.trim(),
        imposterTip: newHint.trim(),
        dateAdded: new Date().toISOString(),
        addedBy: "Admin"
      }
      
      await push(wordsRef, newWordData)
      showSyncMessage(`Wort "${newWord.trim()}" zur Firebase-Datenbank hinzugefügt`)
      
      // Form zurücksetzen
      setNewWord("")
      setNewCategory("")
      setNewHint("")
    } catch (error) {
      console.error("Error adding word:", error)
      alert("Fehler beim Hinzufügen des Wortes zur Datenbank")
    }
  }

  const deleteWordFromFirebase = async (wordId: string, wordText: string) => {
    if (!canEdit) {
      requirePassword("Wort löschen")
      return
    }

    try {
      const wordRef = ref(database, `words/${wordId}`)
      await remove(wordRef)
      showSyncMessage(`Wort "${wordText}" aus der Firebase-Datenbank entfernt`)
    } catch (error) {
      console.error("Error deleting word:", error)
      alert("Fehler beim Löschen des Wortes")
    }
  }

  const startEditWord = (word: FirebaseWord) => {
    if (!canEdit) {
      requirePassword("Wort bearbeiten")
      return
    }
    
    setEditingId(word.id)
    setEditWord(word.word)
    setEditCategory(word.category)
    setEditHint(word.imposterTip)
  }

  const saveEditWord = async () => {
    if (!editingId || !editWord.trim() || !editCategory.trim() || !editHint.trim()) return

    try {
      const wordRef = ref(database, `words/${editingId}`)
      const updatedWord = {
        word: editWord.trim(),
        category: editCategory.trim(),
        imposterTip: editHint.trim(),
        dateAdded: firebaseWords.find(w => w.id === editingId)?.dateAdded || new Date().toISOString(),
        addedBy: firebaseWords.find(w => w.id === editingId)?.addedBy || "Admin"
      }
      
      await set(wordRef, updatedWord)
      showSyncMessage(`Wort "${editWord.trim()}" in der Firebase-Datenbank aktualisiert`)
      
      setEditingId(null)
      setEditWord("")
      setEditCategory("")
      setEditHint("")
    } catch (error) {
      console.error("Error updating word:", error)
      alert("Fehler beim Aktualisieren des Wortes")
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditWord("")
    setEditCategory("")
    setEditHint("")
  }

  const importWordsToFirebase = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEdit) {
      requirePassword("Wörter importieren")
      return
    }

    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const importedWords = JSON.parse(e.target?.result as string) as WordEntry[]
        if (!Array.isArray(importedWords)) {
          alert("Ungültiges Dateiformat")
          return
        }

        const wordsRef = ref(database, 'words')
        let importCount = 0

        for (const word of importedWords) {
          const newWordData: Omit<FirebaseWord, 'id'> = {
            word: word.word,
            category: word.category,
            imposterTip: word.imposterTip,
            dateAdded: new Date().toISOString(),
            addedBy: "Import"
          }
          await push(wordsRef, newWordData)
          importCount++
        }

        showSyncMessage(`${importCount} Wörter erfolgreich in die Firebase-Datenbank importiert`)
      } catch (error) {
        console.error("Import error:", error)
        alert("Fehler beim Importieren der Datei")
      }
    }
    reader.readAsText(file)
    
    // Reset file input
    event.target.value = ""
  }

  const exportWords = () => {
    const dataStr = JSON.stringify(firebaseWords.map(w => ({
      word: w.word,
      category: w.category,
      imposterTip: w.imposterTip
    })), null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `imposter-words-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Filter words
  const filteredWords = firebaseWords.filter(word =>
    word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    word.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    word.imposterTip.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const categories = [...new Set(firebaseWords.map(word => word.category))]

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => onNavigate("start-menu")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Wörter verwalten</h1>
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
                  {isLoading ? '🔄 Verbinde mit Firebase...' : isConnected ? '🔥 Firebase-Datenbank verbunden' : '❌ Firebase-Verbindung unterbrochen'}
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
                ✅ {lastSyncMessage}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Password Protection */}
        {!canEdit && (
          <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <Lock className="h-5 w-5" />
                🔐 Firebase-Datenbank schreibgeschützt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-amber-700 dark:text-amber-300 text-sm mb-4">
                Die Firebase-Datenbank ist schreibgeschützt. Um Wörter hinzuzufügen, zu bearbeiten oder zu löschen,
                authentifizieren Sie sich mit dem Admin-Passwort.
              </p>
              {!showPasswordInput ? (
                <Button 
                  variant="outline" 
                  onClick={() => setShowPasswordInput(true)}
                  className="w-full h-12 border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900/50"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Admin-Passwort eingeben
                </Button>
              ) : (
                <PasswordInput
                  onCorrectPassword={handlePasswordSuccess}
                  title={pendingAction ? `Authentifizierung für: ${pendingAction}` : "Firebase-Datenbank entsperren"}
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
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-green-700 dark:text-green-300 text-sm font-medium">
                  ✅ Admin-Modus aktiv - Alle Änderungen werden in Firebase gespeichert
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add/Import Controls */}
        {canEdit && (
          <>
            {/* Import/Export */}
            <div className="flex gap-2">
              <Button onClick={exportWords} variant="outline" className="flex-1 bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Exportieren
              </Button>
              <div className="flex-1">
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={importWordsToFirebase} 
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
            </div>

            {/* Add New Word */}
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
                  <Label htmlFor="new-hint">Imposter-Tipp</Label>
                  <Textarea
                    id="new-hint"
                    value={newHint}
                    onChange={(e) => setNewHint(e.target.value)}
                    placeholder="z.B. Etwas Essbares, meist rot oder grün"
                    rows={2}
                  />
                </div>
                <Button
                  onClick={addWordToFirebase}
                  disabled={!newWord.trim() || !newCategory.trim() || !newHint.trim() || !isConnected}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Zur Firebase-Datenbank hinzufügen
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {/* Search */}
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
          </CardContent>
        </Card>

        {/* Words List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                Firebase-Wörter ({filteredWords.length} von {firebaseWords.length})
                {!canEdit && <Lock className="inline h-4 w-4 ml-2 text-muted-foreground" />}
              </span>
              <Database className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-muted-foreground py-4">Lade Wörter aus Firebase...</p>
            ) : filteredWords.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                {searchTerm ? "Keine Wörter gefunden" : "Noch keine Wörter in der Firebase-Datenbank"}
              </p>
            ) : (
              <div className="space-y-3">
                {filteredWords.map((word) => (
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
                          value={editHint}
                          onChange={(e) => setEditHint(e.target.value)}
                          placeholder="Imposter-Tipp"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={saveEditWord}>
                            Speichern
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit}>
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
                                onClick={() => startEditWord(word)}
                                className="h-8 w-8"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => deleteWordFromFirebase(word.id, word.word)}
                                className="h-8 w-8"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          {!canEdit && (
                            <div className="flex items-center gap-2 ml-4">
                              <Lock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Schreibgeschützt</span>
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

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Statistiken</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold">{firebaseWords.length}</div>
                <div className="text-xs text-muted-foreground">Firebase</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{categories.length}</div>
                <div className="text-xs text-muted-foreground">Kategorien</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{filteredWords.length}</div>
                <div className="text-xs text-muted-foreground">Gefiltert</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
