"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import MarkdownRenderer from "@/components/ui/markdown-renderer"
import { Download, Loader2, Pause, Play, Volume2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

interface TTSPreviewProps {
    text: string
    title?: string
    className?: string
    sendAudioUrl?: (url: string) => void
    type?: "Test" | "NonTest"
    voiceId?: string
}

interface TTSResponse {
    success: boolean
    audioUrl?: string
    error?: string
    duration?: number
    charactersUsed?: number
}

export default function TTSPreview({ text, className = "", title = "", sendAudioUrl, type = "NonTest", voiceId }: TTSPreviewProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [duration, setDuration] = useState<number>(0)
    const [currentTime, setCurrentTime] = useState<number>(0)
    const [charactersUsed, setCharactersUsed] = useState<number>(0)
    const [previewTextCharacters, setPreviewTextCharacters] = useState<number>(0)
    const audioRef = useRef<HTMLAudioElement>(null)

    useEffect(() => {
        setPreviewTextCharacters(text.length)
    }, [text])

    const generateTTS = async () => {
        if (!text.trim()) {
            toast.error("Please provide text to convert")
            return
        }

        setIsLoading(true)
        if (type === "Test") {
            try {
                const response = await fetch(`/api/admin/tts/test?voiceName=${voiceId}`)
                const data: TTSResponse = await response.json()
                if (data.success && data.audioUrl) {
                    setAudioUrl(data.audioUrl)
                    setCharactersUsed(data.charactersUsed || text.length)
                    toast.success("Audio generated successfully")
                    sendAudioUrl?.(data.audioUrl)
                }
                else {
                    throw new Error(data.error || "Failed to generate audio")
                }
            } catch (error) {
                console.error("TTS Error:", error)
                toast.error(error instanceof Error ? error.message : "Failed to generate audio")
            } finally {
                setIsLoading(false)
            }
        }
        else {

            try {
                const response = await fetch("/api/admin/tts", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        text: text.trim(),
                        title: title
                    }),
                })

                const data: TTSResponse = await response.json()

                if (data.success && data.audioUrl) {
                    setAudioUrl(data.audioUrl)
                    setCharactersUsed(data.charactersUsed || text.length)
                    toast.success("Audio generated successfully")
                    sendAudioUrl?.(data.audioUrl)
                } else {
                    throw new Error(data.error || "Failed to generate audio")
                }
            } catch (error) {
                console.error("TTS Error:", error)
                toast.error(error instanceof Error ? error.message : "Failed to generate audio")
            } finally {
                setIsLoading(false)
            }
        }
    }

    const togglePlayPause = () => {
        if (!audioRef.current) return

        if (isPlaying) {
            audioRef.current.pause()
        } else {
            audioRef.current.play()
        }
        setIsPlaying(!isPlaying)
    }

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime)
        }
    }

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration)
        }
    }

    const handleEnded = () => {
        setIsPlaying(false)
        setCurrentTime(0)
    }

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = Number.parseFloat(e.target.value)
        if (audioRef.current) {
            audioRef.current.currentTime = time
            setCurrentTime(time)
        }
    }

    const downloadAudio = () => {
        if (!audioUrl) return

        const link = document.createElement("a")
        link.href = audioUrl
        link.download = `tts-audio-${Date.now()}.mp3`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast.success("Download Started")
    }

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes}:${seconds.toString().padStart(2, "0")}`
    }

    return (
        <Card className={`w-full ${className}`}>
            <CardContent className="p-4 space-y-4">
                {/* Text Preview */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Text to Convert</span>
                        {previewTextCharacters > 0 && <span className="text-xs text-muted-foreground">(Preview text:{previewTextCharacters} characters)</span>}
                        {charactersUsed > 0 && <span className="text-xs text-muted-foreground">(Used {charactersUsed} characters)</span>}
                    </div>
                    <div className="p-3 bg-muted rounded-md text-sm max-h-40 overflow-y-auto">
                        <MarkdownRenderer content={text} />
                    </div>
                </div>

                {/* Generate Button */}
                <Button onClick={generateTTS} disabled={isLoading || !text.trim()} className="w-full">
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating Audio...
                        </>
                    ) : (
                        <>
                            <Volume2 className="h-4 w-4 mr-2" />
                            Generate Audio
                        </>
                    )}
                </Button>

                {/* Audio Player */}
                {audioUrl && (
                    <div className="space-y-3 p-3 bg-muted/50 rounded-md">
                        <audio
                            ref={audioRef}
                            src={audioUrl}
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={handleLoadedMetadata}
                            onEnded={handleEnded}
                            preload="metadata"
                        />

                        {/* Controls */}
                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="sm" onClick={togglePlayPause} className="flex-shrink-0">
                                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>

                            {/* Progress Bar */}
                            <div className="flex-1 space-y-1">
                                <input
                                    type="range"
                                    min="0"
                                    max={duration || 0}
                                    value={currentTime}
                                    onChange={handleSeek}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                    style={{
                                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${duration ? (currentTime / duration) * 100 : 0
                                            }%, #e5e7eb ${duration ? (currentTime / duration) * 100 : 0}%, #e5e7eb 100%)`,
                                    }}
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{formatTime(currentTime)}</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={downloadAudio}
                                className="flex-shrink-0"
                                title="Download Audio"
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Audio Info */}
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Audio ready for playback</span>
                            <span>{duration ? `${formatTime(duration)} duration` : ""}</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
