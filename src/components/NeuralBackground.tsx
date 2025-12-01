"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "@/components/ThemeProvider"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
}

export function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { resolvedTheme } = useTheme()
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateDimensions = () => {
      if (typeof window !== "undefined") {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)

    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = dimensions.width
    canvas.height = dimensions.height

    const particles: Particle[] = []
    const particleCount = Math.min(100, Math.floor((dimensions.width * dimensions.height) / 15000))
    const connectionDistance = 150
    const mouseDistance = 200

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
      })
    }

    let mouseX = -1000
    let mouseY = -1000

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    window.addEventListener("mousemove", handleMouseMove)

    let animationFrameId: number

    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height)
      
      // Update and draw particles
      particles.forEach((particle, i) => {
        // Move
        particle.x += particle.vx
        particle.y += particle.vy

        // Bounce off edges
        if (particle.x < 0 || particle.x > dimensions.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > dimensions.height) particle.vy *= -1

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)"
        ctx.fill()

        // Connect to mouse
        const dxMouse = mouseX - particle.x
        const dyMouse = mouseY - particle.y
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse)

        if (distMouse < mouseDistance) {
            const opacity = 1 - distMouse / mouseDistance
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(mouseX, mouseY)
            ctx.strokeStyle = resolvedTheme === "dark" 
                ? `rgba(94, 234, 212, ${opacity * 0.5})` // Teal-ish in dark mode
                : `rgba(79, 70, 229, ${opacity * 0.5})` // Indigo-ish in light mode
            ctx.lineWidth = 1
            ctx.stroke()
            
            // Gentle push away from mouse
            if (distMouse < 50) {
                particle.vx -= dxMouse * 0.0005
                particle.vy -= dyMouse * 0.0005
            }
        }

        // Connect to other particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p2.x - particle.x
          const dy = p2.y - particle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < connectionDistance) {
            const opacity = 1 - distance / connectionDistance
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = resolvedTheme === "dark" 
                ? `rgba(255, 255, 255, ${opacity * 0.15})` 
                : `rgba(0, 0, 0, ${opacity * 0.15})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [dimensions, resolvedTheme])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none opacity-50"
      style={{ width: "100%", height: "100%" }}
    />
  )
}
