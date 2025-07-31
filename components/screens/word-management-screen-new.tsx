"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Trash2, Edit, Download, Upload, Search, Lock, Database, AlertCircle } from "lucide-react"
import { PasswordInput } from "@/components/ui/password-input"
import type { Screen } from "@/app/page"
import { useGame, type WordEntry } from "@/components/game-context"

interface WordManagementScreenProps {
  onNavigate: (screen: Screen) => void
}

export function WordManagementScreen({ onNavigate }: WordManagementScreenProps) {
  const { state, dispatch } = useGame()
  const [newWord, setNewWord] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [newTip, setNewTip] = useState("")
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editWord, setEditWord] = useState("")
  const [editCategory, setEditCategory] = useState("")
  const [editTip, setEditTip] = useState("")
  const [showPasswordInput, setShowPasswordInput] = useState(false)
  const [canEdit, setCanEdit] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Lade Wörter aus der Datenbank beim Start und synchronisiere sie
  useEffect(() => {
    const savedWords = localStorage.getItem("imposter-words-database")
    if (savedWords) {
      const words = JSON.parse(savedWords)
      const wordEntries: WordEntry[] = words.map((word: any) => ({
        word: word.text,
        category: word.category,
        imposterTip: `Tipp für ${word.text}`
      }))
      dispatch({ type: "SET_WORD_ENTRIES", wordEntries })
    }
  }, [dispatch])

  const handlePasswordSuccess = () => {
    setCanEdit(true)
    setShowPasswordInput(false)
  }

  const handleAddWord = () => {
    if (!canEdit) {
      setShowPasswordInput(true)
      return
    }
    
    if (newWord.trim() && newCategory.trim() && newTip.trim()) {
      const wordEntry: WordEntry = {
        word: newWord.trim(),
        category: newCategory.trim(),
        imposterTip: newTip.trim(),
      }
      dispatch({ type: "ADD_WORD_ENTRY", wordEntry })
      setNewWord("")
      setNewCategory("")
      setNewTip("")
    }
  }

  const handleEditWord = (index: number) => {
    if (!canEdit) {
      setShowPasswordInput(true)
      return
    }
    
    const entry = state.wordEntries[index]
    setEditingIndex(index)
    setEditWord(entry.word)
    setEditCategory(entry.category)
    setEditTip(entry.imposterTip)
  }

  const handleSaveEdit = () => {
    if (editingIndex !== null && editWord.trim() && editCategory.trim() && editTip.trim()) {
      const wordEntry: WordEntry = {
        word: editWord.trim(),
        category: editCategory.trim(),
        imposterTip: editTip.trim(),
      }
      dispatch({ type: "UPDATE_WORD_ENTRY", index: editingIndex, wordEntry })
      setEditingIndex(null)
      setEditWord("")
      setEditCategory("")
      setEditTip("")
    }
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditWord("")
    setEditCategory("")
    setEditTip("")
  }

  const handleDeleteWord = (index: number) => {
    if (!canEdit) {
      setShowPasswordInput(true)
      return
    }
    dispatch({ type: "REMOVE_WORD_ENTRY", index })
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(state.wordEntries, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "imposter-words.json"
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEdit) {
      setShowPasswordInput(true)
      return
    }
    
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedWords = JSON.parse(e.target?.result as string) as WordEntry[]
          if (Array.isArray(importedWords)) {
            dispatch({ type: "IMPORT_WORDS", wordEntries: importedWords })
          }
        } catch (error) {
          alert("Fehler beim Importieren der Datei")
        }
      }
      reader.readAsText(file)
    }
  }

  const filteredEntries = state.wordEntries.filter(entry =>
    entry.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.imposterTip.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const categories = [...new Set(state.wordEntries.map((entry) => entry.category))]

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => onNavigate("start-menu")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Wörter verwalten</h1>
        </div>

        {/* Hinweis auf Datenbankabhängigkeit */}
        <Card className="bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Database className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                  Datenbankbasierte Wörterliste
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  Diese Liste wird automatisch aus der Wörter-Datenbank geladen. 
                  Änderungen erfordern eine Passwort-Authentifizierung.
                </p>
                <Button 
                  variant="link" 
                  className="text-blue-600 dark:text-blue-400 p-0 h-auto mt-2"
                  onClick={() => onNavigate("word-database" as Screen)}
                >
                  Zur Wörter-Datenbank wechseln →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Passwort-geschützte Bearbeitungsoptionen */}
        {!canEdit && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Bearbeitungsmodus entsperren
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!showPasswordInput ? (
                <Button 
                  variant="outline" 
                  onClick={() => setShowPasswordInput(true)}
                  className="w-full h-12"
                >
                  Passwort eingeben um Wörter bearbeiten zu können
                </Button>
              ) : (
                <PasswordInput
                  onCorrectPassword={handlePasswordSuccess}
                  title="Bearbeitungsmodus entsperren"
                  placeholder="Passwort für Wort-Bearbeitung"
                />
              )}
            </CardContent>
          </Card>
        )}

        {canEdit && (
          <>
            {/* Import/Export */}
            <div className="flex gap-2">
              <Button onClick={handleExport} variant="outline" className="flex-1 bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Exportieren
              </Button>
              <div className="flex-1">
                <input type="file" accept=".json" onChange={handleImport} className="hidden" id="import-file" />
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <label htmlFor="import-file" className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Importieren
                  </label>
                </Button>
              </div>
            </div>

            {/* Neues Wort hinzufügen */}
            <Card>
              <CardHeader>
                <CardTitle>Neues Wort hinzufügen</CardTitle>
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
                    placeholder="z.B. Etwas Essbares"
                    rows={2}
                  />
                </div>
                <Button
                  onClick={handleAddWord}
                  disabled={!newWord.trim() || !newCategory.trim() || !newTip.trim()}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Hinzufügen
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {/* Suchfunktion */}
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

        {/* Wortliste */}
        <Card>
          <CardHeader>
            <CardTitle>
              Wortliste ({filteredEntries.length} von {state.wordEntries.length})
              {!canEdit && (
                <Lock className="inline h-4 w-4 ml-2 text-muted-foreground" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredEntries.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                {searchTerm ? "Keine Wörter gefunden" : "Noch keine Wörter hinzugefügt"}
              </p>
            ) : (
              <div className="space-y-3">
                {filteredEntries.map((entry, index) => {
                  const actualIndex = state.wordEntries.findIndex(e => e === entry)
                  return (
                    <div key={actualIndex} className="border rounded-lg p-3">
                      {editingIndex === actualIndex ? (
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
                              <h3 className="font-medium">{entry.word}</h3>
                              <p className="text-sm text-muted-foreground">Kategorie: {entry.category}</p>
                              <p className="text-sm text-muted-foreground">Tipp: {entry.imposterTip}</p>
                            </div>
                            {canEdit && (
                              <div className="flex gap-2 ml-4">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleEditWord(actualIndex)}
                                  className="h-8 w-8"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleDeleteWord(actualIndex)}
                                  className="h-8 w-8"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                            {!canEdit && (
                              <div className="flex items-center gap-2 ml-4">
                                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Schreibgeschützt</span>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistiken */}
        <Card>
          <CardHeader>
            <CardTitle>Statistiken</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold">{state.wordEntries.length}</div>
                <div className="text-xs text-muted-foreground">Gesamt</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{categories.length}</div>
                <div className="text-xs text-muted-foreground">Kategorien</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{filteredEntries.length}</div>
                <div className="text-xs text-muted-foreground">Gefiltert</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
