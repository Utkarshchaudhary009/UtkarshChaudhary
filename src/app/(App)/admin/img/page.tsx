"use client"

import { useState } from "react"
import AiPic from "@/components/AiPic"
export default function Page() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [prompt, setPrompt] = useState("beautiful landscape with mountains")

  return (
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
  )
}
