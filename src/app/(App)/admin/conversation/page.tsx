"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { WaitForAudio } from "@/lib/utils"
import {
    CheckCircle,
    Clock,
    Download,
    Loader2,
    MessageSquare,
    Pause,
    Play,
    Plus,
    Sparkles,
    Trash2,
    Users,
    Volume2,
    Wand2,
} from "lucide-react"
import { useEffect, useState } from "react"

interface Voice {
    name: string
    voiceId: string
    description: string
}

interface Speaker {
    id: string
    name: string
    voiceName: string
    description: string
}

interface ConversationItem {
    id: string
    speakerName: string
    text: string
}

interface TTSResponse {
    success: boolean
    audioUrl?: string
    error?: string
    duration?: number
    charactersUsed?: number
}

interface ConversationResponse {
    success: boolean
    speakers?: Array<{ name: string; voiceName: string; description: string }>
    content?: Array<{ speakerName: string; text: string }>
    conversationStyle?: string
    conversationFileName?: string
    error?: string
}

export default function ConversationGenerator() {
    const [voices, setVoices] = useState<Voice[]>([])
    const [speakers, setSpeakers] = useState<Speaker[]>([])
    const [conversation, setConversation] = useState<ConversationItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingVoices, setIsLoadingVoices] = useState(true)
    const [isGeneratingConversation, setIsGeneratingConversation] = useState(false)
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
    const [response, setResponse] = useState<TTSResponse | null>(null)
    const [newSpeakerDescription, setNewSpeakerDescription] = useState("")
    const [conversationStyle, setConversationStyle] = useState("")
    const [conversationFileName, setConversationFileName] = useState("")

    // AI conversation generation
    const [conversationPrompt, setConversationPrompt] = useState("")

    // New speaker form
    const [newSpeakerName, setNewSpeakerName] = useState("")
    const [newSpeakerVoice, setNewSpeakerVoice] = useState("")

    // New conversation item form
    const [newItemSpeaker, setNewItemSpeaker] = useState("")
    const [newItemText, setNewItemText] = useState("")

    // Fetch available voices on component mount
    useEffect(() => {
        fetchVoices()
    }, [])

    // Setup audio element
    useEffect(() => {
        if (audioUrl && !audioElement) {
            const audio = new Audio(audioUrl)
            audio.onended = () => setIsPlaying(false)
            audio.onplay = () => setIsPlaying(true)
            audio.onpause = () => setIsPlaying(false)
            setAudioElement(audio)
        }
    }, [audioUrl, audioElement])

    const fetchVoices = async () => {
        try {
            setIsLoadingVoices(true)
            const response = await fetch("/api/admin/tts/voices")
            if (!response.ok) throw new Error("Failed to fetch voices")
            const voicesData = await response.json()
            setVoices(voicesData)
        } catch (err) {
            setError("Failed to load voices")
            console.error("Error fetching voices:", err)
        } finally {
            setIsLoadingVoices(false)
        }
    }

    const generateConversation = async () => {
        if (!conversationPrompt.trim()) {
            setError("Please enter a conversation prompt")
            return
        }

        setIsGeneratingConversation(true)
        setError(null)

        try {
            const response = await fetch("/api/admin/conversation", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    prompt: conversationPrompt.trim()
                }),
            })

            const data: ConversationResponse = await response.json()

            if (data.success && data.speakers && data.content) {
                // Clear existing data
                setSpeakers([])
                setConversation([])
                setConversationStyle(data.conversationStyle || "")
                setConversationFileName(data.conversationFileName?.split(".")[0] || "")
                // Add generated speakers
                const generatedSpeakers = data.speakers.map((speaker, index) => ({
                    id: `generated-${index}`,
                    name: speaker.name,
                    voiceName: speaker.voiceName,
                    description: speaker.description
                }))
                setSpeakers(generatedSpeakers)

                // Add generated conversation
                const generatedConversation = data.content.map((item, index) => ({
                    id: `generated-conv-${index}`,
                    speakerName: item.speakerName,
                    text: item.text,
                }))
                setConversation(generatedConversation)
                setConversationPrompt("")
            } else {
                setError(data.error || "Failed to generate conversation")
            }
        } catch (err) {
            setError("Network error occurred while generating conversation")
            console.error("Error generating conversation:", err)
        } finally {
            setIsGeneratingConversation(false)
        }
    }

    const addSpeaker = () => {
        if (!newSpeakerName.trim() || !newSpeakerVoice) return

        const speaker: Speaker = {
            id: Date.now().toString(),
            name: newSpeakerName.trim(),
            voiceName: newSpeakerVoice,
            description: newSpeakerDescription.trim()
        }

        setSpeakers([...speakers, speaker])
        setNewSpeakerName("")
        setNewSpeakerVoice("")
    }

    const removeSpeaker = (id: string) => {
        setSpeakers(speakers.filter((s) => s.id !== id))
        // Remove conversation items for this speaker
        const speakerName = speakers.find((s) => s.id === id)?.name
        if (speakerName) {
            setConversation(conversation.filter((c) => c.speakerName !== speakerName))
        }
    }

    const addConversationItem = () => {
        if (!newItemSpeaker || !newItemText.trim()) return

        const item: ConversationItem = {
            id: Date.now().toString(),
            speakerName: newItemSpeaker,
            text: newItemText.trim(),
        }

        setConversation([...conversation, item])
        setNewItemText("")
    }

    const removeConversationItem = (id: string) => {
        setConversation(conversation.filter((c) => c.id !== id))
    }

    const generateAudio = async () => {
        if (speakers.length === 0) {
            setError("Please add at least one speaker")
            return
        }

        if (conversation.length === 0) {
            setError("Please add at least one conversation item")
            return
        }

        setIsLoading(true)
        setError(null)
        setAudioUrl(null)
        setResponse(null)

        try {
            const requestBody = {
                speakers: speakers.map((s) => ({
                    name: s.name,
                    voiceName: s.voiceName,
                    description: s.description
                })),
                content: conversation.map((c) => ({
                    speakerName: c.speakerName,
                    text: c.text,
                })),
                conversationStyle: conversationStyle,
                conversationFileName: conversationFileName,
            }

            const response = await fetch("/api/admin/conversation/tts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            })
            // Generate a filename based on the conversation
            const Conversation = conversation.map(c => `${c.speakerName}: ${c.text}`).join('\n');
            const SpeakersDetails = speakers.map(s => `${s.name} a ${s.description}`).join(' and ');
            const prompt = `The Speakers are ${SpeakersDetails} and the Conversation is ${Conversation}.`;
            await WaitForAudio(prompt)

            const data: TTSResponse = await response.json()
            setResponse(data)

            if (data.success && data.audioUrl) {
                setAudioUrl(data.audioUrl)
            } else {
                setError(data.error || "Failed to generate audio")
            }
        } catch (err) {
            setError("Network error occurred")
            console.error("Error generating audio:", err)
        } finally {
            setIsLoading(false)
        }
    }

    const togglePlayback = () => {
        if (!audioElement) return

        if (isPlaying) {
            audioElement.pause()
        } else {
            audioElement.play()
        }
    }

    const downloadAudio = async () => {
        if (!audioUrl) return

        try {
            const response = await fetch(audioUrl)
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.style.display = "none"
            a.href = url
            a.download = `conversation-${Date.now()}.wav`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (err) {
            console.error("Error downloading audio:", err)
            setError("Failed to download audio file")
        }
    }

    const totalCharacters = conversation.reduce((sum, item) => sum + item.text.length, 0)

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Multi-Speaker Conversation Generator</h1>
                <p className="text-muted-foreground">
                    Create conversations with multiple speakers and generate audio using Gemini TTS
                </p>
            </div>


            {/* AI Conversation Generation */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        AI Conversation Generator
                    </CardTitle>
                    <CardDescription>
                        Describe what kind of conversation you want and AI will generate speakers and dialogue
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-3 space-y-2">
                            <Label htmlFor="conversationPrompt">Conversation Topic</Label>
                            <Input
                                id="conversationPrompt"
                                placeholder="e.g., job interview for software developer, podcast about AI, team meeting about product launch"
                                value={conversationPrompt}
                                onChange={(e) => setConversationPrompt(e.target.value)}
                            />
                        </div>
                        <div className="flex items-end">
                            <Button
                                onClick={generateConversation}
                                disabled={isGeneratingConversation || !conversationPrompt.trim()}
                                className="w-full"
                            >
                                {isGeneratingConversation ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="h-4 w-4 mr-2" />
                                        Generate
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Conversation Details Management Like Style of conversation, file Name, etc*/}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Conversation Details
                    </CardTitle>
                    <CardDescription>Add details for your conversation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="conversationStyle">Conversation Style</Label>
                            <Input
                                id="conversationStyle"
                                placeholder="e.g., Casual, Formal, Professional, etc."
                                value={conversationStyle}
                                onChange={(e) => setConversationStyle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="conversationFileName">Conversation File Name</Label>
                            <Input
                                id="conversationFileName"
                                placeholder="e.g., Conversation_with_Alice_and_Bob"
                                value={conversationFileName}
                                onChange={(e) => setConversationFileName(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Speakers Management */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Speakers ({speakers.length})
                    </CardTitle>
                    <CardDescription>Add speakers and assign voices for your conversation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Add Speaker Form */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="speakerName">Speaker Name</Label>
                            <Input
                                id="speakerName"
                                placeholder="e.g., Alice"
                                value={newSpeakerName}
                                onChange={(e) => setNewSpeakerName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="speakerDescription">Speaker Description</Label>
                            <Input
                                id="speakerDescription"
                                placeholder="e.g., Alice is a software developer"
                                value={newSpeakerDescription}
                                onChange={(e) => setNewSpeakerDescription(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="speakerVoice">Voice</Label>
                            <Select value={newSpeakerVoice} onValueChange={setNewSpeakerVoice}>
                                <SelectTrigger>
                                    <SelectValue placeholder={isLoadingVoices ? "Loading voices..." : "Select voice"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {voices.map((voice) => (
                                        <SelectItem key={voice.voiceId} value={voice.voiceId}>
                                            {voice.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end">
                            <Button
                                onClick={addSpeaker}
                                disabled={!newSpeakerName.trim() || !newSpeakerVoice || isLoadingVoices}
                                className="w-full"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Speaker
                            </Button>
                        </div>
                    </div>

                    {/* Speakers List */}
                    {speakers.length > 0 && (
                        <div className="space-y-2">
                            <Separator />
                            <div className="grid gap-2">
                                {speakers.map((speaker) => (
                                    <div key={speaker.id} className="justify-between p-3 border rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="secondary">{speaker.name}</Badge>
                                                <span className="text-sm text-muted-foreground">
                                                    {voices.find((v) => v.voiceId === speaker.voiceName)?.name || speaker.voiceName}
                                                </span>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => removeSpeaker(speaker.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <Badge variant="secondary" className="text-muted-foreground">
                                            {speaker.description}
                                        </Badge>
                                    </div>

                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Conversation Management */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Conversation ({conversation.length} items, {totalCharacters} characters)
                    </CardTitle>
                    <CardDescription>Build your conversation by adding dialogue for each speaker</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Add Conversation Item Form */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="itemSpeaker">Speaker</Label>
                            <Select value={newItemSpeaker} onValueChange={setNewItemSpeaker}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select speaker" />
                                </SelectTrigger>
                                <SelectContent>
                                    {speakers.map((speaker) => (
                                        <SelectItem key={speaker.id} value={speaker.name}>
                                            {speaker.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="itemText">Text</Label>
                            <Textarea
                                id="itemText"
                                placeholder="What does this speaker say?"
                                value={newItemText}
                                onChange={(e) => setNewItemText(e.target.value)}
                                rows={2}
                            />
                        </div>
                        <div className="flex items-end">
                            <Button
                                onClick={addConversationItem}
                                disabled={!newItemSpeaker || !newItemText.trim()}
                                className="w-full"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Line
                            </Button>
                        </div>
                    </div>

                    {/* Conversation Preview */}
                    {conversation.length > 0 && (
                        <div className="space-y-2">
                            <Separator />
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {conversation.map((item, index) => (
                                    <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg">
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs">
                                                    {index + 1}
                                                </Badge>
                                                <Badge>{item.speakerName}</Badge>
                                            </div>
                                            <p className="text-sm">{item.text}</p>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => removeConversationItem(item.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Generate Audio */}
            <Card>
                <CardContent className="pt-6">
                    <Button
                        onClick={generateAudio}
                        disabled={isLoading || speakers.length === 0 || conversation.length === 0}
                        className="w-full"
                        size="lg"
                    >
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
                </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Audio Player */}
            {audioUrl && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            Generated Audio
                        </CardTitle>
                        {response && (
                            <CardDescription className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    Duration: {response.duration}s
                                </span>
                                <span>Characters used: {response.charactersUsed}</span>
                            </CardDescription>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Button onClick={togglePlayback} variant="outline" size="lg">
                                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                            </Button>
                            <div className="flex-1">
                                <audio
                                    controls
                                    src={audioUrl}
                                    className="w-full"
                                    onPlay={() => setIsPlaying(true)}
                                    onPause={() => setIsPlaying(false)}
                                    onEnded={() => setIsPlaying(false)}
                                />
                            </div>
                            <Button onClick={downloadAudio} variant="outline" size="lg">
                                <Download className="h-5 w-5" />
                            </Button>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            <a href={audioUrl} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
                                Open audio in new tab
                            </a>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
