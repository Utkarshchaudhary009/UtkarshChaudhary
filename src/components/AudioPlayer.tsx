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
        <div className={cn("inline-flex z-50 items-center space-x-3 bg-muted-foreground text-white rounded-full pl-4 ", className)}>
            <span className="text-sm font-medium">Listen</span>
            <Button
                variant="outline"
                size="icon"
                onClick={togglePlay}
                className={cn("h-12 w-12 flex items-center justify-center rounded-full text-black bg-white  transition")}
                aria-label={isPlaying ? "Pause Audio" : "Play Audio"}
            >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
        </div>

    )
}
