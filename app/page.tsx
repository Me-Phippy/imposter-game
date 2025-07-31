"use client"

import { useState } from "react"
import { StartMenuScreen } from "@/components/screens/start-menu-screen"
import { SetupScreen } from "@/components/screens/setup-screen"
import { PlayerManagementScreen } from "@/components/screens/player-management-screen"
import { WordManagementScreen } from "@/components/screens/word-management-screen"
import { RoleDistributionScreen } from "@/components/screens/role-distribution-screen"
import { StartPlayerScreen } from "@/components/screens/start-player-screen"
import { AssociationScreen } from "@/components/screens/association-screen"
import { DiscussionScreen } from "@/components/screens/discussion-screen"
import { ResultScreen } from "@/components/screens/result-screen"
import { GameProvider } from "@/components/game-context"

export type Screen =
  | "start-menu"
  | "setup"
  | "player-management"
  | "word-management"
  | "role-distribution"
  | "start-player"
  | "association"
  | "discussion"
  | "result"

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
        return <WordManagementScreen onNavigate={setCurrentScreen} />
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
      default:
        return <StartMenuScreen onNavigate={setCurrentScreen} />
    }
  }

  return (
    <GameProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">{renderScreen()}</div>
    </GameProvider>
  )
}
