"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Plus, Trash2, Edit } from "lucide-react"
import type { Screen } from "@/app/page"
import { useGame, type Player } from "@/components/game-context"

interface PlayerManagementScreenProps {
  onNavigate: (screen: Screen) => void
}

export function PlayerManagementScreen({ onNavigate }: PlayerManagementScreenProps) {
  const { state, dispatch } = useGame()
  const [newPlayerName, setNewPlayerName] = useState("")
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [editName, setEditName] = useState("")

  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: newPlayerName.trim(),
      }
      dispatch({ type: "ADD_PLAYER", player: newPlayer })
      setNewPlayerName("")
    }
  }

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player)
    setEditName(player.name)
  }

  const handleSaveEdit = () => {
    if (editingPlayer && editName.trim()) {
      dispatch({
        type: "UPDATE_PLAYER",
        player: { ...editingPlayer, name: editName.trim() },
      })
      setEditingPlayer(null)
      setEditName("")
    }
  }

  const handleCancelEdit = () => {
    setEditingPlayer(null)
    setEditName("")
  }

  const handleDeletePlayer = (playerId: string) => {
    dispatch({ type: "REMOVE_PLAYER", playerId })
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-sm mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => onNavigate("start-menu")} className="h-12 w-12">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Spieler verwalten</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Neuen Spieler hinzufügen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="player-name" className="text-base font-medium">
                  Name
                </Label>
                <Input
                  id="player-name"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="Spielername eingeben"
                  onKeyPress={(e) => e.key === "Enter" && handleAddPlayer()}
                  className="h-12 text-base mt-2"
                />
              </div>
              <Button onClick={handleAddPlayer} disabled={!newPlayerName.trim()} className="w-full h-12 text-base">
                <Plus className="h-5 w-5 mr-2" />
                Hinzufügen
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Spielerliste ({state.players.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {state.players.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-base">Noch keine Spieler hinzugefügt</p>
            ) : (
              <div className="space-y-3">
                {state.players.map((player) => (
                  <div key={player.id} className="flex items-center justify-between p-4 border rounded-lg">
                    {editingPlayer?.id === player.id ? (
                      <div className="flex-1 flex gap-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleSaveEdit()}
                          className="h-10 text-base"
                        />
                        <Button size="sm" onClick={handleSaveEdit} className="h-10 px-4">
                          Speichern
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="h-10 px-4 bg-transparent"
                        >
                          Abbrechen
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="font-medium text-base">{player.name}</span>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEditPlayer(player)}
                            className="h-10 w-10"
                          >
                            <Edit className="h-5 w-5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeletePlayer(player.id)}
                            className="h-10 w-10"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
