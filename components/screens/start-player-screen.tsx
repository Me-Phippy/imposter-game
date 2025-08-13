"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Users } from "lucide-react"
import type { Screen } from "@/app/page"
import { useGame } from "@/components/game-context"

interface StartPlayerScreenProps {
  onNavigate: (screen: Screen) => void
}

export function StartPlayerScreen({ onNavigate }: StartPlayerScreenProps) {
  const { state } = useGame()

  if (!state.currentSession) {
    return null
  }

  const startPlayer = state.currentSession.players[state.currentSession.currentPlayerIndex]

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-100 to-blue-200 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center pb-6">
          <div className="text-8xl mb-6">
            <Play className="h-20 w-20 mx-auto text-green-500" />
          </div>
          <CardTitle className="text-3xl text-white mb-2">Spiel beginnt!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 text-center">
          <div className="bg-green-500/20 border border-green-500 rounded-xl p-6">
            <Users className="h-10 w-10 mx-auto mb-4 text-green-400" />
            <h3 className="text-xl font-bold text-white mb-3">Startspieler</h3>
            <p className="text-3xl font-bold text-green-400 p-4 bg-green-500/20 rounded-lg">{startPlayer.name}</p>
          </div>

          <div className="space-y-4 text-gray-300">
            <p className="text-base leading-relaxed">
              <strong className="text-white">{startPlayer.name}</strong> beginnt mit der ersten Assoziation.
            </p>
            <p className="text-base leading-relaxed">
              📱 Gebt das Gerät reihum weiter. Jeder nennt ein Wort, das mit dem geheimen Wort assoziiert wird.
            </p>
            <p className="text-base leading-relaxed">⏰ Ihr entscheidet selbst, wann ihr zur Diskussion übergeht!</p>
          </div>

          <Button
            onClick={() => onNavigate("association")}
            size="lg"
            className="w-full bg-green-600 hover:bg-green-700 h-16 text-xl font-semibold"
          >
            🚀 Assoziationen beginnen
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
