import { UnsplashImage } from "@/components/AiPic";
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from "ai";
import axios from "axios";
import { z } from "zod";

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_AI_KEY || "AIzaSyCpsngjTfKzpwbF3fEKD8RLToZG7qOgK3k",
});

export async function GoogleUnsplashScraper(query: string) {

    if (!query) {
        return { error: "Missing query" };
    }

    const unsplashURL = `https://unsplash.com/s/photos/${encodeURIComponent(query)}?order_by=latest&orientation=landscape`;

    try {
        const { data: html } = await axios.get(unsplashURL, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/90 Safari/537.36",
            },
        });
        return html;
    } catch (error) {
        console.error("Scrape error:", error);
        return { error: "Failed to scrape Unsplash" };
    }
}

export async function AiScrapper(prompt: string, schema: z.ZodSchema) {
    const { object } = await generateObject({
        model: google('gemini-2.0-flash-exp', { useSearchGrounding: true }),
        schema: schema,
        prompt: prompt,
    });

    return object;
}

// run ai scrapper and return a list of images
export async function pic(prompt: string) {
    const html = await GoogleUnsplashScraper(prompt);
    prompt = `Find the 10 images based on the following prompt: ${prompt} from the following html: ${html}`;
    try {
        const images: UnsplashImage[] = await AiScrapper(prompt, z.object({
            images: z.array(z.object({
                id: z.string(),
                urls: z.object({
                    regular: z.string(),
                    small: z.string(),
                    thumb: z.string(),
                }),
                alt_description: z.string(),
                user: z.object({
                    name: z.string(),
                }),
            })),
        }));

        console.log(images);
        return images;
    } catch (error) {
        console.error("Error:", error);
    }
}

// Run the main function
// pic("a beautiful landscape").catch(console.error);