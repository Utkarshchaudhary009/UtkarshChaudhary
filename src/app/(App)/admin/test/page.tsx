"use client"

import AiPic from "@/components/AiPic"
import AudioPlayer from "@/components/AudioPlayer"
import TTSPreview from "@/components/TTSPreview"
import { Input } from "@/components/ui/input"
import { useState } from "react"
export default function Page() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [prompt, setPrompt] = useState("beautiful landscape with mountains")
  const [ttsContent, setTtsContent] = useState("")
  const [ttsUrl, setTtsUrl] = useState("")

  return (
    <div>
      <div className="container mx-auto p-4 space-y-6">

        <AiPic prompt={prompt} setSelectedImage={setSelectedImage} />

        {selectedImage && !document.querySelector('[role="dialog"]') && (
          <div className="mt-6">
            <h3 className="mb-2 text-lg font-medium">Selected Image</h3>
            <div className="overflow-hidden rounded-lg border">
              <img
                src={selectedImage || "/placeholder.svg"}
                alt="Selected image"
                className="max-h-[500px] w-full object-contain"
              />
            </div>
          </div>
        )}
      </div>

      <div className="container mx-auto p-4 space-y-6">
        <Input
          value={ttsContent}
          onChange={(e) => setTtsContent(e.target.value)}
          placeholder="Write here..."
          className="pl-10"
        />
        <TTSPreview text={ttsContent || ""} title={"Test"} sendAudioUrl={(url: string) => {
          setTtsUrl(url)
        }} />
        {ttsUrl && (
          <AudioPlayer
            audioUrl={ttsUrl || ""}
            className="fixed bottom-8 right-4"
          />
        )}
      </div>
    </div>
  )
}
