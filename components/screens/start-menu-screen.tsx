"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, Database } from "lucide-react"
import type { Screen } from "@/app/page"

interface StartMenuScreenProps {
  onNavigate: (screen: Screen) => void
}

export function StartMenuScreen({ onNavigate }: StartMenuScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
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
              onClick={() => onNavigate("word-database")}
              className="h-14 flex items-center justify-center gap-3 text-lg"
            >
              <Database className="h-6 w-6" />
              <span>Wörter-Datenbank</span>
            </Button>
          </div>

          <div className="pt-6 border-t">
            <p className="text-center text-sm text-muted-foreground mb-4">Andere Spiele</p>
            <Button variant="ghost" className="w-full h-12 text-base" disabled>
              🎲 Bald verfügbar...
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
