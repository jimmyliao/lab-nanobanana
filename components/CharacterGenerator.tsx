import React, { useState } from 'react';
import { generateJimmyCharacter, MODEL_IDS } from '../services/geminiService';
import { Button } from './Button';
import { Wand2, Copy, Check, Lock, Cpu } from 'lucide-react';

const JIMMY_VISUAL_DNA_PROMPT = `
[核心代理初始化：JIMMY 的視覺 DNA]

角色名稱：Jimmy
特徵：年輕男性卡通頭像。
髮型：凌亂的深褐色短髮。
面部：戴著黑色粗框眼鏡，有淡淡的鬍渣，下巴上有一顆明顯的小痣。
表情：燦爛、親切的微笑。
服裝：深灰色 T 恤。
風格：高品質 2D/3D 混合渲染，色彩飽和，具有現代插畫感。

任務：生成 Jimmy 的高品質頭像或全身像。
背景：簡潔的白色背景。
`.trim();

interface CharacterGeneratorProps {
  apiKey: string;
  onImageGenerated: (url: string) => void;
  onError: (msg: string) => void;
  onAuthRequired: () => void;
}

export const CharacterGenerator: React.FC<CharacterGeneratorProps> = ({ apiKey, onImageGenerated, onError, onAuthRequired }) => {
  const [prompt, setPrompt] = useState(JIMMY_VISUAL_DNA_PROMPT);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!apiKey) {
      onAuthRequired();
      return;
    }

    setLoading(true);
    try {
      const url = await generateJimmyCharacter(apiKey, prompt);
      onImageGenerated(url);
    } catch (err: any) {
      onError(err.message || "無法生成 Jimmy。");
    } finally {
      setLoading(false);
    }
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg shadow-xl relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-banana-yellow flex items-center gap-2">
            <span className="w-2 h-8 bg-banana-yellow rounded-full"></span>
            視覺 DNA 協議
          </h2>
          <button 
            onClick={copyPrompt}
            className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
          >
            {copied ? <Check size={16} className="text-neon-green" /> : <Copy size={16} />}
            {copied ? '已複製' : '複製提示詞'}
          </button>
        </div>
        
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full h-64 bg-black/50 border border-gray-700 rounded-md p-4 text-sm font-mono text-gray-300 focus:border-banana-yellow focus:ring-1 focus:ring-banana-yellow outline-none resize-none"
        />

        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col gap-1">
             {!apiKey && (
              <span className="text-xs text-yellow-500 flex items-center gap-1">
                <Lock size={12} />
                需要 API Key 才能生成
              </span>
            )}
            <span className="text-xs text-gray-600 flex items-center gap-1">
              <Cpu size={12} />
              Model: <span className="font-mono text-gray-500">{MODEL_IDS.GENERATION}</span>
            </span>
          </div>
         
          <Button onClick={handleGenerate} isLoading={loading} variant="primary" className="w-full sm:w-auto ml-auto">
            {apiKey ? <Wand2 className="mr-2 h-5 w-5" /> : <Lock className="mr-2 h-4 w-4" />}
            {apiKey ? "初始化 Jimmy" : "輸入 Key 以啟用"}
          </Button>
        </div>
      </div>
    </div>
  );
};