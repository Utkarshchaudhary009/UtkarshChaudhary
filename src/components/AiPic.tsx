"use client"

import { Loader2, Plus, RotateCw, X, ZoomIn, ZoomOut } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

interface AiPicProps {
  prompt: string
  setSelectedImage: (image: string) => void
}

export default function AiPic({ prompt, setSelectedImage }: AiPicProps) {
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [ImgPrompt, setImgPrompt] = useState<string>(prompt)

  const fetchImages = useCallback(
    async (isLoadingMore = false) => {
      try {
        if (!isLoadingMore) {
          setLoading(true)
          setImages([])
        } else {
          setLoadingMore(true)
        }
        for (let i = 0; i < 4; i++) {
          const response = await fetch(`/api/ai/imageGen?data=${encodeURIComponent(ImgPrompt)}`)

          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`)
          }

          const data = await response.json()
          const newImage = data.base64Image
          fetch(`${newImage}`)
          setImages((prev) => (isLoadingMore ? [...prev, ...newImage] : newImage))
        }


        setError(null)
      } catch (err) {
        console.error("Error fetching images:", err)
        setError(err instanceof Error ? err.message : "Failed to generate images")
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [ImgPrompt],
  )

  useEffect(() => {
    const handler = setTimeout(() => {
      if (ImgPrompt) {
        fetchImages()
      }
    }, 600) // Wait 600ms after user stops typing
  
    return () => {
      clearTimeout(handler) // Clear timeout if prompt changes again within 600ms
    }
  }, [ImgPrompt, fetchImages])
  

  const handleImageClick = (image: string) => {
    setSelectedImage(image)
    setPreviewImage(image)
    setZoomLevel(1)
  }

  const handleLoadMore = () => {
    fetchImages(true)
  }

  const closePreview = () => {
    setPreviewImage(null)
    setZoomLevel(1)
  }

  const zoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3))
  }

  const zoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))
  }

  const resetZoom = () => {
    setZoomLevel(1)
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="space-y-2">
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
          Image Prompt
        </label>
        <div className="flex gap-2">
          <input
            id="prompt"
            type="text"
            value={ImgPrompt}
            onChange={(e) => setImgPrompt(e.target.value)}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Enter a prompt for image generation"
          />
        </div>
      </div>
      <div className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-700">
            {loading ? "Generating images..." : `Generated Images for: "${ImgPrompt}"`}
          </h3>
          {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
        <div className="flex w-full overflow-x-auto pb-4 pt-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <div className="flex gap-3 px-4">
            {loading ? (
              // Skeleton loaders
              Array(4)
                .fill(null)
                .map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="flex-shrink-0 animate-pulse rounded-md bg-gray-200 h-32 w-32"
                  ></div>
                ))
            ) : (
              <>
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="relative flex-shrink-0 cursor-pointer rounded-md border-2 border-transparent hover:border-gray-300 transition-all"
                    onClick={() => handleImageClick(image)}
                  >
                    <div className="h-32 w-32 overflow-hidden rounded-md">
                      <img
                        src={image || "/placeholder.svg?height=128&width=128"}
                        alt={`Generated image ${index + 1}`}
                        className="h-full w-full object-cover transition-transform duration-200 hover:scale-105"
                      />
                    </div>
                  </div>
                ))}
                {/* Load more button */}
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="flex h-32 w-32 flex-shrink-0 items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  {loadingMore ? (
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  ) : (
                    <Plus className="h-8 w-8 text-gray-400" />
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Full-screen preview */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4 animate-fadeIn"
          onClick={closePreview}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewImage || "/placeholder.svg"}
              alt="Preview"
              className="max-h-[90vh] max-w-[90vw] object-contain transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})` }}
            />

            {/* Controls */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={closePreview}
                className="rounded-full bg-black bg-opacity-50 p-2 text-white hover:bg-opacity-70 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black bg-opacity-50 p-2 rounded-full">
              <button
                onClick={zoomIn}
                className="rounded-full bg-black bg-opacity-50 p-2 text-white hover:bg-opacity-70 transition-colors"
              >
                <ZoomIn className="h-5 w-5" />
              </button>
              <button
                onClick={zoomOut}
                className="rounded-full bg-black bg-opacity-50 p-2 text-white hover:bg-opacity-70 transition-colors"
              >
                <ZoomOut className="h-5 w-5" />
              </button>
              <button
                onClick={resetZoom}
                className="rounded-full bg-black bg-opacity-50 p-2 text-white hover:bg-opacity-70 transition-colors"
              >
                <RotateCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
