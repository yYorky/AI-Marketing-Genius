
import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// FIX: Implement and export the missing 'editImage' function.
export const editImage = async (
  base64ImageData: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  const imagePart = {
    inlineData: {
      data: base64ImageData,
      mimeType: mimeType,
    },
  };

  const textPart = {
    text: prompt,
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [imagePart, textPart],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  // Extract the image data from the response.
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }

  throw new Error("Image editing failed. No image data was returned from the API.");
};

export const generateMarketingMaterials = async (
  base64ImageData: string,
  mimeType: string,
  price: string,
  updateLoadingStep: (step: string) => void
): Promise<string[]> => {
  // Step 1: Analyze the image to get selling points
  updateLoadingStep("Analyzing product and identifying selling points...");
  const imagePart = {
    inlineData: {
      data: base64ImageData,
      mimeType: mimeType,
    },
  };
  const analysisPrompt = `
    Analyze the product in this image. Identify its key features and unique selling points. 
    Return a JSON object with two keys:
    1. "productName": A short, catchy name for the product.
    2. "sellingPoints": An array of 3-4 short, impactful selling points as strings.
    
    Example response format:
    {
      "productName": "Hydro-Luxe Water Bottle",
      "sellingPoints": ["Keeps drinks cold for 24 hours", "Sleek, ergonomic design", "Leak-proof lid", "BPA-free materials"]
    }
  `;

  const analysisResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, { text: analysisPrompt }] },
    // FIX: Use responseMimeType to ensure a valid JSON response.
    config: {
      responseMimeType: 'application/json',
    },
  });

  let analysisResult;
  try {
    // FIX: The API with responseMimeType: 'application/json' returns a parsable JSON string.
    // The ```json markdown is not present.
    analysisResult = JSON.parse(analysisResponse.text);
  } catch (e) {
    console.error("Failed to parse analysis JSON:", analysisResponse.text);
    throw new Error("Could not analyze the product image. Please try a different image.");
  }
  
  const { productName, sellingPoints } = analysisResult;
  
  if (!productName || !sellingPoints || !Array.isArray(sellingPoints) || sellingPoints.length === 0) {
      throw new Error("Analysis failed to identify product features. Please try again.");
  }

  // Step 2: Create diverse prompts for Gemini 2.5 Flash Image
  updateLoadingStep(`Creating marketing concepts for ${productName}...`);
  const formattedPrice = `$${price}`;
  const marketingPrompts = [
    `Using the provided image of the '${productName}', create a clean e-commerce product shot. Place the product on a pure white background with professional studio lighting. The product itself must not be altered, changed, or modified in any way.`,
    `Using the provided image, create a vibrant social media ad poster for the '${productName}'. Use eye-catching colors and modern typography. Prominently feature the text '${sellingPoints[0]}!' and the price '${formattedPrice}'. The original product from the image must be the centerpiece and remain completely unchanged.`,
    `Take the product from the supplied image and place it in a realistic lifestyle setting. For example, if it's a water bottle, show it on a desk or at a gym. The scene should be warm and inviting, highlighting its use case. The text '${sellingPoints[1 % sellingPoints.length]}' should be subtly integrated. The product must look exactly as it does in the original image.`,
    `Create a minimalist and elegant advertisement for the '${productName}' using the provided image. Place it on a dark, textured background with artistic shadows. Add the tagline '${sellingPoints[2 % sellingPoints.length]}' and the price '${formattedPrice}' in a sophisticated font. The product from the image must be perfectly preserved without any modifications.`,
    `Generate a luxury-themed advertisement using the product from the image. Place the unaltered product on a pedestal made of marble or dark wood. Use dramatic, cinematic lighting. Add the text '${productName}' in an elegant serif font and the price '${formattedPrice}' discreetly at the bottom. The mood should be exclusive and high-end. Do not modify the product from the original image.`,
    `Create an infographic-style marketing image using the product from the provided photo. Place the unchanged product on a clean, light-colored background. Around the product, use callouts to highlight key features, using the text: '${sellingPoints[0]}' and '${sellingPoints[1 % sellingPoints.length]}'. The overall feel should be informative and modern. The product must remain exactly as it is in the original image.`
  ];
  
  // Step 3: Generate images with Gemini 2.5 Flash Image
  updateLoadingStep(`Generating ${marketingPrompts.length} marketing images... (this may take a moment)`);
  const imageGenerationPromises = marketingPrompts.map(prompt => 
    ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [imagePart, { text: prompt }],
      },
      config: {
          responseModalities: [Modality.IMAGE],
      },
    })
  );

  const imageResults = await Promise.all(imageGenerationPromises);

  const base64Images = imageResults.map(response => {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    throw new Error("Image generation failed for one of the prompts.");
  });
  
  return base64Images.filter(Boolean) as string[];
};
