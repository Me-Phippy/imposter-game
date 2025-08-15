"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Target, Trophy, Users, Clock, AlertTriangle, RotateCcw } from "lucide-react"
import { useWordAssassination } from "@/components/word-assassination-context"
import type { Screen } from "@/app/page"

interface WordAssassinationPlayScreenProps {
  onNavigate: (screen: Screen) => void
}

export function WordAssassinationPlayScreen({ onNavigate }: WordAssassinationPlayScreenProps) {
  const { state, dispatch } = useWordAssassination()
  const [gameTime, setGameTime] = useState(0)
  const [winners, setWinners] = useState<string[]>([])
  const [gameActive, setGameActive] = useState(true)

  // Timer
  useEffect(() => {
    if (!gameActive) return
    
    const timer = setInterval(() => {
      setGameTime(prev => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [gameActive])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handlePlayerWon = (playerId: string) => {
    const assignment = state.assignments.find(a => a.playerId === playerId)
    if (assignment && !winners.includes(playerId)) {
      setWinners(prev => [...prev, playerId])
    }
  }

  const handleEndGame = () => {
    setGameActive(false)
    dispatch({ type: 'FINISH_GAME' })
  }

  const handleNewGame = () => {
    dispatch({ type: 'RESET_GAME' })
    onNavigate('word-assassination-setup')
  }

  const handleBackToAssignment = () => {
    onNavigate('word-assassination-assignment')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-red-950 dark:to-orange-950 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToAssignment}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          
          <div className="text-center flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-red-900 dark:text-red-100 mb-2 flex items-center justify-center gap-3">
              <Target className="h-8 w-8 sm:h-10 sm:w-10" />
              Word Assassination
            </h1>
            <p className="text-red-700 dark:text-red-300 text-sm sm:text-base">
              {gameActive ? "Spiel läuft!" : "Spiel beendet"}
            </p>
          </div>
        </div>

        {/* Game Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50">
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {formatTime(gameTime)}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Spielzeit</div>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/50">
            <CardContent className="p-4 text-center">
              <Trophy className="h-6 w-6 mx-auto text-green-600 mb-2" />
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {winners.length}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">Gewinner</div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/50">
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 mx-auto text-orange-600 mb-2" />
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                {state.assignments.length - winners.length}
              </div>
              <div className="text-sm text-orange-600 dark:text-orange-400">Noch aktiv</div>
            </CardContent>
          </Card>
        </div>

        {/* Game Rules Reminder */}
        <Card className="border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/50">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl text-purple-800 dark:text-purple-200">
              🎯 Spielregeln (Erinnerung)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-purple-700 dark:text-purple-300">
              <div className="space-y-2">
                <p><strong>Dein Ziel:</strong> Bringe dein Ziel dazu, dein geheimes Wort zu sagen</p>
                <p><strong>Sei vorsichtig:</strong> Andere versuchen auch, dich zu täuschen</p>
              </div>
              <div className="space-y-2">
                <p><strong>Gewonnen:</strong> Wenn dein Ziel dein Wort sagt, hast du gewonnen!</p>
                <p><strong>Tipp:</strong> Stelle clevere Fragen und führe natürliche Gespräche</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Player Status */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Users className="h-5 w-5" />
              Spieler-Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid gap-3">
              {state.assignments.map((assignment) => {
                const hasWon = winners.includes(assignment.playerId)
                
                return (
                  <div key={assignment.playerId} className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                    hasWon 
                      ? 'bg-green-50 dark:bg-green-950/50 border-green-300 dark:border-green-700' 
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${
                        hasWon ? 'bg-green-500' : 'bg-orange-500 animate-pulse'
                      }`} />
                      <span className="font-medium text-lg">
                        {assignment.playerName}
                      </span>
                      {hasWon && (
                        <Trophy className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!hasWon && gameActive && (
                        <Button
                          onClick={() => handlePlayerWon(assignment.playerId)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Trophy className="h-4 w-4 mr-1" />
                          Hat gewonnen!
                        </Button>
                      )}
                      
                      {hasWon && (
                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                          🏆 Gewonnen!
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Winners Display */}
        {winners.length > 0 && (
          <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/50">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl text-green-800 dark:text-green-200">
                🏆 Hall of Fame
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3">
                {winners.map((winnerId, index) => {
                  const assignment = state.assignments.find(a => a.playerId === winnerId)
                  return assignment ? (
                    <div key={winnerId} className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          <span className="text-green-700 dark:text-green-300">{assignment.playerName}</span> hat 
                          <span className="text-orange-700 dark:text-orange-300 mx-1">{assignment.targetName}</span> 
                          dazu gebracht, 
                          <span className="text-purple-700 dark:text-purple-300 mx-1 font-bold">"{assignment.word}"</span> 
                          zu sagen!
                        </p>
                      </div>
                      <Trophy className="h-6 w-6 text-yellow-500" />
                    </div>
                  ) : null
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Game Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          {gameActive ? (
            <Button
              onClick={handleEndGame}
              variant="destructive"
              className="flex-1 h-12"
            >
              <AlertTriangle className="h-5 w-5 mr-2" />
              Spiel beenden
            </Button>
          ) : (
            <Button
              onClick={handleNewGame}
              className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Neues Spiel starten
            </Button>
          )}
        </div>

        {/* Game Statistics */}
        {!gameActive && (
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl text-blue-800 dark:text-blue-200">
                📊 Spielstatistiken
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {formatTime(gameTime)}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Gesamtzeit</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {winners.length}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Gewinner</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {state.assignments.length}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Spieler</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {Math.round((winners.length / state.assignments.length) * 100)}%
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Erfolgsrate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  )
}
