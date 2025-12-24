import { GoogleGenAI } from "@google/genai";

// 導出模型 ID
export const MODEL_IDS = {
  GENERATION: 'gemini-3-pro-image-preview',
  EDITING: 'gemini-3-pro-image-preview'
};

// 可用的 Veo 影片模型列表
export const AVAILABLE_VEO_MODELS = [
  { id: 'veo-3.1-generate-preview', name: 'Veo 3.1 Pro (高品質)', description: '最先進的高品質生成' },
  { id: 'veo-3.1-fast-generate-preview', name: 'Veo 3.1 Fast (高效)', description: '平衡速度與品質' },
  { id: 'veo-3.0-generate-001', name: 'Veo 3.0 Pro', description: '穩定版 Pro' },
  { id: 'veo-3.0-fast-generate-001', name: 'Veo 3.0 Fast', description: '穩定版 Fast' },
  { id: 'veo-2.0-generate-001', name: 'Veo 2.0 (Legacy)', description: '舊版生成器' }
];

// 初始化用戶端
const getClient = (apiKey: string) => {
  const finalKey = (apiKey === 'AI_STUDIO_MANAGED' || !apiKey) ? process.env.API_KEY : apiKey;
  return new GoogleGenAI({ apiKey: finalKey as string });
};

export const generateJimmyCharacter = async (apiKey: string, prompt: string): Promise<string> => {
  if (!apiKey && !process.env.API_KEY) throw new Error("缺少 API Key");
  const ai = getClient(apiKey);
  
  const response = await ai.models.generateContent({
    model: MODEL_IDS.GENERATION,
    contents: prompt,
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: "1K"
      }
    }
  });

  let imageUrl = '';
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64Data = part.inlineData.data;
        const mimeType = part.inlineData.mimeType || 'image/png';
        imageUrl = `data:${mimeType};base64,${base64Data}`;
        break;
      }
    }
  }

  if (!imageUrl) throw new Error("未生成任何圖片。");
  return imageUrl;
};

export const editImageWithPrompt = async (apiKey: string, base64Image: string, prompt: string): Promise<string> => {
  if (!apiKey && !process.env.API_KEY) throw new Error("缺少 API Key");
  const ai = getClient(apiKey);
  
  const cleanBase64 = base64Image.split(',')[1] || base64Image;

  const response = await ai.models.generateContent({
    model: MODEL_IDS.EDITING,
    contents: {
      parts: [
        { inlineData: { data: cleanBase64, mimeType: 'image/png' } },
        { text: prompt }
      ]
    },
    config: {
      imageConfig: { imageSize: "1K" }
    }
  });

  let imageUrl = '';
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64Data = part.inlineData.data;
        const mimeType = part.inlineData.mimeType || 'image/png';
        imageUrl = `data:${mimeType};base64,${base64Data}`;
        break;
      }
    }
  }

  if (!imageUrl) throw new Error("編輯未能生成圖片。");
  return imageUrl;
};

export const generateVeoVideo = async (
  apiKey: string, 
  base64Image: string, 
  prompt: string, 
  aspectRatio: '16:9' | '9:16' = '16:9',
  modelId: string = 'veo-3.1-fast-generate-preview' // 默認模型
): Promise<string> => {
  if (!apiKey && !process.env.API_KEY) throw new Error("缺少 API Key");
  const ai = getClient(apiKey);
  
  const cleanBase64 = base64Image.split(',')[1] || base64Image;

  let operation = await ai.models.generateVideos({
    model: modelId,
    prompt: prompt || "Animate this character naturally",
    image: {
      imageBytes: cleanBase64,
      mimeType: 'image/png', 
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({operation: operation});
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("影片生成失敗或未返回連結。");

  const finalKey = (apiKey === 'AI_STUDIO_MANAGED' || !apiKey) ? process.env.API_KEY : apiKey;
  const response = await fetch(`${downloadLink}&key=${finalKey}`);
  if (!response.ok) throw new Error("無法下載影片檔案。");
  
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};
