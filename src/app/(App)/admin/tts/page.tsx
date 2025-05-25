"use client"
import TTSAudioManager from "@/components/ttsAudiosManager";
import TTSPreview from "@/components/TTSPreview";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Edit, FileText, Key, Plus, RefreshCw, Settings, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
// Types based on the API specification
interface ElevenLabsKey {
    _id: string
    name: string
    key: string
    usedCharacters: number
    characterLimit: number
    enabled: boolean
    lastCheckedAt?: string
    lastUsedAt?: string
    notes?: string
    tier: string
    createdAt: string
    updatedAt: string
}

interface TTSRequest {
    _id: string
    text: string
    voiceId: string
    apiKeyName: string
    charactersUsed: number
    durationMs: number
    status: string
    userId: string
    createdAt: string
    updatedAt: string
}

interface ElevenLabsConfig {
    _id?: string
    defaultVoiceId: string
    fallbackVoiceId: string
    voiceSettings: {
        stability: number
        similarity_boost: number
    }
    rotationStrategy: string
    cloudinaryFolder: string
    createdAt?: string
    updatedAt?: string
}


interface GeminiTTSVoice {
    name: string;
    voiceId: string;
    description: string;
}

export default function TTSAdminPage() {
    const [keys, setKeys] = useState<ElevenLabsKey[]>([])
    const [requests, setRequests] = useState<TTSRequest[]>([])
    const [config, setConfig] = useState<ElevenLabsConfig | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("keys")
    const [voicesIds, setVoiceIds] = useState<GeminiTTSVoice[]>(
        [{ name: "Zephyr - Bright", voiceId: "Zephyr", description: "Bright" },
        { name: "Puck - Upbeat", voiceId: "Puck", description: "Upbeat" }
        ])

    // Form states
    const [keyForm, setKeyForm] = useState({
        name: "",
        key: "",
        characterLimit: 10000,
        tier: "free",
        notes: "",
    })
    const [editingKey, setEditingKey] = useState<ElevenLabsKey | null>(null)
    const [keyDialogOpen, setKeyDialogOpen] = useState(false)
    const [editKeyDialogOpen, setEditKeyDialogOpen] = useState(false)

    const [configForm, setConfigForm] = useState<ElevenLabsConfig>({
        defaultVoiceId: "",
        fallbackVoiceId: "",
        voiceSettings: {
            stability: 0.3,
            similarity_boost: 0.75,
        },
        rotationStrategy: "least-used",
        cloudinaryFolder: "TTS_Audio",
    })

    const [selectedRequests, setSelectedRequests] = useState<Set<string>>(new Set())

    // Load initial data
    useEffect(() => {
        loadData()

    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const response = await fetch("/api/admin/tts/voices")
            const voices: GeminiTTSVoice[] = await response.json()
            setVoiceIds(voices)

            await Promise.all([loadKeys(), loadRequests(), loadConfig()])
        } catch (error) {
            toast.error("Failed to load data")
        } finally {
            setLoading(false)
        }
    }

    const loadKeys = async () => {
        try {
            const response = await fetch("/api/admin/tts/elevenlabs-keys")
            if (response.ok) {
                const data = await response.json()
                setKeys(data)
            }
        } catch (error) {
            console.error("Failed to load keys:", error)
        }
    }

    const loadRequests = async () => {
        try {
            const response = await fetch("/api/admin/tts/tts-requests")
            if (response.ok) {
                const data = await response.json()
                setRequests(data)
            }
        } catch (error) {
            console.error("Failed to load requests:", error)
        }
    }

    const loadConfig = async () => {
        try {
            const response = await fetch("/api/admin/tts/elevenlabs-config")
            if (response.ok) {
                const data = await response.json()
                setConfig(data)
                console.log(data)
                if (data.voiceSettings.stability && data.voiceSettings.similarity_boost) {
                    setConfigForm(data)
                }
                else {
                    setConfigForm({
                        ...configForm,
                        ...data,
                        voiceSettings: {
                            stability: 0.3,
                            similarity_boost: 0.75,
                            ...(data.voiceSettings || {})
                        }

                    })
                }
            }
        } catch (error) {
            console.error("Failed to load config:", error)
        }
    }

    const handleCreateKey = async () => {
        try {
            const response = await fetch("/api/admin/tts/elevenlabs-keys", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(keyForm),
            })

            if (response.ok) {
                await loadKeys()
                setKeyDialogOpen(false)
                setKeyForm({ name: "", key: "", characterLimit: 10000, tier: "free", notes: "" })
                toast.success("API key created successfully")
            } else {
                throw new Error("Failed to create key")
            }
        } catch (error) {
            toast.error("Failed to create API key")
        }
    }

    const handleUpdateKey = async (id: string, updates: Partial<ElevenLabsKey>) => {
        try {
            const response = await fetch(`/api/admin/tts/elevenlabs-keys/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            })

            if (response.ok) {
                await loadKeys()
                setEditKeyDialogOpen(false)
                toast.success("API key updated successfully")
            } else {
                throw new Error("Failed to update key")
            }
        } catch (error) {
            toast.error("Failed to update API key")
        }
    }

    const handleDeleteKey = async (id: string) => {
        try {
            const response = await fetch(`/api/admin/tts/elevenlabs-keys/${id}`, {
                method: "DELETE",
            })

            if (response.ok) {
                await loadKeys()
                toast.success("API key deleted successfully")
            } else {
                throw new Error("Failed to delete key")
            }
        } catch (error) {
            toast.error("Failed to delete API key")
        }
    }

    const handleEditKey = (key: ElevenLabsKey) => {
        setEditingKey(key)
        setEditKeyDialogOpen(true)
    }

    const handleUpdateConfig = async () => {
        try {
            const method = config ? "PATCH" : "POST"
            const response = await fetch("/api/admin/tts/elevenlabs-config", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(configForm),
            })

            if (response.ok) {
                await loadConfig()
                toast.success("Configuration updated successfully")
            } else {
                throw new Error("Failed to update config")
            }
        } catch (error) {
            toast.error("Failed to update configuration")
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString()
    }
    const getStatusBadge = (status: string) => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            success: "default",
            pending: "secondary",
            failed: "destructive",
            processing: "outline",
        }
        return <Badge variant={variants[status] || "outline"}>{status}</Badge>
    }

    const handleSelectRequest = (requestId: string, checked: boolean) => {
        setSelectedRequests((prev) => {
            const newSet = new Set(prev)
            if (checked) {
                newSet.add(requestId)
            } else {
                newSet.delete(requestId)
            }
            return newSet
        })
    }

    const handleSelectAllRequests = (checked: boolean) => {
        if (checked) {
            setSelectedRequests(new Set(requests.map((r) => r._id)))
        } else {
            setSelectedRequests(new Set())
        }
    }

    const handleDeleteSelectedRequests = async () => {
        try {
            const deletePromises = Array.from(selectedRequests).map((id) =>
                fetch(`/api/admin/tts/tts-requests/${id}`, { method: "DELETE" }),
            )

            await Promise.all(deletePromises)
            await loadRequests()
            setSelectedRequests(new Set())

            toast.success(`Deleted ${selectedRequests.size} request(s) successfully`)
        } catch (error) {
            toast.error("Failed to delete selected requests")
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <>
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">TTS Service Management</h1>
                        <p className="text-muted-foreground">Manage your Text-to-Speech service configuration and API keys</p>
                    </div>
                    <Button onClick={loadData} variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="keys" className="flex items-center gap-2">
                            <Key className="h-4 w-4" />
                            API Keys ({keys.length})
                        </TabsTrigger>
                        <TabsTrigger value="requests" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Requests ({requests.length})
                        </TabsTrigger>
                        <TabsTrigger value="config" className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Configuration
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="keys" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>ElevenLabs API Keys</CardTitle>
                                        <CardDescription>Manage your ElevenLabs API keys and monitor usage</CardDescription>
                                    </div>
                                    <Dialog open={keyDialogOpen} onOpenChange={setKeyDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Key
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Add New API Key</DialogTitle>
                                                <DialogDescription>Add a new ElevenLabs API key to your service</DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div>
                                                    <Label htmlFor="name">Name</Label>
                                                    <Input
                                                        id="name"
                                                        value={keyForm.name}
                                                        onChange={(e) => setKeyForm({ ...keyForm, name: e.target.value })}
                                                        placeholder="Key name"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="key">API Key</Label>
                                                    <Input
                                                        id="key"
                                                        type="password"
                                                        value={keyForm.key}
                                                        onChange={(e) => setKeyForm({ ...keyForm, key: e.target.value })}
                                                        placeholder="Your ElevenLabs API key"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="characterLimit">Character Limit</Label>
                                                    <Input
                                                        id="characterLimit"
                                                        type="number"
                                                        value={keyForm.characterLimit}
                                                        onChange={(e) => setKeyForm({ ...keyForm, characterLimit: Number.parseInt(e.target.value) })}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="tier">Tier</Label>
                                                    <Select value={keyForm.tier} onValueChange={(value) => setKeyForm({ ...keyForm, tier: value })}>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="free">Free</SelectItem>
                                                            <SelectItem value="starter">Starter</SelectItem>
                                                            <SelectItem value="creator">Creator</SelectItem>
                                                            <SelectItem value="pro">Pro</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label htmlFor="notes">Notes</Label>
                                                    <Textarea
                                                        id="notes"
                                                        value={keyForm.notes}
                                                        onChange={(e) => setKeyForm({ ...keyForm, notes: e.target.value })}
                                                        placeholder="Optional notes"
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setKeyDialogOpen(false)}>
                                                    Cancel
                                                </Button>
                                                <Button onClick={handleCreateKey}>Create Key</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Tier</TableHead>
                                            <TableHead>Usage</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Last Used</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {keys.map((key) => (
                                            <TableRow key={key._id}>
                                                <TableCell className="font-medium">{key.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{key.tier}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="text-sm">
                                                            {key.usedCharacters.toLocaleString()} / {key.characterLimit.toLocaleString()}
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-blue-600 h-2 rounded-full"
                                                                style={{ width: `${Math.min((key.usedCharacters / key.characterLimit) * 100, 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Switch
                                                            checked={key.enabled}
                                                            onCheckedChange={(enabled) => {
                                                                handleUpdateKey(key._id, { enabled });
                                                            }}
                                                        />
                                                        <span className="text-sm">{key.enabled ? "Enabled" : "Disabled"}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {key.lastUsedAt ? formatDate(key.lastUsedAt) : "Never"}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => handleEditKey(key)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="outline" size="sm">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to delete "{key.name}"? This action cannot be undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDeleteKey(key._id)}>Delete</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Edit Key Dialog */}
                    <Dialog open={editKeyDialogOpen} onOpenChange={setEditKeyDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit API Key</DialogTitle>
                                <DialogDescription>Update your ElevenLabs API key details</DialogDescription>
                            </DialogHeader>
                            {editingKey && (
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="edit-name">Name</Label>
                                        <Input
                                            id="edit-name"
                                            value={editingKey.name}
                                            onChange={(e) => setEditingKey({ ...editingKey, name: e.target.value })}
                                            placeholder="Key name"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit-key">API Key</Label>
                                        <Input
                                            id="edit-key"
                                            type="password"
                                            value={editingKey.key}
                                            onChange={(e) => setEditingKey({ ...editingKey, key: e.target.value })}
                                            placeholder="Your ElevenLabs API key"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit-characterLimit">Character Limit</Label>
                                        <Input
                                            id="edit-characterLimit"
                                            type="number"
                                            value={editingKey.characterLimit}
                                            onChange={(e) => setEditingKey({ ...editingKey, characterLimit: Number.parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit-tier">Tier</Label>
                                        <Select value={editingKey.tier} onValueChange={(value) => setEditingKey({ ...editingKey, tier: value })}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="free">Free</SelectItem>
                                                <SelectItem value="starter">Starter</SelectItem>
                                                <SelectItem value="creator">Creator</SelectItem>
                                                <SelectItem value="pro">Pro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="edit-enabled"
                                            checked={editingKey.enabled}
                                            onCheckedChange={(enabled) => setEditingKey({ ...editingKey, enabled })}
                                        />
                                        <Label htmlFor="edit-enabled">Enabled</Label>
                                    </div>
                                    <div>
                                        <Label htmlFor="edit-notes">Notes</Label>
                                        <Textarea
                                            id="edit-notes"
                                            value={editingKey.notes || ""}
                                            onChange={(e) => setEditingKey({ ...editingKey, notes: e.target.value })}
                                            placeholder="Optional notes"
                                        />
                                    </div>
                                </div>
                            )}
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setEditKeyDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={() => editingKey && handleUpdateKey(editingKey._id, editingKey)}>Update Key</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <TabsContent value="requests" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>TTS Requests</CardTitle>
                                        <CardDescription>Monitor all text-to-speech requests and their status</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {selectedRequests.size > 0 && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="sm">
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete Selected ({selectedRequests.size})
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Selected Requests</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to delete {selectedRequests.size} selected request(s)? This action
                                                            cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={handleDeleteSelectedRequests}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRequests.size === requests.length && requests.length > 0}
                                                    onChange={(e) => handleSelectAllRequests(e.target.checked)}
                                                    className="rounded"
                                                />
                                            </TableHead>
                                            <TableHead>Text Preview</TableHead>
                                            <TableHead>Voice ID</TableHead>
                                            <TableHead>API Key</TableHead>
                                            <TableHead>Characters</TableHead>
                                            <TableHead>Duration</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>User</TableHead>
                                            <TableHead>Created</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {requests.map((request) => (
                                            <TableRow key={request._id}>
                                                <TableCell>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRequests.has(request._id)}
                                                        onChange={(e) => handleSelectRequest(request._id, e.target.checked)}
                                                        className="rounded"
                                                    />
                                                </TableCell>
                                                <TableCell className="max-w-xs">
                                                    <div className="truncate" title={request.text}>
                                                        {request.text.length > 50 ? `${request.text.substring(0, 50)}...` : request.text}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">{request.voiceId}</TableCell>
                                                <TableCell>{request.apiKeyName}</TableCell>
                                                <TableCell>{request.charactersUsed}</TableCell>
                                                <TableCell>{(request.durationMs / 1000).toFixed(1)}s</TableCell>
                                                <TableCell>{getStatusBadge(request.status)}</TableCell>
                                                <TableCell className="font-mono text-sm">{request.userId}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{formatDate(request.createdAt)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="config" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>ElevenLabs Configuration</CardTitle>
                                <CardDescription>Configure global settings for your TTS service</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="defaultVoiceId">Default Voice ID</Label>
                                        <Select
                                            value={configForm.defaultVoiceId}
                                            onValueChange={(value) => setConfigForm({ ...configForm, defaultVoiceId: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {voicesIds.map((voice) => (
                                                    <SelectItem key={voice.voiceId} value={voice.voiceId}>
                                                        {voice.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <TTSPreview text={`Hi, I am Sam. Which stands for Speech And Audio Machine. With voice ${configForm.defaultVoiceId}`} voiceId={configForm.defaultVoiceId} type="Test" />
                                    </div>



                                    <div>
                                        <Label htmlFor="fallbackVoiceId">Fallback Voice ID</Label>
                                        <Select
                                            value={configForm.fallbackVoiceId}
                                            onValueChange={(value) => setConfigForm({ ...configForm, fallbackVoiceId: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {voicesIds.map((voice) => (
                                                    <SelectItem key={voice.voiceId} value={voice.voiceId}>
                                                        {voice.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <TTSPreview text={`Hi, I am Sam. Which stands for Speech And Audio Machine. With voice ${configForm.fallbackVoiceId}`} voiceId={configForm.fallbackVoiceId} type="Test" />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="rotationStrategy">Rotation Strategy</Label>
                                    <Select
                                        value={configForm.rotationStrategy}
                                        onValueChange={(value) => setConfigForm({ ...configForm, rotationStrategy: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="least-used">Least Used</SelectItem>
                                            <SelectItem value="round-robin">Round Robin</SelectItem>
                                            <SelectItem value="random">Random</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="cloudinaryFolder">Cloudinary Folder</Label>
                                    <Input
                                        id="cloudinaryFolder"
                                        value={configForm.cloudinaryFolder}
                                        onChange={(e) => setConfigForm({ ...configForm, cloudinaryFolder: e.target.value })}
                                        placeholder="TTS_Audio"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <Label>Voice Settings</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="stability">Stability ({configForm.voiceSettings.stability})</Label>
                                            <Input
                                                id="stability"
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.1"
                                                value={configForm.voiceSettings.stability}
                                                onChange={(e) =>
                                                    setConfigForm({
                                                        ...configForm,
                                                        voiceSettings: {
                                                            ...configForm.voiceSettings,
                                                            stability: Number.parseFloat(e.target.value),
                                                        },
                                                    })
                                                }
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="similarity_boost">
                                                Similarity Boost ({configForm.voiceSettings.similarity_boost})
                                            </Label>
                                            <Input
                                                id="similarity_boost"
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.05"
                                                value={configForm.voiceSettings.similarity_boost}
                                                onChange={(e) =>
                                                    setConfigForm({
                                                        ...configForm,
                                                        voiceSettings: {
                                                            ...configForm.voiceSettings,
                                                            similarity_boost: Number.parseFloat(e.target.value),
                                                        },
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button onClick={handleUpdateConfig} className="w-full">
                                    Save Configuration
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
                <TTSAudioManager />
            </div>
        </>
    )
}
