"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Play, Settings, BookOpen, Users } from "lucide-react"
import type { Screen } from "@/app/page"

interface BombGameCardProps {
  onNavigate: (screen: Screen) => void
}

export function BombGameCard({ onNavigate }: BombGameCardProps) {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="text-center pb-6">
        <div className="animated-imposter-title">
          BOMB GAME
          <span data-text="BOMB GAME"></span>
          <span data-text="BOMB GAME"></span>
        </div>
        <p className="text-muted-foreground text-lg">Das explosive Wortspiel</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button 
          className="w-full h-16 text-xl font-semibold bg-red-600 hover:bg-red-700" 
          size="lg"
          onClick={() => onNavigate("bomb-game-setup")}
        >
          <Play className="h-6 w-6 mr-2" />
          💣 Spiel starten
        </Button>

        <div className="grid grid-cols-1 gap-4">
          <Button
            variant="outline"
            onClick={() => onNavigate("player-management")}
            className="h-14 flex items-center justify-center gap-3 text-lg"
          >
            <Users className="h-6 w-6" />
            <span>Spieler verwalten</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => onNavigate("bomb-game-management")}
            className="h-14 flex items-center justify-center gap-3 text-lg"
          >
            <BookOpen className="h-6 w-6" />
            <span>Wörter verwalten</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => onNavigate("start-menu")}
            className="h-14 flex items-center justify-center gap-3 text-lg"
          >
            <span>Zurück zum Hauptmenü</span>
          </Button>
        </div>

        {/* Rules */}
        <div className="bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            💣 Spielregeln
          </h3>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>• Die Bombe hat eine zufällige Zeit (12 Sekunden bis 3 Minuten)</li>
            <li>• Jeder Spieler sagt ein Wort zum Begriff und gibt die Bombe weiter</li>
            <li>• Wer die Bombe hat, wenn sie explodiert, verliert</li>
            <li>• Die Explosionszeit wird erst beim Explodieren angezeigt</li>
            <li>• Optional: Verluste können gezählt werden</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
