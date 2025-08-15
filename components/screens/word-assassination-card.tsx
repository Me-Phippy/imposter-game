"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { Screen } from "@/app/page"

interface WordAssassinationCardProps {
  onNavigate: (screen: Screen) => void
}

export function WordAssassinationCard({ onNavigate }: WordAssassinationCardProps) {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="text-center pb-6">
        <div className="animated-imposter-title">
          WORD ASSASSINATION
          <span data-text="WORD ASSASSINATION"></span>
          <span data-text="WORD ASSASSINATION"></span>
        </div>
        <p className="text-muted-foreground text-lg">Das tödliche Wortduell</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button 
          className="w-full h-16 text-xl font-semibold bg-red-600 hover:bg-red-700 text-white" 
          size="lg"
          onClick={() => onNavigate("word-assassination-setup")}
        >
          🎯 Spiel starten
        </Button>

        <div className="grid grid-cols-1 gap-4">
          <Button
            variant="outline"
            onClick={() => onNavigate("word-assassination-management")}
            className="h-14 flex items-center justify-center gap-3 text-lg"
          >
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
      </CardContent>
    </Card>
  )
}
