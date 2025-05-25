"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Pause, Play } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface AudioPlayerProps {
    audioUrl: string
    className?: string
}

export default function AudioPlayer({ audioUrl, className }: AudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
    const [bars, setBars] = useState<number[]>(new Array(20).fill(10))
    const animationRef = useRef<number>(0)

    useEffect(() => {
        const audioElement = new Audio(audioUrl)
        setAudio(audioElement)

        audioElement.addEventListener("ended", () => {
            setIsPlaying(false)
            cancelAnimationFrame(animationRef.current!)
        })

        return () => {
            audioElement.pause()
            audioElement.src = ""
        }
    }, [audioUrl])

    const animateBars = () => {
        setBars(bars.map(() => Math.floor(Math.random() * 30 + 5))) // height between 5px and 35px
        animationRef.current = requestAnimationFrame(animateBars)
    }

    const togglePlay = () => {
        if (!audio) return

        if (isPlaying) {
            audio.pause()
            setIsPlaying(false)
            cancelAnimationFrame(animationRef.current!)
        } else {
            audio.play()
            setIsPlaying(true)
            animateBars()
        }
    }

    return (
        <div className={cn("inline-flex z-50 items-center space-x-3 bg-muted-foreground text-white rounded-full pl-4", className)}>
            <div className="flex space-x-1 items-end h-10 w-40">
                {isPlaying ? (
                    bars.map((height, i) => (
                        <div
                            key={i}
                            style={{ height: `${height}px` }}
                            className="w-[2px] bg-white rounded-sm transition-all duration-100"
                        />
                    ))
                ) : (
                    <span className="text-sm font-medium">Listen</span>
                )}
            </div>

            <Button
                variant="outline"
                size="icon"
                onClick={togglePlay}
                className="h-12 w-12 flex items-center justify-center rounded-full text-black bg-white  transition"
                aria-label={isPlaying ? "Pause Audio" : "Play Audio"}
            >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
        </div>
    )
}
