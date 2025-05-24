"use client"

import { Pause, Play } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function AudioPlayer({ audioUrl, className }: { audioUrl: string, className?: string }) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

    useEffect(() => {
        // Create audio element for preview
        const audioElement = new Audio(audioUrl)
        setAudio(audioElement)

        audioElement.addEventListener("ended", () => {
            setIsPlaying(false)
        })

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
        <Button
            variant="outline"
            size="icon"
            className={cn("h-12 w-12 rounded-full", className)}
            onClick={togglePlay}

        >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            <span className="sr-only">{isPlaying ? "Pause" : "Play"} Audio</span>
        </Button>

    )
}
