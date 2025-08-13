"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { Screen } from "@/app/page"

interface BetBuddyCardProps {
  onNavigate: (screen: Screen) => void
}

export function BetBuddyCard({ onNavigate }: BetBuddyCardProps) {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="text-center pb-6">
        <div className="animated-imposter-title">
          BET BUDDY
          <span data-text="BET BUDDY"></span>
          <span data-text="BET BUDDY"></span>
        </div>
        <p className="text-muted-foreground text-lg">Das strategische Wettspiel</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button className="w-full h-16 text-xl font-semibold" size="lg" disabled>
          💰 Bald verfügbar
        </Button>

        <div className="grid grid-cols-1 gap-4">
          <Button
            variant="outline"
            className="h-14 flex items-center justify-center gap-3 text-lg"
            disabled
          >
            <span>Regeln ansehen</span>
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
