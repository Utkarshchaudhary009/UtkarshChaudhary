"use client"

import { Pause, Play } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function AudioPlayer({ audioUrl, className }: { audioUrl: string, className?: string }) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

    useEffect(() => {
        const audioElement = new Audio(audioUrl)
        setAudio(audioElement)

        audioElement.addEventListener("ended", () => setIsPlaying(false))

        return () => {
            audioElement.pause()
            audioElement.src = ""
        }
    }, [audioUrl])

    const togglePlay = () => {
        if (!audio) return

        if (isPlaying) {
            audio.pause()
            setIsPlaying(false)
        } else {
            audio.play()
            setIsPlaying(true)
        }
    }

    return (
        <div
            className={cn(
                "relative inline-flex items-center overflow-hidden rounded-full bg-muted-foreground px-4 py-2 text-white",
                className
            )}
        >
            {/* Animated "Listen" text */}
            <div className="relative overflow-hidden">
                <span
                    className={cn(
                        "absolute left-12 top-1/2 -translate-y-1/2 transform whitespace-nowrap text-sm font-medium text-white opacity-0 transition-all duration-500 group-hover:left-16 group-hover:opacity-100",
                        "glow-text"
                    )}
                >
                    Listen
                </span>
            </div>

            {/* Button with ripple and hover trigger */}
            <div className="group relative z-10">
                <div
                    className={cn(
                        "absolute inset-0 flex items-center justify-center",
                        isPlaying ? "animate-pulse-ring" : ""
                    )}
                >
                    <div className="h-16 w-16 rounded-full bg-white opacity-10 blur-lg" />
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={togglePlay}
                    className={cn(
                        "relative z-20 h-12 w-12 flex items-center justify-center rounded-full bg-white text-black transition-all"
                    )}
                    aria-label={isPlaying ? "Pause Audio" : "Play Audio"}
                >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
            </div>
        </div>
    )
}
