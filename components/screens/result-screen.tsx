"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown, Users, Eye } from "lucide-react"
import type { Screen } from "@/app/page"
import { useGame } from "@/components/game-context"
import { useState } from "react"

interface ResultScreenProps {
  onNavigate: (screen: Screen) => void
}

export function ResultScreen({ onNavigate }: ResultScreenProps) {
  const { state, dispatch } = useGame()
  const [isRevealed, setIsRevealed] = useState(false)

  if (!state.currentSession) {
    return null
  }

  const impostors = state.currentSession.players.filter((p) => p.role === "imposter")
  const citizens = state.currentSession.players.filter((p) => p.role === "citizen")

  const handleReveal = () => {
    setIsRevealed(true)
  }

  const handleNewGame = () => {
    dispatch({ type: "RESET_GAME" })
    onNavigate("setup")
  }

  const getPlayerAssociations = (playerId: string) => {
    return state.currentSession!.associations.filter((a) => a.playerId === playerId).map((a) => a.word)
  }

  if (!isRevealed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Card className="w-full max-w-sm bg-white/5 border-white/10">
          <CardContent className="p-8 text-center space-y-8">
            <div className="text-8xl">
              <Eye className="h-20 w-20 mx-auto text-gray-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">Bereit für die Auflösung?</h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              Klicke auf den Button, um {impostors.length > 1 ? 'die Impostors' : 'den Impostor'} aufzudecken und das geheime Wort zu enthüllen.
            </p>
            <Button
              onClick={handleReveal}
              size="lg"
              className="w-full bg-purple-600 hover:bg-purple-700 h-16 text-xl font-semibold"
            >
              🎭 {impostors.length > 1 ? 'Impostors' : 'Impostor'} aufdecken!
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="max-w-sm mx-auto space-y-6">
        <Card className="border-yellow-500 bg-white/5 border-2">
          <CardHeader className="text-center pb-6">
            <div className="text-6xl mb-4">
              <Crown className="h-16 w-16 mx-auto text-yellow-500" />
            </div>
            <CardTitle className="text-3xl text-white mb-2">Spiel beendet!</CardTitle>
            <p className="text-gray-300 text-lg">Hier ist die Auflösung:</p>
          </CardHeader>
        </Card>

        <Card className="bg-green-600/20 border-green-500/50 border-2">
          <CardHeader>
            <CardTitle className="text-white text-xl">Das geheime Wort war:</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2 p-4 bg-green-500/20 rounded-lg">
                {state.currentSession.secretWord}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-600/20 border-red-500/50 border-2">
          <CardHeader>
            <CardTitle className="text-white text-xl">
              {impostors.length > 1 ? `Die ${impostors.length} Impostors waren:` : 'Der Impostor war:'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-3">
              {impostors.map((impostor, index) => (
                <div key={impostor.id} className="space-y-2">
                  <div className="text-3xl font-bold text-red-400 p-4 bg-red-500/20 rounded-lg">
                    {impostor.name}
                  </div>
                  <Badge variant="destructive" className="text-lg px-6 py-3 text-base">
                    🎭 IMPOSTOR {impostors.length > 1 ? `#${index + 1}` : ''}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {state.imposterTipEnabled && state.currentSession.imposterTip && (
          <Card className="bg-orange-600/20 border-orange-500/50 border-2">
            <CardHeader>
              <CardTitle className="text-white text-xl">
                {impostors.length > 1 ? 'Tipp für die Impostors:' : 'Tipp für den Impostor:'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-lg font-medium text-orange-300 p-4 bg-orange-500/20 rounded-lg">
                  {state.currentSession.imposterTip}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {state.currentSession.associations.length > 0 && (
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-xl">Alle Assoziationen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {state.currentSession.players.map((player) => {
                  const playerAssociations = getPlayerAssociations(player.id)
                  return (
                    <div key={player.id} className="border border-white/10 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="font-medium text-white text-base">{player.name}</span>
                        {player.role === "imposter" ? (
                          <Badge variant="destructive" className="text-sm">
                            Impostor
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-sm">
                            <Users className="h-3 w-3 mr-1" />
                            Bürger
                          </Badge>
                        )}
                      </div>
                      {playerAssociations.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {playerAssociations.map((word, index) => (
                            <span
                              key={index}
                              className={`px-3 py-2 rounded-full text-sm font-medium ${
                                player.role === "imposter" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                              }`}
                            >
                              {word}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm italic">Keine Assoziationen</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <Button onClick={handleNewGame} className="w-full h-16 text-xl font-semibold" size="lg">
            🎮 Neues Spiel starten
          </Button>
          <div className="grid grid-cols-1 gap-3">
            <Button variant="outline" onClick={() => onNavigate("player-management")} className="h-12 text-base">
              👥 Spieler verwalten
            </Button>
            <Button variant="outline" onClick={() => onNavigate("word-management")} className="h-12 text-base">
              📝 Wörter verwalten
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
