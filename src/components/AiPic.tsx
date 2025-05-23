"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { RotateCcw, Search, X, ZoomIn, ZoomOut } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

interface ImageSelectorProps {
  prompt?: string
  setSelectedImage: (image: { url: string; id: string } | null) => void
}

interface UnsplashImage {
  id: string
  urls: {
    regular: string
    small: string
    thumb: string
  }
  alt_description: string
  user: {
    name: string
  }
}

export default function AiPic({ prompt = "nature", setSelectedImage }: ImageSelectorProps) {
  const [searchPrompt, setSearchPrompt] = useState(prompt)
  const [debouncedPrompt, setDebouncedPrompt] = useState(prompt)
  const [images, setImages] = useState<UnsplashImage[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [previewImage, setPreviewImage] = useState<UnsplashImage | null>(null)
  const [scale, setScale] = useState(1)

  const observer = useRef<IntersectionObserver | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const lastImageRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return

      if (observer.current) observer.current.disconnect()

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            setPage((prevPage) => prevPage + 1)
          }
        },
        { threshold: 0.5 },
      )

      if (node) observer.current.observe(node)
    },
    [loading, hasMore],
  )

  // Debounce search prompt
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPrompt(searchPrompt)
      setPage(1)
      setImages([])
      setHasMore(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchPrompt])

  // Fetch images
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true)
        if (page === 1) setInitialLoading(true)

        const response = await fetch(
          `/api/admin/unsplash?query=${encodeURIComponent(debouncedPrompt)}&page=${page}&per_page=8`,
        )

        if (!response.ok) {
          throw new Error("Failed to fetch images")
        }

        const data = await response.json()

        if (page === 1) {
          setImages(data.results)
        } else {
          setImages((prevImages) => [...prevImages, ...data.results])
        }

        setHasMore(data.results.length > 0)
        setError(null)
      } catch (err) {
        setError("Error fetching images. Please try again.")

        // Auto-hide error after 5 seconds
        setTimeout(() => {
          setError(null)
        }, 5000)
      } finally {
        setLoading(false)
        setInitialLoading(false)
      }
    }

    if (debouncedPrompt) {
      fetchImages()
    }
  }, [debouncedPrompt, page])

  const handleImageSelect = (image: UnsplashImage) => {
    setPreviewImage(image)
  }

  const handleImageConfirm = () => {
    if (previewImage) {
      setSelectedImage({
        url: previewImage.urls.regular,
        id: previewImage.id,
      })
    }
    setPreviewImage(null)
    setScale(1)
  }

  const handleClosePreview = () => {
    setPreviewImage(null)
    setScale(1)
  }

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5))
  }

  const handleResetZoom = () => {
    setScale(1)
  }

  // Disable background scroll when modal is open
  useEffect(() => {
    if (previewImage) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [previewImage])

  return (
    <div className="w-full space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchPrompt}
          onChange={(e) => setSearchPrompt(e.target.value)}
          placeholder="Search for images..."
          className="pl-10"
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div ref={scrollContainerRef} className="relative w-full overflow-x-auto pb-4" style={{ scrollbarWidth: "thin" }}>
        <div className="flex gap-4 min-w-max">
          {initialLoading
            ? // Skeleton loaders for initial load
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-48 h-32 flex-shrink-0">
                <Skeleton className="w-full h-full rounded-md" />
              </div>
            ))
            : // Actual images
            images.map((image, index) => {
              if (images.length === index + 1) {
                return (
                  <div
                    ref={lastImageRef}
                    key={image.id}
                    className="w-48 h-32 flex-shrink-0 cursor-pointer relative overflow-hidden rounded-md"
                    onClick={() => handleImageSelect(image)}
                  >
                    <img
                      src={image.urls.small || "/placeholder.svg"}
                      alt={image.alt_description || "Unsplash image"}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                )
              } else {
                return (
                  <div
                    key={image.id}
                    className="w-48 h-32 flex-shrink-0 cursor-pointer relative overflow-hidden rounded-md"
                    onClick={() => handleImageSelect(image)}
                  >
                    <img
                      src={image.urls.small || "/placeholder.svg"}
                      alt={image.alt_description || "Unsplash image"}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                )
              }
            })}

          {loading &&
            !initialLoading &&
            // Skeleton loaders for loading more
            Array.from({ length: 4 }).map((_, i) => (
              <div key={`loading-${i}`} className="w-48 h-32 flex-shrink-0">
                <Skeleton className="w-full h-full rounded-md" />
              </div>
            ))}
        </div>
      </div>

      {/* Full-screen preview modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={handleClosePreview}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-2 right-2 z-10 flex gap-2">
              <Button
                variant="secondary"
                size="icon"
                onClick={handleZoomIn}
                className="rounded-full bg-black/50 hover:bg-black/70"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleZoomOut}
                className="rounded-full bg-black/50 hover:bg-black/70"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleResetZoom}
                className="rounded-full bg-black/50 hover:bg-black/70"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleClosePreview}
                className="rounded-full bg-black/50 hover:bg-black/70"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="overflow-auto max-w-full max-h-[80vh]">
              <img
                src={previewImage.urls.regular || "/placeholder.svg"}
                alt={previewImage.alt_description || "Unsplash image"}
                className="transition-transform duration-200 ease-out"
                style={{ transform: `scale(${scale})` }}
              />
            </div>

            <div className="mt-4 flex justify-between">
              <p className="text-sm text-white">Photo by {previewImage.user.name} on Unsplash</p>
              <Button onClick={handleImageConfirm}>Select Image</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
