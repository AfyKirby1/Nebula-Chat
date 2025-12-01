"use client"

import * as React from "react"

export interface Artifact {
  id: string
  title: string
  content: string
  language: string
  type: "code" | "html" | "react"
  createdAt?: number
}

interface ArtifactContextType {
  currentArtifact: Artifact | null
  isOpen: boolean
  openArtifact: (artifact: Artifact) => void
  updateArtifact: (content: string) => void
  closeArtifact: () => void
  toggleArtifact: () => void
  deselectArtifact: () => void
}

const ArtifactContext = React.createContext<ArtifactContextType | undefined>(undefined)

export function ArtifactProvider({ children }: { children: React.ReactNode }) {
  const [currentArtifact, setCurrentArtifact] = React.useState<Artifact | null>(null)
  const [isOpen, setIsOpen] = React.useState(false)

  const openArtifact = React.useCallback((artifact: Artifact) => {
    setCurrentArtifact(artifact)
    setIsOpen(true)
  }, [])

  const updateArtifact = React.useCallback((content: string) => {
    setCurrentArtifact((prev) => prev ? { ...prev, content } : null)
  }, [])

  const closeArtifact = React.useCallback(() => {
    setIsOpen(false)
  }, [])

  const toggleArtifact = React.useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const deselectArtifact = React.useCallback(() => {
    setCurrentArtifact(null)
  }, [])

  return (
    <ArtifactContext.Provider value={{ currentArtifact, isOpen, openArtifact, updateArtifact, closeArtifact, toggleArtifact, deselectArtifact }}>
      {children}
    </ArtifactContext.Provider>
  )
}

export function useArtifact() {
  const context = React.useContext(ArtifactContext)
  if (context === undefined) {
    throw new Error("useArtifact must be used within an ArtifactProvider")
  }
  return context
}
