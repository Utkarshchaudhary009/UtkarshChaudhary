import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("query") || "nature"
  const page = searchParams.get("page") || "1"
  const perPage = searchParams.get("per_page") || "8"

  const accessKey = process.env.UNSPLASH_ACCESS_KEY

  if (!accessKey) {
    return NextResponse.json({ error: "Unsplash API key is not configured" }, { status: 500 })
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
      },
    )

    if (!response.ok) {
      throw new Error("Failed to fetch from Unsplash API")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Unsplash API error:", error)
    return NextResponse.json({ error: "Failed to fetch images from Unsplash" }, { status: 500 })
  }
}
