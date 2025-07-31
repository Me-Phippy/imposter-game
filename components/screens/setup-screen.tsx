"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
    if (checked) {
      dispatch({
        type: "SET_SELECTED_PLAYERS",
        playerIds: [...state.selectedPlayers, playerId],
      })
    } else {
      dispatch({
        type: "SET_SELECTED_PLAYERS",
        playerIds: state.selectedPlayers.filter((id) => id !== playerId),
      })
    }
  }

  const handleCategoryToggle = (category: string, checked: boolean) => {
    if (checked) {
      dispatch({
        type: "SET_SELECTED_CATEGORIES",
        categories: [...state.selectedCategories, category],
      })
    } else {
      dispatch({
        type: "SET_SELECTED_CATEGORIES",
        categories: state.selectedCategories.filter((c) => c !== category),
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
            <CardTitle className="text-xl">Spieler auswählen</CardTitle>
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
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={category}
                    checked={state.selectedCategories.length === 0 || state.selectedCategories.includes(category)}
                    onCheckedChange={(checked) => handleCategoryToggle(category, checked as boolean)}
                    className="h-5 w-5"
                  />
                  <Label htmlFor={category} className="text-base font-medium flex-1 cursor-pointer">
                    {category}
                  </Label>
                </div>
              ))}
              <p className="text-sm text-muted-foreground text-center pt-2">
                {state.selectedCategories.length === 0
                  ? "Alle Kategorien"
                  : `${state.selectedCategories.length} Kategorien ausgewählt`}
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
            <p className="text-sm text-muted-foreground bg-blue-50 p-4 rounded-lg">
              📱 <strong>Pass-and-Play:</strong> Gebt das Gerät reihum weiter. Ihr entscheidet selbst, wann ihr zur
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
          🚀 Spiel starten
        </Button>
      </div>
    </div>
  )
}
