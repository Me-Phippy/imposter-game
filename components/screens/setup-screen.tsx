"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft } from "lucide-react"
import type { Screen } from "@/app/page"
import { useGame } from "@/components/game-context"

interface SetupScreenProps {
  onNavigate: (screen: Screen) => void
}

export function SetupScreen({ onNavigate }: SetupScreenProps) {
  const { state, dispatch } = useGame()

  const categories = [...new Set(state.wordEntries.map((entry) => entry.category))]

  const handlePlayerToggle = (playerId: string, checked: boolean) => {
    let newSelectedPlayers: string[]
    
    if (checked) {
      newSelectedPlayers = [...state.selectedPlayers, playerId]
    } else {
      newSelectedPlayers = state.selectedPlayers.filter((id) => id !== playerId)
    }

    dispatch({
      type: "SET_SELECTED_PLAYERS",
      playerIds: newSelectedPlayers,
    })

    // Passe die Imposter-Anzahl an, falls sie größer als die neue Spieleranzahl ist
    if (state.imposterCount > newSelectedPlayers.length && newSelectedPlayers.length > 0) {
      dispatch({
        type: "SET_IMPOSTER_COUNT",
        count: newSelectedPlayers.length,
      })
    }
  }

  const handleCategoryToggle = (category: string, checked: boolean) => {
    if (checked) {
      // Füge Kategorie hinzu
      dispatch({
        type: "SET_SELECTED_CATEGORIES",
        categories: [...state.selectedCategories, category],
      })
    } else {
      // Entferne Kategorie
      const newCategories = state.selectedCategories.filter((c) => c !== category)
      dispatch({
        type: "SET_SELECTED_CATEGORIES",
        categories: newCategories,
      })
    }
  }

  const canStartGame = state.selectedPlayers.length >= 3

  const handleStartGame = () => {
    if (canStartGame) {
      dispatch({ type: "START_GAME" })
      onNavigate("role-distribution")
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-sm mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => onNavigate("start-menu")} className="h-12 w-12">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Spiel einrichten</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Spieler auswählen</CardTitle>
              {state.players.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      dispatch({
                        type: "SET_SELECTED_PLAYERS",
                        playerIds: state.players.map(p => p.id),
                      })
                    }}
                    disabled={state.selectedPlayers.length === state.players.length}
                  >
                    Alle
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      dispatch({
                        type: "SET_SELECTED_PLAYERS",
                        playerIds: [],
                      })
                    }}
                    disabled={state.selectedPlayers.length === 0}
                  >
                    Keine
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {state.players.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4 text-base">Keine Spieler vorhanden</p>
                <Button variant="outline" onClick={() => onNavigate("player-management")} className="h-12 text-base">
                  Spieler hinzufügen
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {state.players.map((player) => (
                  <div key={player.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={player.id}
                      checked={state.selectedPlayers.includes(player.id)}
                      onCheckedChange={(checked) => handlePlayerToggle(player.id, checked as boolean)}
                      className="h-5 w-5"
                    />
                    <Label htmlFor={player.id} className="text-base font-medium flex-1 cursor-pointer">
                      {player.name}
                    </Label>
                  </div>
                ))}
                <p className="text-sm text-muted-foreground text-center pt-2">
                  {state.selectedPlayers.length} von {state.players.length} ausgewählt (mindestens 3 erforderlich)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Kategorien</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 border-2 border-blue-200 rounded-lg bg-blue-50">
                <Checkbox
                  id="all-categories"
                  checked={state.selectedCategories.length === 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      // Alle Kategorien verwenden (leere Liste bedeutet alle)
                      dispatch({
                        type: "SET_SELECTED_CATEGORIES",
                        categories: [],
                      })
                    } else {
                      // Alle Kategorien einzeln aktivieren für individuelle Auswahl
                      dispatch({
                        type: "SET_SELECTED_CATEGORIES",
                        categories: [...categories],
                      })
                    }
                  }}
                  className="h-5 w-5"
                />
                <Label htmlFor="all-categories" className="text-base font-medium flex-1 cursor-pointer text-blue-800">
                  Alle Kategorien verwenden
                </Label>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => (
                  <div key={category} className="flex items-center space-x-2 p-2 border rounded-lg">
                    <Checkbox
                      id={category}
                      checked={state.selectedCategories.length === 0 || state.selectedCategories.includes(category)}
                      disabled={state.selectedCategories.length === 0}
                      onCheckedChange={(checked) => {
                        handleCategoryToggle(category, checked as boolean)
                      }}
                      className="h-4 w-4"
                    />
                    <Label htmlFor={category} className="text-sm font-medium flex-1 cursor-pointer leading-tight">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
              
              <p className="text-sm text-muted-foreground text-center pt-2">
                {state.selectedCategories.length === 0
                  ? "Alle Kategorien werden verwendet"
                  : `${state.selectedCategories.length} von ${categories.length} Kategorien ausgewählt`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Spieleinstellungen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <Label htmlFor="imposter-tip" className="text-base font-medium">
                Imposter-Tipp aktivieren
              </Label>
              <Switch
                id="imposter-tip"
                checked={state.imposterTipEnabled}
                onCheckedChange={(checked) => dispatch({ type: "SET_IMPOSTER_TIP_ENABLED", enabled: checked })}
                className="scale-125"
              />
            </div>
            
            <div className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">
                  Anzahl Imposter
                </Label>
                <span className="text-lg font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                  {state.imposterCount}
                </span>
              </div>
              <div className="space-y-3">
                <Slider
                  value={[state.imposterCount]}
                  onValueChange={(value) => dispatch({ type: "SET_IMPOSTER_COUNT", count: value[0] })}
                  max={Math.max(1, state.selectedPlayers.length)}
                  min={1}
                  step={1}
                  className="w-full"
                  disabled={state.selectedPlayers.length === 0}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>1</span>
                  <span className="font-medium">
                    {state.selectedPlayers.length > 0 
                      ? `Max: ${state.selectedPlayers.length}` 
                      : "Spieler auswählen"}
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground bg-blue-50 p-4 rounded-lg">
              <strong>Pass-and-Play:</strong> Gebt das Gerät reihum weiter. Ihr entscheidet selbst, wann ihr zur
              Diskussion übergeht.
            </p>
          </CardContent>
        </Card>

        <Button
          onClick={handleStartGame}
          disabled={!canStartGame}
          className="w-full h-16 text-xl font-semibold"
          size="lg"
        >
          Spiel starten
        </Button>
      </div>
    </div>
  )
}
