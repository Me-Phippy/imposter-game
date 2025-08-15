"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import type { Screen } from "@/app/page"
import { useWordAssassination } from "@/components/word-assassination-context"

interface WordAssassinationRevealScreenProps {
  onNavigate: (screen: Screen) => void
}

export function WordAssassinationRevealScreen({ onNavigate }: WordAssassinationRevealScreenProps) {
  const { state, dispatch } = useWordAssassination()
  const [showNextButton, setShowNextButton] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [currentTransform, setCurrentTransform] = useState({ x: 0, y: 0 })
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)
  const wordRevealRef = useRef<HTMLDivElement>(null)

  const currentAssignment = state.assignments[state.currentRevealIndex]
  const isLastPlayer = state.currentRevealIndex === state.assignments.length - 1

  const getEventPos = (e: TouchEvent | MouseEvent | React.TouchEvent | React.MouseEvent) => {
    if ("touches" in e && e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY }
  }

  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)

    const pos = getEventPos(e)
    setStartPos({ x: pos.x, y: pos.y })

    // Hide button when starting to drag
    setShowNextButton(false)

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }
  }

  const handleMove = (e: TouchEvent | MouseEvent) => {
    if (!isDragging) return

    e.preventDefault()
    const pos = getEventPos(e)

    const deltaX = pos.x - startPos.x
    const deltaY = pos.y - startPos.y

    // Apply constraints to keep card somewhat on screen
    const maxMove = 150
    const constrainedX = Math.max(-maxMove, Math.min(maxMove, deltaX))
    const constrainedY = Math.max(-maxMove, Math.min(maxMove, deltaY))

    setCurrentTransform({ x: constrainedX, y: constrainedY })

    // Apply the movement
    if (cardRef.current) {
      cardRef.current.style.transform = `translate(-50%, -50%) translate(${constrainedX}px, ${constrainedY}px)`
    }

    // Show button when dragged far enough
    const distance = Math.sqrt(constrainedX * constrainedX + constrainedY * constrainedY)
    if (distance > 60) {
      setShowNextButton(true)
      if (wordRevealRef.current) {
        wordRevealRef.current.classList.add("animate-pulse")
      }
    }
  }

  const handleEnd = () => {
    if (!isDragging) return

    setIsDragging(false)

    // Animate back to center
    if (cardRef.current) {
      cardRef.current.style.transform = "translate(-50%, -50%)"
    }

    // Remove pulse effect
    if (wordRevealRef.current) {
      wordRevealRef.current.classList.remove("animate-pulse")
    }

    // Keep button visible if it was shown
    const distance = Math.sqrt(currentTransform.x * currentTransform.x + currentTransform.y * currentTransform.y)
    if (distance > 60) {
      setShowNextButton(true)
    }

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(20)
    }
  }

  const handleNext = () => {
    if (isLastPlayer) {
      onNavigate("word-assassination-play")
    } else {
      dispatch({ type: 'NEXT_REVEAL' })
      setShowNextButton(false)
      setCurrentTransform({ x: 0, y: 0 })
    }

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([50, 100, 50])
    }
  }

  const getMissionContent = () => {
    if (!currentAssignment) {
      return {
        title: "",
        content: "",
        bgColor: "from-gray-500 to-gray-600",
      }
    }
    
    return {
      title: `${currentAssignment.targetName}`,
      content: `"${currentAssignment.word}"`,
      bgColor: "from-red-500 to-red-600",
    }
  }

  const missionContent = getMissionContent()

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => handleMove(e)
    const handleTouchEnd = () => handleEnd()
    const handleMouseMove = (e: MouseEvent) => handleMove(e)
    const handleMouseUp = () => handleEnd()

    if (isDragging) {
      document.addEventListener("touchmove", handleTouchMove, { passive: false })
      document.addEventListener("touchend", handleTouchEnd)
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, startPos, currentTransform])

  if (!currentAssignment) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-100 dark:from-red-950 dark:to-orange-950 touch-none select-none overflow-hidden">
      {/* Drag Hint */}
      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 text-white text-center font-medium opacity-90 bg-black/20 px-5 py-2 rounded-full backdrop-blur-sm">
        Ziehe die Karte um deine Mission aufzudecken!
      </div>

      {/* Game Container */}
      <div className="relative w-[90vw] max-w-[350px] h-[70vh] max-h-[500px] bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Mission Reveal (Background) */}
        <div
          ref={wordRevealRef}
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4/5 h-32 bg-gradient-to-r ${missionContent.bgColor} rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg z-10`}
          style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
        >
          <div className="text-center">
            <div className="text-lg mb-1 opacity-90">🎯 Ziel:</div>
            <div className="text-2xl mb-2">{missionContent.title}</div>
            <div className="text-lg mb-1 opacity-90">💬 Wort:</div>
            <div className="text-2xl">{missionContent.content}</div>
          </div>
        </div>

        {/* Draggable Card */}
        <div
          ref={cardRef}
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[85%] h-52 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl cursor-grab z-20 shadow-xl border-2 border-white transition-all duration-300 ${
            isDragging ? "cursor-grabbing scale-105 shadow-2xl bg-gradient-to-br from-white to-gray-50" : ""
          }`}
          style={{
            transition: isDragging ? "none" : "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          onTouchStart={handleStart}
          onMouseDown={handleStart}
        >
          {/* Card Header */}
          <div className="h-16 bg-gradient-to-r from-red-600 to-orange-600 rounded-t-2xl flex items-center justify-center">
            <div className="bg-white/90 rounded-full px-4 py-2 font-semibold text-red-800 text-lg">
              {currentAssignment.playerName}
            </div>
          </div>

          {/* Card Body */}
          <div className="h-36 p-5 flex flex-col items-center justify-center text-center">
            <div className="text-4xl mb-3 opacity-70">🎯</div>
            <div className="text-gray-600 font-medium">Ziehe mich zum Aufdecken!</div>
          </div>
        </div>
      </div>

      {/* Next Button */}
      <button
        onClick={handleNext}
        className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white border-none rounded-full text-lg font-bold cursor-pointer shadow-lg min-w-36 transition-all duration-400 ${
          showNextButton ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        } hover:shadow-xl hover:-translate-y-1 active:translate-y-0`}
      >
        {isLastPlayer ? "Spiel starten" : "Weiterreichen"}
      </button>

      {/* Player Counter */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white/70 text-sm">
        Spieler {state.currentRevealIndex + 1} von {state.assignments.length}
      </div>
    </div>
  )
}
