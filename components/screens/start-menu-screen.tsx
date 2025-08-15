"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel"
import { GameCard } from "@/components/screens/game-card"
import { ThemeToggle } from "@/components/theme-toggle"
import { Users, BookOpen } from "lucide-react"
import type { Screen } from "@/app/page"

interface StartMenuScreenProps {
  onNavigate: (screen: Screen) => void
}

const games = [
  {
    title: "IMPOSTER",
    subtitle: "Das klassische Wortassoziations-Spiel",
    emoji: "🎮",
    targetScreen: "setup" as Screen,
    isAvailable: true
  },
  {
    title: "BOMB GAME",
    subtitle: "Das explosive Wortspiel",
    emoji: "💣",
    targetScreen: "bomb-game-setup" as Screen,
    isAvailable: true
  },
  {
    title: "WORD ASSASSINATION", 
    subtitle: "Das tödliche Wortduell",
    emoji: "🎯",
    targetScreen: "word-assassination-setup" as Screen,
    isAvailable: true
  },
  {
    title: "HEADS UP",
    subtitle: "Das klassische Ratespiel", 
    emoji: "📱",
    targetScreen: "heads-up" as Screen,
    isAvailable: false
  },
  {
    title: "BET BUDDY",
    subtitle: "Das strategische Wettspiel",
    emoji: "💰", 
    targetScreen: "bet-buddy" as Screen,
    isAvailable: false
  }
]

export function StartMenuScreen({ onNavigate }: StartMenuScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      {/* Theme Toggle - Fixed Position */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-4xl">
        <Carousel className="w-full" opts={{ align: "center", loop: true }}>
          <CarouselContent>
            {games.map((game, index) => (
              <CarouselItem key={index} className="basis-full">
                <div className="p-1">
                  {game.title === "IMPOSTER" ? (
                    // Special case for main IMPOSTER game with original styling
                    <Card className="w-full max-w-2xl mx-auto">
                      <CardHeader className="text-center pb-6">
                        <div className="animated-imposter-title">
                          IMPOSTER
                          <span data-text="IMPOSTER"></span>
                          <span data-text="IMPOSTER"></span>
                        </div>
                        <p className="text-muted-foreground text-lg">Das klassische Wortassoziations-Spiel</p>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <Button onClick={() => onNavigate("setup")} className="w-full h-16 text-xl font-semibold" size="lg">
                          🎮 Spiel starten
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
                            onClick={() => onNavigate("word-management")}
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
                  ) : (
                    // Use GameCard component for other games
                    <GameCard
                      title={game.title}
                      subtitle={game.subtitle}
                      emoji={game.emoji}
                      onNavigate={onNavigate}
                      targetScreen={game.targetScreen}
                      isAvailable={game.isAvailable}
                    />
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Nutze die Pfeile oder wische, um zwischen den Spielen zu wechseln
          </p>
        </div>
      </div>
    </div>
  )
}
