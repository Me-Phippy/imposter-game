"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Trash2, Edit, Download, Upload } from "lucide-react"
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

  const handleAddWord = () => {
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

        <Card>
          <CardHeader>
            <CardTitle>Wortliste ({state.wordEntries.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {state.wordEntries.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Noch keine Wörter hinzugefügt</p>
            ) : (
              <div className="space-y-3">
                {state.wordEntries.map((entry, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    {editingIndex === index ? (
                      <div className="space-y-2">
                        <Input value={editWord} onChange={(e) => setEditWord(e.target.value)} placeholder="Wort" />
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
                            <h3 className="font-semibold">{entry.word}</h3>
                            <p className="text-sm text-muted-foreground">Kategorie: {entry.category}</p>
                            <p className="text-sm text-muted-foreground">Tipp: {entry.imposterTip}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" onClick={() => handleEditWord(index)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => handleDeleteWord(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
