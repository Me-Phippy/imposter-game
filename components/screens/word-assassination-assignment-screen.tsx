"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Target, Users, Play, Shuffle } from "lucide-react"
import { useWordAssassination } from "@/components/word-assassination-context"
import type { Screen } from "@/app/page"

interface WordAssassinationAssignmentScreenProps {
  onNavigate: (screen: Screen) => void
}

export function WordAssassinationAssignmentScreen({ onNavigate }: WordAssassinationAssignmentScreenProps) {
  const { state, dispatch, globalPlayers } = useWordAssassination()

  const handleStartReveal = () => {
    dispatch({ type: 'START_REVEAL' })
    onNavigate('word-assassination-reveal')
  }

  const handleReassign = () => {
    dispatch({ type: 'START_ASSIGNMENT', globalPlayers })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-red-950 dark:to-orange-950 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('word-assassination-setup')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          
          <div className="text-center flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-red-900 dark:text-red-100 mb-2 flex items-center justify-center gap-3">
              <Target className="h-8 w-8 sm:h-10 sm:w-10" />
              Ziele & Wörter zugewiesen
            </h1>
            <p className="text-red-700 dark:text-red-300 text-sm sm:text-base">
              {state.assignments.length} Zuweisungen erstellt
            </p>
          </div>
        </div>

        {/* Assignment Summary */}
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl text-blue-800 dark:text-blue-200">
              📋 Zuweisungsübersicht
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {state.selectedPlayers.length}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Spieler</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {state.words.length}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Wörter</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {state.assignments.length}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Zuweisungen</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignments Preview */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Users className="h-5 w-5" />
              Zuweisungen (Vorschau für Admin)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="grid gap-3">
              {state.assignments.map((assignment, index) => (
                <div key={assignment.playerId} className="border rounded-lg p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/50 dark:to-orange-950/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-lg">
                      <span className="text-red-700 dark:text-red-300">{assignment.playerName}</span>
                    </div>
                    <div className="text-sm text-muted-foreground font-mono">
                      #{index + 1}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-orange-600" />
                      <span className="text-muted-foreground">Ziel:</span>
                      <span className="font-medium text-orange-700 dark:text-orange-300">
                        {assignment.targetName}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 text-purple-600 flex items-center justify-center font-bold text-xs">
                        W
                      </div>
                      <span className="text-muted-foreground">Wort:</span>
                      <span className="font-medium text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/50 px-2 py-1 rounded">
                        {assignment.word}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                <strong>⚠️ Admin-Vorschau:</strong> Diese Übersicht ist nur für den Spielleiter gedacht. 
                Die Spieler werden ihre Zuweisungen einzeln und privat erhalten.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleReassign}
            variant="outline"
            className="flex-1 h-12 border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-950/50"
          >
            <Shuffle className="h-5 w-5 mr-2" />
            Neu zuweisen
          </Button>
          
          <Button
            onClick={handleStartReveal}
            className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white text-base font-medium"
          >
            <Play className="h-5 w-5 mr-2" />
            Zuweisungen enthüllen
          </Button>
        </div>

        {/* Instructions */}
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/50">
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
              <p><strong>📱 Nächster Schritt:</strong></p>
              <p>• Klicke auf "Zuweisungen enthüllen" um zu starten</p>
              <p>• Jeder Spieler wird einzeln seine Zuweisung erhalten</p>
              <p>• Andere Spieler sollen wegschauen während der Enthüllung</p>
              <p>• Nach allen Enthüllungen startet das Spiel</p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
