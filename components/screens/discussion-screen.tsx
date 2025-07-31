"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Eye } from "lucide-react"
import type { Screen } from "@/app/page"
import { useGame } from "@/components/game-context"

interface DiscussionScreenProps {
  onNavigate: (screen: Screen) => void
}

export function DiscussionScreen({ onNavigate }: DiscussionScreenProps) {
  const { state } = useGame()

  if (!state.currentSession) {
    return null
  }

  const getPlayerAssociations = (playerId: string) => {
    return state.currentSession!.associations.filter((a) => a.playerId === playerId).map((a) => a.word)
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="max-w-sm mx-auto space-y-6">
        <Card className="border-yellow-500 border-2">
          <CardHeader className="text-center pb-6">
            <div className="text-6xl mb-4">
              <MessageSquare className="h-16 w-16 mx-auto text-yellow-500" />
            </div>
            <CardTitle className="text-3xl text-white mb-2">Diskussionsphase</CardTitle>
            <p className="text-gray-300 text-lg">Diskutiert über die Assoziationen und findet {state.currentSession && state.currentSession.players.filter(p => p.role === "imposter").length > 1 ? 'die Impostors' : 'den Impostor'}!</p>
          </CardHeader>
        </Card>

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
                    <div className="font-semibold text-lg mb-3 text-white">{player.name}</div>
                    {playerAssociations.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {playerAssociations.map((word, index) => (
                          <span
                            key={index}
                            className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-4 py-2 rounded-full text-base font-medium"
                          >
                            {word}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 italic text-base">Keine Assoziationen</span>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-600/20 border-red-500/50 border-2">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-gray-300 text-base">
                Nehmt euch Zeit für die Diskussion. Wenn ihr bereit seid, deckt {state.currentSession && state.currentSession.players.filter(p => p.role === "imposter").length > 1 ? 'die Impostors' : 'den Impostor'} auf!
              </p>
              <Button
                onClick={() => onNavigate("result")}
                size="lg"
                className="w-full bg-red-600 hover:bg-red-700 h-16 text-xl font-semibold"
              >
                <Eye className="h-6 w-6 mr-2" />🎭 {state.currentSession && state.currentSession.players.filter(p => p.role === "imposter").length > 1 ? 'Impostors' : 'Impostor'} aufdecken
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
