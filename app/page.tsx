"use client"

import { useState } from "react"
import { StartMenuScreen } from "@/components/screens/start-menu-screen"
import { SetupScreen } from "@/components/screens/setup-screen"
import { PlayerManagementScreen } from "@/components/screens/player-management-screen"  
import { RoleDistributionScreen } from "@/components/screens/role-distribution-screen"
import { StartPlayerScreen } from "@/components/screens/start-player-screen"
import { AssociationScreen } from "@/components/screens/association-screen"
import { DiscussionScreen } from "@/components/screens/discussion-screen"
import { ResultScreen } from "@/components/screens/result-screen"
import { BombGameCard } from "@/components/screens/bomb-game-card"
import { WordAssassinationCard } from "@/components/screens/word-assassination-card"
import { HeadsUpCard } from "@/components/screens/heads-up-card"
import { BetBuddyCard } from "@/components/screens/bet-buddy-card"
import { DatabaseManagementScreen } from "@/components/screens/database-management-screen"
import { UniversalGameManagementScreen } from "@/components/screens/universal-game-management-screen"
import { GameProvider } from "@/components/game-context"

export type Screen =
  | "start-menu"
  | "setup"
  | "player-management"
  | "word-management"
  | "database-management"
  | "bomb-game-management"
  | "word-assassination-management"
  | "heads-up-management"
  | "bet-buddy-management"
  | "role-distribution"
  | "start-player"
  | "association"
  | "discussion"
  | "result"
  | "bomb-game"
  | "word-assassination"
  | "heads-up"
  | "bet-buddy"

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("start-menu")

  const renderScreen = () => {
    switch (currentScreen) {
      case "start-menu":
        return <StartMenuScreen onNavigate={setCurrentScreen} />
      case "setup":
        return <SetupScreen onNavigate={setCurrentScreen} />
      case "player-management":
        return <PlayerManagementScreen onNavigate={setCurrentScreen} />
      case "word-management":
        return <UniversalGameManagementScreen gameType="imposter" onNavigate={setCurrentScreen} />
      case "database-management":
        return <DatabaseManagementScreen onNavigate={setCurrentScreen} />
      case "bomb-game-management":
        return <UniversalGameManagementScreen gameType="bomb-game" onNavigate={setCurrentScreen} />
      case "word-assassination-management":
        return <UniversalGameManagementScreen gameType="word-assassination" onNavigate={setCurrentScreen} />
      case "heads-up-management":
        return <UniversalGameManagementScreen gameType="heads-up" onNavigate={setCurrentScreen} />
      case "bet-buddy-management":
        return <UniversalGameManagementScreen gameType="bet-buddy" onNavigate={setCurrentScreen} />
      case "role-distribution":
        return <RoleDistributionScreen onNavigate={setCurrentScreen} />
      case "start-player":
        return <StartPlayerScreen onNavigate={setCurrentScreen} />
      case "association":
        return <AssociationScreen onNavigate={setCurrentScreen} />
      case "discussion":
        return <DiscussionScreen onNavigate={setCurrentScreen} />
      case "result":
        return <ResultScreen onNavigate={setCurrentScreen} />
      case "bomb-game":
        return (
          <div className="min-h-screen flex items-center justify-center p-6">
            <BombGameCard onNavigate={setCurrentScreen} />
          </div>
        )
      case "word-assassination":
        return (
          <div className="min-h-screen flex items-center justify-center p-6">
            <WordAssassinationCard onNavigate={setCurrentScreen} />
          </div>
        )
      case "heads-up":
        return (
          <div className="min-h-screen flex items-center justify-center p-6">
            <HeadsUpCard onNavigate={setCurrentScreen} />
          </div>
        )
      case "bet-buddy":
        return (
          <div className="min-h-screen flex items-center justify-center p-6">
            <BetBuddyCard onNavigate={setCurrentScreen} />
          </div>
        )
      default:
        return <StartMenuScreen onNavigate={setCurrentScreen} />
    }
  }

  return (
    <GameProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-200 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">{renderScreen()}</div>
    </GameProvider>
  )
}
