"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Bomb, RotateCcw, Home, Users, BookOpen } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useBombGame } from "@/components/bomb-game-context"
import type { Screen } from "@/app/page"

interface BombGameResultScreenProps {
  onNavigate: (screen: Screen) => void
}

export function BombGameResultScreen({ onNavigate }: BombGameResultScreenProps) {
  const { state, dispatch } = useBombGame()

  if (!state.currentSession) {
    onNavigate("bomb-game-setup")
    return null
  }

  const explodedPlayer = state.currentSession.players.find(
    p => p.id === state.currentSession!.explosionPlayerId
  )

  const survivors = state.currentSession.players.filter(
    p => p.id !== state.currentSession!.explosionPlayerId
  )

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleNewGame = () => {
    dispatch({ type: "RESET_GAME" })
    onNavigate("bomb-game-setup")
  }

  const handleBackToHome = () => {
    dispatch({ type: "RESET_GAME" })
    onNavigate("start-menu")
  }

  // Sort players by losses (ascending) for leaderboard if tracking losses
  const sortedPlayers = state.currentSession.trackLosses 
    ? [...state.currentSession.players].sort((a, b) => a.losses - b.losses)
    : []

  return (
    <div className="min-h-screen p-2 sm:p-6 bg-gradient-to-br from-red-100 to-orange-200 dark:bg-gradient-to-br dark:from-red-900 dark:to-orange-800 relative">
      {/* Theme Toggle - Fixed Position */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
        <ThemeToggle />
      </div>
      
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="p-4 sm:p-6 text-center">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-red-600">
              💥 EXPLOSION! 💥
            </CardTitle>
            <p className="text-lg text-muted-foreground mt-2">
              Die Bombe ist explodiert!
            </p>
          </CardHeader>
        </Card>

        {/* Explosion Result */}
        <Card className="bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-center text-xl">
              💣 Die Bombe explodierte bei:
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-3xl font-bold text-red-600 p-4 bg-red-500/20 rounded-lg">
              {explodedPlayer?.name}
            </div>
            <Badge variant="destructive" className="text-lg px-6 py-3">
              VERLOREN
            </Badge>
            <div className="text-sm text-muted-foreground">
              Die Bombe war auf {formatTime(state.currentSession.bombTimer)} eingestellt
            </div>
          </CardContent>
        </Card>

        {/* Survivors */}
        <Card className="bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="text-center text-xl flex items-center justify-center gap-2">
              <Trophy className="h-6 w-6 text-green-600" />
              Überlebende
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 justify-center">
              {survivors.map((player) => (
                <Badge
                  key={player.id}
                  variant="default"
                  className="text-lg px-4 py-2 bg-green-600 text-white"
                >
                  {player.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Loss Counter Leaderboard (if enabled) */}
        {state.currentSession.trackLosses && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center justify-center gap-2">
                <Trophy className="h-6 w-6" />
                Gesamtstatistik
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sortedPlayers.map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      index === 0 
                        ? "bg-yellow-100 dark:bg-yellow-900/50 border-2 border-yellow-300 dark:border-yellow-600"
                        : "bg-gray-50 dark:bg-gray-800 border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {index === 0 ? "👑" : index === 1 ? "🥈" : index === 2 ? "🥉" : "🎯"}
                      </div>
                      <div>
                        <div className="font-medium">
                          {player.name}
                        </div>
                        {index === 0 && (
                          <div className="text-sm text-yellow-600 dark:text-yellow-400">
                            Bester Spieler
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {player.losses}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Verluste
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleNewGame}
            className="w-full h-14 text-lg font-semibold bg-green-600 hover:bg-green-700"
            size="lg"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Neue Runde starten
          </Button>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={handleBackToHome}
              className="h-12 flex items-center justify-center gap-2"
            >
              <Home className="h-4 w-4" />
              Hauptmenü
            </Button>

            <Button
              variant="outline"
              onClick={() => onNavigate("player-management")}
              className="h-12 flex items-center justify-center gap-2"
            >
              <Users className="h-4 w-4" />
              Spielerverwaltung
            </Button>

            <Button
              variant="outline"
              onClick={() => onNavigate("bomb-game-management")}
              className="h-12 flex items-center justify-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Wörterverwaltung
            </Button>
          </div>
        </div>

        {/* Game Summary */}
        <Card className="bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              📊 Rundenzusammenfassung
            </h3>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <div>• Gespieltes Wort: "{state.currentSession.currentWord}"</div>
              <div>• Anzahl Spieler: {state.currentSession.players.length}</div>
              <div>• Kategorien: {
                state.currentSession.selectedCategories.length > 0 
                  ? state.currentSession.selectedCategories.join(", ")
                  : "Alle"
              }</div>
              {state.currentSession.trackLosses && (
                <div>• Verluste wurden gezählt</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
