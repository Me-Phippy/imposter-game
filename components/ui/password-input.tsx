"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Lock } from "lucide-react"

interface PasswordInputProps {
  onCorrectPassword: () => void
  placeholder?: string
  title?: string
}

export function PasswordInput({ onCorrectPassword, placeholder = "Passwort eingeben", title = "Passwort eingeben" }: PasswordInputProps) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === "PozzivorBio") {
      onCorrectPassword()
      setPassword("")
      setError(false)
    } else {
      setError(true)
      setPassword("")
    }
  }

  return (
    <div className="space-y-4 p-6 border rounded-lg bg-card">
      <div className="flex items-center gap-2">
        <Lock className="h-5 w-5" />
        <h3 className="font-semibold">{title}</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">{placeholder}</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(false)
              }}
              placeholder={placeholder}
              className={error ? "border-red-500" : ""}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {error && (
            <p className="text-sm text-red-500">Falsches Passwort!</p>
          )}
        </div>
        
        <Button type="submit" className="w-full">
          Entsperren
        </Button>
      </form>
    </div>
  )
}
