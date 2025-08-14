"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bomb, ArrowLeft, Users } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useBombGame } from "@/components/bomb-game-context"
import type { Screen } from "@/app/page"

interface BombGamePlayScreenProps {
  onNavigate: (screen: Screen) => void
}

export function BombGamePlayScreen({ onNavigate }: BombGamePlayScreenProps) {
  const { state, dispatch } = useBombGame()
  const [showExplosion, setShowExplosion] = useState(false)
  const [showPlayerSelection, setShowPlayerSelection] = useState(false)

  // Handle bomb explosion
  useEffect(() => {
    if (state.currentSession?.hasExploded && !showExplosion && !showPlayerSelection) {
      setShowExplosion(true)
      
      // Play explosion sound using Web Audio API
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        
        // Create explosion sound effect
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        // Explosion sound: low frequency, quick attack and decay
        oscillator.frequency.setValueAtTime(50, audioContext.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.1)
        oscillator.frequency.exponentialRampToValueAtTime(30, audioContext.currentTime + 0.3)
        
        gainNode.gain.setValueAtTime(0.7, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.5)
      } catch (error) {
        console.log('Web Audio API not supported')
      }

      // Show player selection after explosion animation
      setTimeout(() => {
        setShowExplosion(false)
        setShowPlayerSelection(true)
      }, 3000)
    }
  }, [state.currentSession?.hasExploded, showExplosion, showPlayerSelection])

  if (!state.currentSession) {
    onNavigate("bomb-game-setup")
    return null
  }

  const handlePlayerSelection = (playerId: string) => {
    dispatch({ type: "EXPLODE_BOMB", playerId })
    setShowPlayerSelection(false)
    setTimeout(() => {
      onNavigate("bomb-game-result")
    }, 500)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Player selection screen after explosion
  if (showPlayerSelection) {
    return (
      <div className="min-h-screen p-2 sm:p-6 bg-gradient-to-br from-red-100 to-orange-200 dark:bg-gradient-to-br dark:from-red-900 dark:to-orange-800 relative">
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
          <ThemeToggle />
        </div>
        
        <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6 pt-8">
          <Card className="bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-red-600">
                💥 Bombe explodiert!
              </CardTitle>
              <p className="text-muted-foreground">
                Wer hatte die Bombe, als sie explodiert ist?
              </p>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Spieler auswählen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {state.currentSession.players.map((player) => (
                  <Button
                    key={player.id}
                    onClick={() => handlePlayerSelection(player.id)}
                    className="h-16 text-lg"
                    variant="outline"
                  >
                    {player.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Explosion animation screen
  if (showExplosion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-yellow-400 via-red-500 to-red-900 animate-pulse"></div>
        
        {/* Explosion animation */}
        <div className="relative z-10 text-center space-y-6">
          <div className="text-8xl animate-bounce">💥</div>
          <div className="text-4xl font-bold animate-pulse">BOOM!</div>
          <div className="text-2xl">Die Bombe ist explodiert!</div>
          <div className="text-lg opacity-80">
            Nach {formatTime(state.currentSession.bombTimer)} ist die Zeit abgelaufen
          </div>
        </div>

        {/* Explosion particles effect */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-2 sm:p-6 bg-gradient-to-br from-red-100 to-orange-200 dark:bg-gradient-to-br dark:from-red-900 dark:to-orange-800 relative">
      {/* Theme Toggle - Fixed Position */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
        <ThemeToggle />
      </div>
      
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onNavigate("bomb-game-setup")}
                className="shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                  <Bomb className="h-6 w-6 text-red-500 animate-pulse" />
                  Bomb Game
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Die Bombe tickt... Wer wird sie haben, wenn sie explodiert?
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Timer Display */}
        <Card className="bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-red-600 mb-6">
              💣 Bombe tickt...
            </div>
            
            {/* Manual explosion button */}
            <Button 
              onClick={() => dispatch({ type: "EXPLODE_BOMB", playerId: "" })}
              className="bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-3 h-auto"
              size="lg"
            >
              <Bomb className="h-5 w-5 mr-2" />
              Bombe explodieren lassen
            </Button>
            
            <div className="text-sm text-muted-foreground mt-4">
              Klicke den Button, um die Bombe explodieren zu lassen
            </div>
          </CardContent>
        </Card>

        {/* Current Word */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-center">
              Aktuelles Wort
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold p-8 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
              {state.currentSession.currentWord}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Beschreibt dieses Wort, ohne es zu sagen!
            </p>
          </CardContent>
        </Card>

        {/* Players List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Spieler ({state.currentSession.players.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {state.currentSession.players.map((player) => (
                <Badge
                  key={player.id}
                  variant="outline"
                  className="text-base px-4 py-2"
                >
                  {player.name}
                  {state.currentSession!.trackLosses && (
                    <span className="ml-2 text-muted-foreground">
                      ({player.losses} Verluste)
                    </span>
                  )}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Game Info */}
        <Card className="bg-yellow-50 dark:bg-yellow-950/50 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              💡 Spielregeln
            </h3>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• Beschreibt das Wort, ohne es zu sagen</li>
              <li>• Die Bombe explodiert nach einer zufälligen Zeit</li>
              <li>• Wenn die Bombe explodiert, wählt ihr aus, wer sie hatte</li>
              <li>• Ein Wort pro Runde - kein Weitergeben nötig!</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
