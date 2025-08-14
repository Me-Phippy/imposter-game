"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Play, Users, Target, Settings } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useBombGame } from "@/components/bomb-game-context"
import type { Screen } from "@/app/page"

interface BombGameSetupScreenProps {
  onNavigate: (screen: Screen) => void
}

export function BombGameSetupScreen({ onNavigate }: BombGameSetupScreenProps) {
  const { state, dispatch, globalPlayers } = useBombGame()
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [trackLosses, setTrackLosses] = useState(false)

  const canStartGame = selectedPlayers.length >= 2 && state.words.length > 0

  const handlePlayerToggle = (playerId: string, checked: boolean) => {
    if (checked) {
      setSelectedPlayers([...selectedPlayers, playerId])
    } else {
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId))
    }
  }

  const handleCategoryToggle = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category])
    } else {
      setSelectedCategories(selectedCategories.filter(c => c !== category))
    }
  }

  const handleStartGame = () => {
    if (canStartGame) {
      dispatch({ 
        type: "START_GAME", 
        selectedPlayers, 
        selectedCategories, 
        trackLosses,
        globalPlayers
      })
      onNavigate("bomb-game-play")
    }
  }

  // Get player losses from the bomb game state
  const getPlayerLosses = (playerId: string) => {
    return state.playerLosses[playerId] || 0
  }

  return (
    <div className="min-h-screen p-2 sm:p-6 bg-gradient-to-br from-red-100 to-orange-200 dark:bg-gradient-to-br dark:from-red-900 dark:to-orange-800 relative">
      {/* Theme Toggle - Fixed Position */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
        <ThemeToggle />
      </div>
      
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onNavigate("start-menu")}
                className="shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="text-xl sm:text-2xl">💣 Bomb Game Setup</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Das explosive Wortspiel konfigurieren
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Game Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="h-5 w-5" />
              Spieleinstellungen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="track-losses" className="text-base font-medium">
                  Verluste zählen
                </Label>
                <p className="text-sm text-muted-foreground">
                  Verfolge, wie oft jeder Spieler die Bombe hatte, als sie explodierte
                </p>
              </div>
              <Switch
                id="track-losses"
                checked={trackLosses}
                onCheckedChange={setTrackLosses}
              />
            </div>
          </CardContent>
        </Card>

        {/* Player Selection */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" />
                Spieler auswählen ({selectedPlayers.length})
              </CardTitle>
              {globalPlayers.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPlayers(globalPlayers.map(p => p.id))}
                    disabled={selectedPlayers.length === globalPlayers.length}
                  >
                    Alle
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPlayers([])}
                    disabled={selectedPlayers.length === 0}
                  >
                    Keine
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {globalPlayers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Noch keine Spieler erstellt</p>
                <Button
                  variant="outline"
                  onClick={() => onNavigate("player-management")}
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Spieler verwalten
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {globalPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={`player-${player.id}`}
                        checked={selectedPlayers.includes(player.id)}
                        onCheckedChange={(checked) =>
                          handlePlayerToggle(player.id, !!checked)
                        }
                      />
                      <div>
                        <label
                          htmlFor={`player-${player.id}`}
                          className="text-base font-medium cursor-pointer"
                        >
                          {player.name}
                        </label>
                        {trackLosses && (
                          <p className="text-sm text-muted-foreground">
                            Verluste: {getPlayerLosses(player.id)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5" />
              Kategorien auswählen ({selectedCategories.length || "Alle"})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {state.availableCategories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Keine Wörter verfügbar</p>
                <Button
                  variant="outline"
                  onClick={() => onNavigate("bomb-game-management")}
                  className="flex items-center gap-2"
                >
                  <Target className="h-4 w-4" />
                  Wörter verwalten
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-3">
                  Leer lassen für alle Kategorien
                </p>
                {state.availableCategories.map((category) => (
                  <div key={category} className="flex items-center space-x-3">
                    <Checkbox
                      id={`category-${category}`}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={(checked) =>
                        handleCategoryToggle(category, !!checked)
                      }
                    />
                    <label
                      htmlFor={`category-${category}`}
                      className="text-base cursor-pointer"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Game Info */}
        <Card className="bg-yellow-50 dark:bg-yellow-950/50 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              💣 Spielregeln
            </h3>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• Die Bombe hat eine zufällige Zeit zwischen 12 Sekunden und 3 Minuten</li>
              <li>• Jeder Spieler sagt ein Wort zum aktuellen Begriff und gibt die Bombe weiter</li>
              <li>• Wer die Bombe hat, wenn sie explodiert, verliert die Runde</li>
              <li>• Die Explosionszeit wird erst beim Explodieren angezeigt</li>
              <li>• Ein zufälliger Spieler startet jede Runde</li>
            </ul>
          </CardContent>
        </Card>

        {/* Start Button */}
        <div className="space-y-4">
          <Button
            onClick={handleStartGame}
            disabled={!canStartGame}
            className="w-full h-14 text-lg font-semibold"
            size="lg"
          >
            <Play className="h-5 w-5 mr-2" />
            {!canStartGame 
              ? "Mindestens 2 Spieler erforderlich" 
              : `Spiel starten (${selectedPlayers.length} Spieler)`
            }
          </Button>
          
          {selectedPlayers.length < 2 && (
            <p className="text-center text-sm text-muted-foreground">
              Wähle mindestens 2 Spieler zum Starten aus
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
