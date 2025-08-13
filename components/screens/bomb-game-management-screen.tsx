"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Plus, Trash2, Save, AlertCircle, CheckCircle, Bomb } from "lucide-react"
import { useBombGameWords } from '@/hooks/use-game-databases'
import type { BombGameWord } from '@/lib/game-databases'
import type { Screen } from '@/app/page'

interface BombGameManagementScreenProps {
  onNavigate: (screen: Screen) => void
}

export function BombGameManagementScreen({ onNavigate }: BombGameManagementScreenProps) {
  const { words, isLoading, isConnected, addWord, removeWord } = useBombGameWords()
  const [newWord, setNewWord] = useState({
    word: '',
    category: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    timeLimit: 30
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleAddWord = async () => {
    if (!newWord.word.trim() || !newWord.category.trim()) {
      return
    }

    setIsSaving(true)
    try {
      const success = await addWord({
        word: newWord.word.trim(),
        category: newWord.category.trim(),
        difficulty: newWord.difficulty,
        timeLimit: newWord.timeLimit,
        addedBy: 'Manual'
      })

      if (success) {
        setNewWord({
          word: '',
          category: '',
          difficulty: 'medium',
          timeLimit: 30
        })
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 2000)
      }
    } catch (error) {
      console.error('Error adding word:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteWord = async (wordId: string) => {
    await removeWord(wordId)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500'
      case 'medium': return 'bg-yellow-500'
      case 'hard': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-purple-100 to-blue-200 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onNavigate("database-management")}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Bomb className="h-8 w-8 text-red-500" />
                <div>
                  <CardTitle className="text-2xl">💣 Bomb Game Verwaltung</CardTitle>
                  <CardDescription>
                    Verwalte Wörter für das explosive Wortspiel
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <Badge variant="secondary" className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Verbunden ({words.length} Wörter)
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Nicht verbunden
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add New Word */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Neues Wort hinzufügen
              </CardTitle>
              <CardDescription>
                Erstelle ein neues Wort für das Bomb Game
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="word">Wort</Label>
                <Input
                  id="word"
                  placeholder="z.B. Schokolade"
                  value={newWord.word}
                  onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Kategorie</Label>
                <Input
                  id="category"
                  placeholder="z.B. Essen"
                  value={newWord.category}
                  onChange={(e) => setNewWord({ ...newWord, category: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Schwierigkeitsgrad</Label>
                <Select value={newWord.difficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setNewWord({ ...newWord, difficulty: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Einfach</SelectItem>
                    <SelectItem value="medium">Mittel</SelectItem>
                    <SelectItem value="hard">Schwer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeLimit">Zeitlimit (Sekunden)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  min="10"
                  max="120"
                  value={newWord.timeLimit}
                  onChange={(e) => setNewWord({ ...newWord, timeLimit: parseInt(e.target.value) || 30 })}
                />
              </div>

              <Button 
                onClick={handleAddWord}
                disabled={!newWord.word.trim() || !newWord.category.trim() || isSaving}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Speichere..." : "Wort hinzufügen"}
              </Button>

              {saveSuccess && (
                <div className="text-center text-green-600 font-medium">
                  Wort erfolgreich hinzugefügt!
                </div>
              )}
            </CardContent>
          </Card>

          {/* Existing Words */}
          <Card>
            <CardHeader>
              <CardTitle>Vorhandene Wörter</CardTitle>
              <CardDescription>
                Alle Bomb Game Wörter verwalten
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Lade Wörter...</div>
              ) : words.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Keine Wörter vorhanden. Füge das erste Wort hinzu!
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {words.map((word) => (
                      <div key={word.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{word.word}</div>
                          <div className="text-sm text-muted-foreground">
                            {word.category} • {word.timeLimit}s
                          </div>
                          <Badge className={`${getDifficultyColor(word.difficulty)} text-white text-xs mt-1`}>
                            {word.difficulty}
                          </Badge>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteWord(word.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Statistiken</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{words.length}</div>
                <div className="text-sm text-muted-foreground">Gesamt Wörter</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {words.filter(w => w.difficulty === 'easy').length}
                </div>
                <div className="text-sm text-muted-foreground">Einfach</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {words.filter(w => w.difficulty === 'medium').length}
                </div>
                <div className="text-sm text-muted-foreground">Mittel</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {words.filter(w => w.difficulty === 'hard').length}
                </div>
                <div className="text-sm text-muted-foreground">Schwer</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
