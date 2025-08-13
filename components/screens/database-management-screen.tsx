"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Database, Play, CheckCircle, AlertCircle, Users, Clock, Target, Lightbulb, Settings, Plus, ArrowLeft, Trash2, Edit, Lock } from "lucide-react"
import { PasswordInput } from '@/components/ui/password-input'
import { ThemeToggle } from "@/components/theme-toggle"
import { initializeAllGameDatabases } from '@/lib/initialize-game-data'
import type { Screen } from '@/app/page'

interface DatabaseManagementScreenProps {
  onNavigate?: (screen: Screen) => void
}
import { 
  useBombGameWords,
  useWordAssassinationWords, 
  useHeadsUpCards,
  useBetBuddyChallenges
} from '@/hooks/use-game-databases'


export function DatabaseManagementScreen({ onNavigate }: DatabaseManagementScreenProps) {
  const [isInitializing, setIsInitializing] = useState(false)
  const [initializationComplete, setInitializationComplete] = useState(false)
  const [adminMode, setAdminMode] = useState(false)
  const [showPasswordInput, setShowPasswordInput] = useState(false)
  const [pendingAction, setPendingAction] = useState<string>("")
  const [syncMessage, setSyncMessage] = useState<string>("")
  const [dupeLoading, setDupeLoading] = useState(false)

  // Use all game database hooks
  const bombGame = useBombGameWords()
  const wordAssassination = useWordAssassinationWords()
  const headsUp = useHeadsUpCards()
  const betBuddy = useBetBuddyChallenges()

  const handleInitializeAll = async () => {
    setIsInitializing(true)
    try {
      await initializeAllGameDatabases()
      setInitializationComplete(true)
    } catch (error) {
      console.error('Error initializing databases:', error)
    } finally {
      setIsInitializing(false)
    }
  }

  // Admin Auth
  const requirePassword = (action: string) => {
    setPendingAction(action)
    setShowPasswordInput(true)
  }
  const handlePasswordSuccess = () => {
    setAdminMode(true)
    setShowPasswordInput(false)
    setSyncMessage("✅ Admin-Modus aktiviert")
    setTimeout(() => setSyncMessage(""), 4000)
    setPendingAction("")
  }

  // Duplikate löschen (ältere Versionen)
  async function handleRemoveDuplicates(table: 'bombGame'|'wordAssassination'|'headsUp'|'betBuddy') {
    setDupeLoading(true)
    let items: any[] = []
    let removeFn: (id: string) => Promise<boolean>
    let key = 'word'
    if (table === 'bombGame') {
      items = bombGame.words
      removeFn = bombGame.removeWord
      key = 'word'
    } else if (table === 'wordAssassination') {
      items = wordAssassination.words
      removeFn = wordAssassination.removeWord
      key = 'word'
    } else if (table === 'headsUp') {
      items = headsUp.cards
      removeFn = headsUp.removeCard
      key = 'word'
    } else {
      items = betBuddy.challenges
      removeFn = betBuddy.removeChallenge
      key = 'title'
    }
    // Map: key -> [items]
    const map = new Map<string, any[]>();
    for (const item of items) {
      const k = (item[key] || '').toLowerCase().trim();
      if (!k) continue;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(item);
    }
    let removed = 0;
    for (const arr of map.values()) {
      if (arr.length > 1) {
        // Sort by dateAdded, keep the newest
        arr.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
        for (let i = 1; i < arr.length; ++i) {
          await removeFn(arr[i].id);
          removed++;
        }
      }
    }
    setSyncMessage(`🗑️ ${removed} Duplikate gelöscht`)
    setTimeout(() => setSyncMessage(""), 4000)
    setDupeLoading(false)
  }

  const gameStats = [
    {
      name: "IMPOSTER",
      icon: "🎮",
      table: "words",
      description: "Klassische Wortassoziations-Spiel Daten",
      color: "bg-blue-500",
      status: "active"
    },
    {
      name: "BOMB GAME", 
      icon: "💣",
      table: "bomb_game_words",
      description: "Explosive Wortspiele mit Zeitlimits",
      color: "bg-red-500",
      count: bombGame.words.length,
      status: bombGame.isConnected ? "active" : "offline"
    },
    {
      name: "WORD ASSASSINATION",
      icon: "🎯", 
      table: "word_assassination_words",
      description: "Tödliche Wortduelle mit verbotenen Begriffen",
      color: "bg-purple-500",
      count: wordAssassination.words.length,
      status: wordAssassination.isConnected ? "active" : "offline"
    },
    {
      name: "HEADS UP",
      icon: "📱",
      table: "heads_up_cards", 
      description: "Klassische Ratespiele mit Hinweisen",
      color: "bg-green-500",
      count: headsUp.cards.length,
      status: headsUp.isConnected ? "active" : "offline"
    },
    {
      name: "BET BUDDY",
      icon: "💰",
      table: "bet_buddy_challenges",
      description: "Strategische Wettspiele und Challenges",
      color: "bg-yellow-500",
      count: betBuddy.challenges.length,
      status: betBuddy.isConnected ? "active" : "offline"
    }
  ]

  return (
    <div className="min-h-screen p-2 sm:p-6 bg-gradient-to-br from-purple-100 to-blue-200 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 relative">
      {/* Theme Toggle - Fixed Position */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
        <ThemeToggle />
      </div>
      
      <div className="max-w-6xl mx-auto space-y-3 sm:space-y-6">
        {/* Header + Admin Auth */}
        <Card>
          <CardHeader className="text-center p-4 sm:p-6">
            <div className="flex items-center justify-center gap-3 mb-4 relative">
              {onNavigate && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onNavigate("start-menu")}
                  className="absolute left-0 h-8 w-8 sm:h-10 sm:w-10"
                >
                  <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              )}
              <Database className="h-6 w-6 sm:h-8 sm:w-8" />
              <CardTitle className="text-xl sm:text-3xl">
                <span className="hidden sm:inline">Spiele-Datenbank Verwaltung</span>
                <span className="sm:hidden">Datenbank Verwaltung</span>
              </CardTitle>
            </div>
            <CardDescription className="text-sm sm:text-lg">
              Verwalte alle Spieltabellen und überwache die Datenbank-Verbindungen
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-2">
            {syncMessage && (
              <div className="text-center text-blue-700 dark:text-blue-300 text-sm mb-2">{syncMessage}</div>
            )}
            {!adminMode && (
              <div className="flex flex-col items-center gap-2">
                <Button variant="outline" onClick={() => requirePassword('Admin-Modus aktivieren')} className="w-full max-w-xs">
                  <Lock className="h-4 w-4 mr-2" />
                  Admin-Modus aktivieren
                </Button>
                {showPasswordInput && (
                  <PasswordInput
                    onCorrectPassword={handlePasswordSuccess}
                    title={pendingAction || "Admin-Modus aktivieren"}
                    placeholder="Admin-Passwort eingeben"
                  />
                )}
              </div>
            )}
            {adminMode && (
              <div className="flex flex-col items-center gap-2">
                <Button variant="outline" onClick={() => setAdminMode(false)} className="w-full max-w-xs">
                  Admin-Modus verlassen
                </Button>
              </div>
            )}
            <div className="flex justify-center gap-2 sm:gap-4 flex-wrap mt-2">
              <Button
                onClick={handleInitializeAll}
                disabled={isInitializing}
                size="lg"
                className="flex items-center gap-2 h-10 sm:h-11 text-sm sm:text-base"
              >
                <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">{isInitializing ? "Initialisiere..." : "Datenbanken initialisieren"}</span>
                <span className="sm:hidden">{isInitializing ? "..." : "Initialisieren"}</span>
              </Button>
              {onNavigate && (
                <Button
                  onClick={() => onNavigate("word-management")}
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2 h-10 sm:h-11 text-sm sm:text-base"
                >
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Wörter verwalten</span>
                  <span className="sm:hidden">Wörter</span>
                </Button>
              )}
              {initializationComplete && (
                <Badge variant="secondary" className="flex items-center gap-2 px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Initialisierung abgeschlossen</span>
                  <span className="sm:hidden">Abgeschlossen</span>
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Game Database Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {gameStats.map((game, index) => {
            // Table key for dupe removal
            let tableKey: 'bombGame'|'wordAssassination'|'headsUp'|'betBuddy'|null = null;
            if (game.name === 'BOMB GAME') tableKey = 'bombGame';
            if (game.name === 'WORD ASSASSINATION') tableKey = 'wordAssassination';
            if (game.name === 'HEADS UP') tableKey = 'headsUp';
            if (game.name === 'BET BUDDY') tableKey = 'betBuddy';
            return (
              <Card key={index} className="relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-20 h-20 ${game.color} opacity-10 rounded-full -mr-10 -mt-10`}></div>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{game.icon}</span>
                      <CardTitle className="text-lg">{game.name}</CardTitle>
                    </div>
                    <Badge 
                      variant={game.status === "active" ? "default" : "destructive"}
                      className="flex items-center gap-1"
                    >
                      {game.status === "active" ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <AlertCircle className="h-3 w-3" />
                      )}
                      {game.status}
                    </Badge>
                  </div>
                  <CardDescription>{game.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tabelle:</span>
                      <code className="bg-muted px-2 py-1 rounded text-xs">{game.table}</code>
                    </div>
                    {game.count !== undefined && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Einträge:</span>
                        <span className="font-semibold">{game.count}</span>
                      </div>
                    )}
                    {adminMode && tableKey && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full mt-2 flex items-center gap-2"
                        disabled={dupeLoading}
                        onClick={() => handleRemoveDuplicates(tableKey!)}
                      >
                        <Trash2 className="h-4 w-4" />
                        {dupeLoading ? "Lösche Duplikate..." : "Duplikate löschen (ältere)"}
                      </Button>
                    )}
                    {onNavigate && game.name !== "IMPOSTER" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2 flex items-center gap-2"
                        onClick={() => onNavigate(`${game.name.toLowerCase().replace(/\s+/g, '-')}-management` as Screen)}
                      >
                        <Plus className="h-4 w-4" />
                        Daten hinzufügen
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Database Schema Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Datenbank-Schemas
            </CardTitle>
            <CardDescription>
              Detaillierte Struktur aller Spieltabellen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96 w-full">
              <div className="space-y-4">
                {/* Bomb Game Schema */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    💣 Bomb Game Schema
                  </h4>
                  <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
                    <div><code>id: string</code> - Eindeutige Kennung</div>
                    <div><code>word: string</code> - Das Wort für das Spiel</div>
                    <div><code>category: string</code> - Kategorie des Worts</div>
                    <div><code>difficulty: 'easy'|'medium'|'hard'</code> - Schwierigkeitsgrad</div>
                    <div><code>timeLimit: number</code> - Zeitlimit in Sekunden</div>
                    <div><code>dateAdded: string</code> - Hinzufügungsdatum</div>
                    <div><code>addedBy?: string</code> - Hinzugefügt von</div>
                  </div>
                </div>

                <Separator />

                {/* Word Assassination Schema */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    🎯 Word Assassination Schema
                  </h4>
                  <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
                    <div><code>id: string</code> - Eindeutige Kennung</div>
                    <div><code>word: string</code> - Das zu erratende Wort</div>
                    <div><code>category: string</code> - Kategorie des Worts</div>
                    <div><code>clues: string[]</code> - Hinweise zum Wort</div>
                    <div><code>forbiddenWords: string[]</code> - Verbotene Begriffe</div>
                    <div><code>points: number</code> - Punkte für das Erraten</div>
                    <div><code>dateAdded: string</code> - Hinzufügungsdatum</div>
                    <div><code>addedBy?: string</code> - Hinzugefügt von</div>
                  </div>
                </div>

                <Separator />

                {/* Heads Up Schema */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    📱 Heads Up Schema
                  </h4>
                  <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
                    <div><code>id: string</code> - Eindeutige Kennung</div>
                    <div><code>word: string</code> - Das zu erratende Wort</div>
                    <div><code>category: string</code> - Kategorie des Worts</div>
                    <div><code>hints: string[]</code> - Hinweise für den Spieler</div>
                    <div><code>difficulty: 'easy'|'medium'|'hard'</code> - Schwierigkeitsgrad</div>
                    <div><code>dateAdded: string</code> - Hinzufügungsdatum</div>
                    <div><code>addedBy?: string</code> - Hinzugefügt von</div>
                  </div>
                </div>

                <Separator />

                {/* Bet Buddy Schema */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    💰 Bet Buddy Schema
                  </h4>
                  <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
                    <div><code>id: string</code> - Eindeutige Kennung</div>
                    <div><code>title: string</code> - Titel der Challenge</div>
                    <div><code>description: string</code> - Beschreibung der Challenge</div>
                    <div><code>category: string</code> - Kategorie der Challenge</div>
                    <div><code>betType: 'time'|'accuracy'|'creativity'|'knowledge'</code> - Art der Wette</div>
                    <div><code>minPlayers: number</code> - Mindestanzahl Spieler</div>
                    <div><code>maxPlayers: number</code> - Maximale Anzahl Spieler</div>
                    <div><code>estimatedTime: number</code> - Geschätzte Dauer in Minuten</div>
                    <div><code>dateAdded: string</code> - Hinzufügungsdatum</div>
                    <div><code>addedBy?: string</code> - Hinzugefügt von</div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Verbindungsstatus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {bombGame.isConnected ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-red-500" />
                  )}
                </div>
                <div className="text-sm font-medium">Bomb Game</div>
                <div className="text-xs text-muted-foreground">
                  {bombGame.isLoading ? "Lädt..." : `${bombGame.words.length} Einträge`}
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {wordAssassination.isConnected ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-red-500" />
                  )}
                </div>
                <div className="text-sm font-medium">Word Assassination</div>
                <div className="text-xs text-muted-foreground">
                  {wordAssassination.isLoading ? "Lädt..." : `${wordAssassination.words.length} Einträge`}
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {headsUp.isConnected ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-red-500" />
                  )}
                </div>
                <div className="text-sm font-medium">Heads Up</div>
                <div className="text-xs text-muted-foreground">
                  {headsUp.isLoading ? "Lädt..." : `${headsUp.cards.length} Einträge`}
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {betBuddy.isConnected ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-red-500" />
                  )}
                </div>
                <div className="text-sm font-medium">Bet Buddy</div>
                <div className="text-xs text-muted-foreground">
                  {betBuddy.isLoading ? "Lädt..." : `${betBuddy.challenges.length} Einträge`}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
