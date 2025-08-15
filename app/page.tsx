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
import { BombGameSetupScreen } from "@/components/screens/bomb-game-setup-screen"
import { BombGamePlayScreen } from "@/components/screens/bomb-game-play-screen"
import { BombGameResultScreen } from "@/components/screens/bomb-game-result-screen"
import { WordAssassinationCard } from "@/components/screens/word-assassination-card"
import { WordAssassinationSetupScreen } from "@/components/screens/word-assassination-setup-screen"
import { WordAssassinationAssignmentScreen } from "@/components/screens/word-assassination-assignment-screen"
import { WordAssassinationRevealScreen } from "@/components/screens/word-assassination-reveal-screen"
import { WordAssassinationPlayScreen } from "@/components/screens/word-assassination-play-screen"
import { HeadsUpCard } from "@/components/screens/heads-up-card"
import { BetBuddyCard } from "@/components/screens/bet-buddy-card"
import { DatabaseManagementScreen } from "@/components/screens/database-management-screen"
import { UniversalGameManagementScreen } from "@/components/screens/universal-game-management-screen"
import { GameProvider } from "@/components/game-context"
import { BombGameProvider } from "@/components/bomb-game-context"
import { WordAssassinationProvider } from "@/components/word-assassination-context"

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
  | "bomb-game-setup"
  | "bomb-game-play"
  | "bomb-game-result"
  | "word-assassination"
  | "word-assassination-setup"
  | "word-assassination-assignment"
  | "word-assassination-reveal"
  | "word-assassination-play"
  | "heads-up"
  | "bet-buddy"

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("start-menu")

  const renderScreen = () => {
    // Wrap all Word Assassination screens with the provider
    const isWordAssassinationScreen = currentScreen.startsWith('word-assassination-')
    
    if (isWordAssassinationScreen) {
      return (
        <WordAssassinationProvider>
          {renderWordAssassinationScreen()}
        </WordAssassinationProvider>
      )
    }

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
      case "bomb-game-setup":
        return (
          <BombGameProvider>
            <BombGameSetupScreen onNavigate={setCurrentScreen} />
          </BombGameProvider>
        )
      case "bomb-game-play":
        return (
          <BombGameProvider>
            <BombGamePlayScreen onNavigate={setCurrentScreen} />
          </BombGameProvider>
        )
      case "bomb-game-result":
        return (
          <BombGameProvider>
            <BombGameResultScreen onNavigate={setCurrentScreen} />
          </BombGameProvider>
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

  const renderWordAssassinationScreen = () => {
    switch (currentScreen) {
      case "word-assassination-setup":
        return <WordAssassinationSetupScreen onNavigate={setCurrentScreen} />
      case "word-assassination-assignment":
        return <WordAssassinationAssignmentScreen onNavigate={setCurrentScreen} />
      case "word-assassination-reveal":
        return <WordAssassinationRevealScreen onNavigate={setCurrentScreen} />
      case "word-assassination-play":
        return <WordAssassinationPlayScreen onNavigate={setCurrentScreen} />
      default:
        return <WordAssassinationSetupScreen onNavigate={setCurrentScreen} />
    }
  }

  return (
    <GameProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-200 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">{renderScreen()}</div>
    </GameProvider>
  )
}
