async function getUser(apiKey: string) {
    const response = await fetch("https://api.elevenlabs.io/v1/user", {
        headers: {
            "X-API-Key": apiKey
        }
    })
    const data = await response.json()
    return data
}
export async function getUsage(apiKey: string) {
    const user = await getUser(apiKey)
    const usage = user?.subscription?.character_count
    return usage
}

export async function getStatus(apiKey: string) {
    const user = await getUser(apiKey)
    const status = user?.subscription?.status
    return status
}

export async function getCharacterStats(apiKey: string, start_unix: number, end_unix: number) {
    const response = await fetch(`https://api.elevenlabs.io/v1/usage/character-stats?start_unix=${start_unix}&end_unix=${end_unix}`, {
        headers: {
            "X-API-Key": apiKey
        }
    })
    const data = await response.json()
    return data
}

