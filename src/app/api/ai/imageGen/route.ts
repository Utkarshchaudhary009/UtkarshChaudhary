import { GoogleGenAI, Modality } from "@google/genai";
import FormData from "form-data";
import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Initialize Google GenAI
const GOOGLE_AI_KEY = process.env.GOOGLE_AI_KEY;
if (!GOOGLE_AI_KEY) {
  throw new Error("GOOGLE_AI_KEY is not set");
}
const ai = new GoogleGenAI({ apiKey: GOOGLE_AI_KEY });

async function PromptGenerator(data: any) {
  try {
    // Extract the base prompt, fallback to default if none provided
    const basePrompt = (typeof data === "string" ? data : data?.prompt) || "beautiful landscape";

    // Construct the enhancement prompt for the AI model
    const enhancementPrompt = `You are an expert image artist with years of experience. Write a short description in exactly 10 words about "${basePrompt}". Use quotation marks around the description.
Key Elements of a Good Prompt 
    1> Subject: What’s the main focus? (person, object, scenery, animal)
    2> Context & Background: Where is the subject? (urban, nature, indoors, studio, time of day)
    3> Style: What kind of image? (photo, sketch, painting, digital art, specific art movements)
    4> Details & Modifiers: Add adjectives, lighting, camera angles, lens types, mood, and quality tags (e.g., photorealistic, HDR, 4K)
Prompt Structure Example:
Short prompt:
“Close-up photo of a woman in her 20s, street photography, muted orange warm tones”

Long prompt:
“Captivating photo of a woman in her 20s utilizing street photography style. The image looks like a movie still with muted orange warm tones.”

Advanced Tips
Use photography keywords to guide style: close-up, aerial, macro lens, dramatic lighting

Reference art styles or movements: impressionism, renaissance, pop art

Use materials or shapes: made of cheese, neon tubes in the shape of a bird

Add quality modifiers: 8K, hyper-detailed, cinematic lighting

Set aspect ratios: 1:1 (square), 4:3 (fullscreen), 16:9 (widescreen), 9:16 (portrait vertical)

Example of a fully detailed prompt:
“A photorealistic 35mm close-up portrait of a woman in her 20s, film noir style, black and white with deep shadows, dramatic lighting, shallow depth of field, cinematic, 4K resolution, 3:4 aspect ratio”

Using Parameterized Prompts for Customization
Example:
A {logo_style} logo for a {company_area} company on a solid color background. Include the text {company_name}.

This helps generate tailored images based on user input.

Follow these guidelines to create a detailed and effective prompt.`;

    // Call the AI model to generate content
    const result = await ai.models.generateContent({
      contents: enhancementPrompt,
      model: "gemini-2.0-flash",
    });

    let generatedText = result.text || "";

    // Extract the description inside quotation marks reliably
    const quoteMatch = generatedText.match(/"([^"]+)"/);
    const description = quoteMatch ? quoteMatch[1].trim() : generatedText.trim();

    // Construct the final prompt with style and aspect ratio modifiers
    const enhancedPrompt = `Generate a photorealistic image of ${description}, 16:9 aspect ratio`;

    console.log("Using prompt for image generation:", enhancedPrompt);
    return enhancedPrompt;
  } catch (error) {
    console.error("Error generating enhanced prompt:", error);

    // Fallback prompt with quality descriptors for graceful degradation
    const fallbackPrompt = (typeof data === "string" ? data : data?.prompt) || "beautiful landscape";
    return `${fallbackPrompt}, 8K resolution, hyper-detailed, photorealistic, cinematic lighting`;
  }
}


async function saveImage(imageData: string, filename: string) {
  const tempDir = path.join(process.cwd(), "temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  const filePath = path.join(tempDir, filename);
}

// Function to generate image from prompt
async function generateImage(prompt: string) {
  try {
    // Set responseModalities to include "Image" so the model can generate an image
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: prompt,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });
    console.log("response", response?.candidates?.[0]);
    console.log("response content", response?.candidates?.[0]?.content);
    console.log("response parts", response?.candidates?.[0]?.content?.parts);
    // Find the image part in the response
    for (const part of response?.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const imageData = part.inlineData.data;
        console.log("imageData", imageData);
        if (!imageData) {
          throw new Error("No image data found");
        }
        const buffer = Buffer.from(imageData, "base64");

        // Create a unique filename
        const filename = `gemini-${uuidv4()}.png`;
        const tempDir = path.join(process.cwd(), "temp");

        // Ensure temp directory exists
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }

        const filePath = path.join(tempDir, filename);
        fs.writeFileSync(filePath, buffer);

        return { filePath, filename };
      }
    }

    throw new Error("No image generated");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

// Function to upload the generated image
async function uploadImage(filePath: string) {
  try {
    const formData = new FormData();
    formData.append("images", fs.createReadStream(filePath));

    const response = await fetch(
      process.env.NEXT_PUBLIC_BASE_URL + "/api/upload",
      {
        method: "POST",
        // @ts-expect-error FormData type mismatch with fetch
        body: formData,
        headers: {
          ...formData.getHeaders(),
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return data.files[0]?.url;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

// POST endpoint to generate and upload image
export async function POST(request: NextRequest) {
  try {
    const { data } = await request.json();

    if (!data) {
      return NextResponse.json({ error: "data is required" }, { status: 400 });
    }
    const prompt = await PromptGenerator(data);
    // Generate image
    const { filePath } = await generateImage(prompt);

    // Upload image
    const imageUrl = await uploadImage(filePath);

    // Delete temp file
    fs.unlinkSync(filePath);

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to generate or upload image" },
      { status: 500 }
    );
  }
}

// GET endpoint to generate and upload image using search params
// Example URL: http://localhost:3000/api/ai/imageGen?data=create+an+image+of+cat+on+dog
export async function GET(request: NextRequest) {
  try {
    const data = request.nextUrl.searchParams.get("data");

    if (!data) {
      return NextResponse.json({ error: "data is required" }, { status: 400 });
    }

    const prompt = await PromptGenerator(data);

    // Generate image
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: prompt,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });
    var err: string | undefined
    for (const part of response?.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64Image = part.inlineData.data;
        if (!base64Image) {
          throw new Error("No image data found");
        }

        const mimeType = part.inlineData.mimeType || "image/png"; // default fallback

        const dataUrl = `data:${mimeType};base64,${base64Image}`;

        return NextResponse.json({ base64Image: dataUrl });
      }
      else {
        err = part.text
      }
    }

    return NextResponse.json(
      { error: `Failed to generate image: ${err}` },
      { status: 500 }
    );

  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}

// export async function GET(request: NextRequest) {
//   try {
//     const data = request.nextUrl.searchParams.get("data");

//     if (!data) {
//       return NextResponse.json({ error: "data is required" }, { status: 400 });
//     }

//     const prompt = await PromptGenerator(data);
//     // Generate image
//     const { filePath } = await generateImage(prompt);

//     // Upload image
//     const imageUrl = await uploadImage(filePath);

//     // Delete temp file
//     fs.unlinkSync(filePath);

//     return NextResponse.json({ imageUrl });
//   } catch (error) {
//     console.error("Error processing request:", error);
//     return NextResponse.json(
//       { error: "Failed to generate or upload image" },
//       { status: 500 }
//     );
//   }
// }
