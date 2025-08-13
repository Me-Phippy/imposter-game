"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Users, BookOpen } from "lucide-react"
import type { Screen } from "@/app/page"

interface GameCardProps {
  title: string
  subtitle: string
  emoji: string
  onNavigate: (screen: Screen) => void
  targetScreen: Screen
  isAvailable?: boolean
}

// Map game titles to their word management screens
const getWordManagementScreen = (title: string): Screen => {
  switch (title.toUpperCase()) {
    case "IMPOSTER":
      return "word-management"
    case "BOMB GAME":
      return "bomb-game-management"
    case "WORD ASSASSINATION":
      return "word-assassination-management"
    case "HEADS UP":
      return "heads-up-management"
    case "BET BUDDY":
      return "bet-buddy-management"
    default:
      return "word-management"
  }
}

export function GameCard({ 
  title, 
  subtitle, 
  emoji, 
  onNavigate, 
  targetScreen, 
  isAvailable = false 
}: GameCardProps) {
  const wordManagementScreen = getWordManagementScreen(title)
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center pb-6">
        <div className="animated-game-title">
          {title.toUpperCase()}
          <span data-text={title.toUpperCase()}></span>
          <span data-text={title.toUpperCase()}></span>
        </div>
        <p className="text-muted-foreground text-lg">{subtitle}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button 
          onClick={() => isAvailable && onNavigate(targetScreen)} 
          className="w-full h-16 text-xl font-semibold" 
          size="lg"
          disabled={!isAvailable}
        >
          {emoji} {isAvailable ? "Spiel starten" : "Bald verfügbar"}
        </Button>

        <div className="grid grid-cols-1 gap-4">
          <Button
            variant="outline"
            onClick={() => onNavigate("player-management")}
            className="h-14 flex items-center justify-center gap-3 text-lg"
            disabled={!isAvailable}
          >
            <Users className="h-6 w-6" />
            <span>Spieler verwalten</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => onNavigate(wordManagementScreen)}
            className="h-14 flex items-center justify-center gap-3 text-lg"
          >
            <BookOpen className="h-6 w-6" />
            <span>Wörter verwalten</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => onNavigate("database-management")}
            className="h-14 flex items-center justify-center gap-3 text-lg"
          >
            <Users className="h-6 w-6" />
            <span>Datenbank verwalten</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
