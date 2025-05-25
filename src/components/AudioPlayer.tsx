'use client'

import { Pause, Play } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AudioPlayerProps {
    audioUrl: string
    className?: string
}

export default function AudioPlayer({ audioUrl, className }: AudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const progressRef = useRef<HTMLDivElement | null>(null)
    const animationRef = useRef<number | null>(null)

    // Load audio and draw waveform
    useEffect(() => {
        const audio = new Audio(audioUrl)
        audioRef.current = audio

        const ctx = new AudioContext()
        fetch(audioUrl)
            .then(res => res.arrayBuffer())
            .then(buffer => ctx.decodeAudioData(buffer))
            .then(decoded => {
                drawWaveform(decoded)
            })

        audio.addEventListener("ended", () => {
            setIsPlaying(false)
            cancelAnimationFrame(animationRef.current!)
        })

        return () => {
            audio.pause()
            audio.src = ""
        }
    }, [audioUrl])

    const drawWaveform = (buffer: AudioBuffer) => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const { width, height } = canvas
        canvas.width = width
        canvas.height = height

        ctx.clearRect(0, 0, width, height)

        const data = buffer.getChannelData(0)
        const step = Math.floor(data.length / width)
        const amp = height / 2

        ctx.fillStyle = "#ccc"
        for (let i = 0; i < width; i++) {
            let min = 1.0
            let max = -1.0

            for (let j = 0; j < step; j++) {
                const datum = data[i * step + j]
                if (datum < min) min = datum
                if (datum > max) max = datum
            }

            ctx.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp))
        }
    }

    const animateProgress = () => {
        if (!audioRef.current || !progressRef.current) return

        const update = () => {
            const progress =
                (audioRef.current!.currentTime / audioRef.current!.duration) * 100
            progressRef.current!.style.width = `${progress}%`
            animationRef.current = requestAnimationFrame(update)
        }

        update()
    }

    const togglePlay = () => {
        if (!audioRef.current) return

        if (isPlaying) {
            audioRef.current.pause()
            setIsPlaying(false)
            cancelAnimationFrame(animationRef.current!)
        } else {
            audioRef.current.play()
            setIsPlaying(true)
            animateProgress()
        }
    }

    return (
        <div
            className={cn(
                "inline-flex items-center space-x-3 bg-muted-foreground text-white rounded-full px-4 py-2",
                className
            )}
        >{isPlaying ?
            <div className="relative">
                <canvas
                    ref={canvasRef}
                    width={160}
                    height={30}
                    className="w-40 h-8 bg-transparent"
                />
                <div className="absolute top-0 left-0 h-full bg-white/80 pointer-events-none" ref={progressRef} style={{ width: "0%" }} />
            </div>
            :
            <span className="text-sm font-medium">Listen</span>}
            <Button
                variant="outline"
                size="icon"
                onClick={togglePlay}
                className="h-12 w-12 rounded-full text-black bg-white transition"
                aria-label={isPlaying ? "Pause Audio" : "Play Audio"}
            >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
        </div>
    )
}
