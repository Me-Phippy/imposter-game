"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MessageCircle, ArrowRight, Eye } from "lucide-react"
import type { Screen } from "@/app/page"
import { useGame } from "@/components/game-context"

interface AssociationScreenProps {
  onNavigate: (screen: Screen) => void
}

export function AssociationScreen({ onNavigate }: AssociationScreenProps) {
  const { state, dispatch } = useGame()
  const [association, setAssociation] = useState("")

  if (!state.currentSession) {
    return null
  }

  const currentPlayer = state.currentSession.players[state.currentSession.currentPlayerIndex]

  const handleSubmitAssociation = () => {
    if (association.trim()) {
      dispatch({
        type: "ADD_ASSOCIATION",
        playerId: currentPlayer.id,
        word: association.trim(),
      })
      setAssociation("")
      dispatch({ type: "NEXT_PLAYER" })
    }
  }

  const handleSkipToReveal = () => {
    onNavigate("result")
  }

  const getPlayerAssociations = (playerId: string) => {
    return state.currentSession!.associations.filter((a) => a.playerId === playerId).map((a) => a.word)
  }

  const totalAssociations = state.currentSession.associations.length

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-purple-100 to-blue-200 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-sm mx-auto space-y-6">
        <Card className="border-blue-500 border-2">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-white text-2xl mb-2">{currentPlayer.name} ist dran</CardTitle>
            <p className="text-gray-300 text-base">📱 Gib das Gerät an {currentPlayer.name} weiter</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="association" className="text-white text-lg font-medium mb-3 block">
                Deine Assoziation (optional)
              </Label>
              <Input
                id="association"
                value={association}
                onChange={(e) => setAssociation(e.target.value)}
                placeholder="Gib ein assoziiertes Wort ein..."
                onKeyPress={(e) => e.key === "Enter" && handleSubmitAssociation()}
                autoFocus
                className="bg-white/10 border-white/20 text-black placeholder:text-gray-400 h-14 text-lg"
              />
            </div>

            <Button
              onClick={handleSubmitAssociation}
              disabled={!association.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 h-14 text-lg font-semibold"
              size="lg"
            >
              <ArrowRight className="h-5 w-5 mr-2" />
              Nächster Spieler
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-red-600/20 border-red-500/50 border-2">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3 text-xl">
              <Eye className="h-6 w-6" />
              Imposter aufdecken
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4 text-base">
              Ihr könnt jederzeit den Imposter aufdecken und das Spiel beenden.
            </p>
            <Button
              onClick={handleSkipToReveal}
              className="w-full bg-red-600 hover:bg-red-700 h-14 text-lg font-semibold"
            >
              <Eye className="h-5 w-5 mr-2" />🎭 Imposter aufdecken
            </Button>
          </CardContent>
        </Card>

        {totalAssociations > 0 && (
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3 text-xl">
                <MessageCircle className="h-6 w-6" />
                Zur Diskussion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4 text-base">
                {totalAssociations} Assoziationen wurden bereits genannt. Diskutiert über die Hinweise!
              </p>
              <Button
                onClick={() => onNavigate("discussion")}
                variant="outline"
                className="w-full bg-transparent border-white/20 text-white hover:bg-white/10 h-12 text-base"
              >
                💬 Zur Diskussion
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-xl">Bisherige Assoziationen ({totalAssociations})</CardTitle>
          </CardHeader>
          <CardContent>
            {state.currentSession.associations.length === 0 ? (
              <p className="text-center text-gray-400 py-6 text-base">Noch keine Assoziationen</p>
            ) : (
              <div className="space-y-4">
                {state.currentSession.players.map((player) => {
                  const playerAssociations = getPlayerAssociations(player.id)
                  return (
                    <div key={player.id} className="border border-white/10 rounded-lg p-4">
                      <div className="font-medium mb-2 text-white text-base">{player.name}</div>
                      {playerAssociations.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {playerAssociations.map((word, index) => (
                            <span key={index} className="bg-white/10 text-gray-300 px-3 py-2 rounded-full text-sm">
                              {word}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">Noch keine Assoziation</span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
