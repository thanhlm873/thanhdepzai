
import { GoogleGenAI, Modality } from '@google/genai';
import { generatePrompt } from '../services/promptService';

// This is a Vercel-specific signature. 
// If deploying elsewhere, you might need to adapt it.
export const config = {
  runtime: 'edge',
  maxDuration: 60,
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key is not configured on the server.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { 
        prompt, 
        activeTask,
        imagePalette,
        sourceImage,
        targetImage,
        imageToEdit,
        imageMimeType
    } = body;
    
    if (!activeTask || !prompt) {
        return new Response(JSON.stringify({ error: 'Missing activeTask or prompt' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const ai = new GoogleGenAI({ apiKey });
    const contentParts: ({ text: string } | { inlineData: { data: string, mimeType: string } })[] = [];

    const textForAI = activeTask?.id === 'EDIT_NANO_BANANA' 
      ? `${generatePrompt('EDIT_NANO_BANANA')}\n\nYêu cầu của người dùng: "${prompt}"`
      : prompt;

    if (activeTask?.id === 'TREND_FACE_SWAP_MV') {
        if (!sourceImage || !targetImage) {
           return new Response(JSON.stringify({ error: 'Face swap requires source and target images.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
        }
        contentParts.push({
            inlineData: {
                data: targetImage.dataUrl.split(',')[1],
                mimeType: targetImage.type,
            },
        });
        contentParts.push({
            inlineData: {
                data: sourceImage.dataUrl.split(',')[1],
                mimeType: sourceImage.type,
            },
        });
        contentParts.push({ text: textForAI });

    } else if (activeTask?.id === 'IMAGE_COLLAGE') {
        if (!imagePalette || imagePalette.length < 2) {
             return new Response(JSON.stringify({ error: 'Collage requires at least 2 images.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        contentParts.push({ text: textForAI });
        imagePalette.forEach((imgItem: { dataUrl: string, type: string }) => {
            contentParts.push({
                inlineData: {
                    data: imgItem.dataUrl.split(',')[1],
                    mimeType: imgItem.type,
                },
            });
        });

    } else {
        if (!imageToEdit) {
            return new Response(JSON.stringify({ error: 'An image is required for this task.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        const base64ImageData = imageToEdit.split(',')[1];
        contentParts.push({
            inlineData: {
                data: base64ImageData,
                mimeType: imageMimeType,
            },
        });
        contentParts.push({ text: textForAI });
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
          parts: contentParts,
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    let imageUrl: string | null = null;
    for (const part of response.candidates[0].content.parts) {
       if (part.inlineData) {
          const base64ImageBytes: string = part.inlineData.data;
          const newMimeType = part.inlineData.mimeType;
          imageUrl = `data:${newMimeType};base64,${base64ImageBytes}`;
          break; 
       }
    }
    
    if (!imageUrl) {
        const textResponse = response.text?.trim() || "The AI did not return an image.";
        return new Response(JSON.stringify({ error: textResponse }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify({ imageUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (e: unknown) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : "An unknown internal error occurred.";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
