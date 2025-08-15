"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Plus, Target, Users, BookOpen, Play } from "lucide-react"
import { useWordAssassination } from "@/components/word-assassination-context"
import type { Screen } from "@/app/page"

interface WordAssassinationSetupScreenProps {
  onNavigate: (screen: Screen) => void
}

export function WordAssassinationSetupScreen({ onNavigate }: WordAssassinationSetupScreenProps) {
  const { state, dispatch, globalPlayers } = useWordAssassination()
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [customWords, setCustomWords] = useState("")

  // Default words for Word Assassination
  const defaultWords = [
    "Banane", "Elefant", "Regenbogen", "Schokolade", "Astronaut",
    "Gitarre", "Vulkan", "Pingpongball", "Marmelade", "Dinosaurier",
    "Kühlschrank", "Marienkäfer", "Wassermelone", "Zauberer", "Rakete",
    "Schneemann", "Löwenzahn", "Luftballon", "Pirat", "Käsekuchen"
  ]

  const handlePlayerToggle = (playerId: string, checked: boolean) => {
    let newSelectedPlayers: string[]
    
    if (checked) {
      newSelectedPlayers = [...selectedPlayers, playerId]
    } else {
      newSelectedPlayers = selectedPlayers.filter((id) => id !== playerId)
    }

    setSelectedPlayers(newSelectedPlayers)
    dispatch({ type: 'SET_SELECTED_PLAYERS', playerIds: newSelectedPlayers })
  }

  const handleStartGame = () => {
    if (selectedPlayers.length < 2) return
    
    // Use custom words if provided, otherwise use default words
    const wordsToUse = customWords.trim() 
      ? customWords.split('\n').map(w => w.trim()).filter(w => w.length > 0)
      : defaultWords

    dispatch({ type: 'SET_WORDS', words: wordsToUse })
    dispatch({ type: 'START_ASSIGNMENT', globalPlayers })
    dispatch({ type: 'START_REVEAL' })
    
    // Navigate directly to reveal screen (skip assignment overview)
    setTimeout(() => {
      onNavigate('word-assassination-reveal')
    }, 100)
  }

  const canStartGame = selectedPlayers.length >= 2

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-red-950 dark:to-orange-950 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('start-menu')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          
          <div className="text-center flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-red-900 dark:text-red-100 mb-2 flex items-center justify-center gap-3">
              <Target className="h-8 w-8 sm:h-10 sm:w-10" />
              Word Assassination
            </h1>
            <p className="text-red-700 dark:text-red-300 text-sm sm:text-base">
              Jeder Spieler bekommt ein Ziel und ein Wort, das das Ziel sagen muss
            </p>
          </div>
        </div>

        {/* Game Rules */}
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl text-red-800 dark:text-red-200">
              🎯 Spielregeln
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-3">
            <div className="space-y-2 text-sm sm:text-base text-red-700 dark:text-red-300">
              <p><strong>1.</strong> Jeder Spieler bekommt eine andere Person als Ziel</p>
              <p><strong>2.</strong> Jeder bekommt ein geheimes Wort, das sein Ziel sagen muss</p>
              <p><strong>3.</strong> Versuche dein Ziel dazu zu bringen, dein Wort zu sagen</p>
              <p><strong>4.</strong> Wenn dein Ziel das Wort sagt, hast du gewonnen!</p>
              <p><strong>5.</strong> Sei vorsichtig - andere versuchen auch, dich zu täuschen</p>
            </div>
          </CardContent>
        </Card>

        {/* Player Management */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Users className="h-5 w-5" />
              Spieler auswählen ({selectedPlayers.length} ausgewählt)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            
            {globalPlayers.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  Keine Spieler verfügbar. Gehe zur Spielerverwaltung, um Spieler hinzuzufügen.
                </p>
                <Button
                  variant="outline"
                  onClick={() => onNavigate("player-management")}
                  className="h-10"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Spieler verwalten
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {globalPlayers.map((player) => (
                  <div key={player.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={`player-${player.id}`}
                      checked={selectedPlayers.includes(player.id)}
                      onCheckedChange={(checked) => handlePlayerToggle(player.id, checked as boolean)}
                    />
                    <Label 
                      htmlFor={`player-${player.id}`} 
                      className="flex-1 text-base font-medium cursor-pointer"
                    >
                      {player.name}
                    </Label>
                  </div>
                ))}
                
                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate("player-management")}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Spieler verwalten
                  </Button>
                  
                  {globalPlayers.length > 0 && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPlayers([])
                          dispatch({ type: 'SET_SELECTED_PLAYERS', playerIds: [] })
                        }}
                      >
                        Alle abwählen
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const allPlayerIds = globalPlayers.map(p => p.id)
                          setSelectedPlayers(allPlayerIds)
                          dispatch({ type: 'SET_SELECTED_PLAYERS', playerIds: allPlayerIds })
                        }}
                      >
                        Alle auswählen
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedPlayers.length < 2 && globalPlayers.length >= 2 && (
              <p className="text-muted-foreground text-sm">
                Mindestens 2 Spieler erforderlich zum Starten
              </p>
            )}
          </CardContent>
        </Card>

        {/* Word Pool */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <BookOpen className="h-5 w-5" />
              Wörter-Pool (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div>
              <Label htmlFor="custom-words" className="text-sm font-medium mb-2 block">
                Eigene Wörter (ein Wort pro Zeile)
              </Label>
              <textarea
                id="custom-words"
                placeholder={`Leer lassen für Standard-Wörter...\n\nOder eigene Wörter eingeben:\nBanane\nElefant\nRegenbogen\n...`}
                value={customWords}
                onChange={(e) => setCustomWords(e.target.value)}
                className="w-full h-32 px-3 py-2 border border-input bg-background text-sm rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
            
            {!customWords.trim() && (
              <p className="text-sm text-muted-foreground">
                Standard-Wörter werden verwendet: {defaultWords.length} Wörter verfügbar
              </p>
            )}

            {customWords.trim() && (
              <p className="text-sm text-muted-foreground">
                {customWords.split('\n').filter(w => w.trim().length > 0).length} eigene Wörter eingegeben
              </p>
            )}
          </CardContent>
        </Card>

        {/* Start Game */}
        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="p-4 sm:p-6">
            <Button
              onClick={handleStartGame}
              disabled={!canStartGame}
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white text-base font-medium disabled:opacity-50"
            >
              <Play className="h-5 w-5 mr-2" />
              Spiel starten ({selectedPlayers.length} Spieler)
            </Button>
            
            {!canStartGame && globalPlayers.length >= 2 && (
              <p className="text-center text-sm text-muted-foreground mt-2">
                Mindestens 2 Spieler auswählen
              </p>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
