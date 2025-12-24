import React, { useState } from 'react';
import { editImageWithPrompt, MODEL_IDS } from '../services/geminiService';
import { Button } from './Button';
import { Sparkles, Upload, Lock, Cpu } from 'lucide-react';

interface ImageEditorProps {
  apiKey: string;
  initialImage: string | null;
  onImageUpdated: (url: string) => void;
  onError: (msg: string) => void;
  onAuthRequired: () => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ apiKey, initialImage, onImageUpdated, onError, onAuthRequired }) => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [localImage, setLocalImage] = useState<string | null>(initialImage);

  // Sync local image if initial image changes and we don't have one
  React.useEffect(() => {
    if (initialImage) setLocalImage(initialImage);
  }, [initialImage]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!apiKey) {
      onAuthRequired();
      return;
    }

    if (!localImage) {
      onError("請先選擇或生成一張圖片。");
      return;
    }
    if (!prompt.trim()) {
      onError("請描述您希望如何編輯這張圖片。");
      return;
    }

    setLoading(true);
    try {
      const url = await editImageWithPrompt(apiKey, localImage, prompt);
      onImageUpdated(url);
      setLocalImage(url); // Update local view with result
      setPrompt(""); // Clear prompt
    } catch (err: any) {
      onError(err.message || "圖片編輯失敗。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6">
       <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-bold text-cyber-cyan mb-6 flex items-center gap-2">
           <span className="w-2 h-8 bg-cyber-cyan rounded-full"></span>
           Nano 編輯器
        </h2>

        {/* Image Preview / Upload Area */}
        <div className="mb-6">
           {localImage ? (
             <div className="relative group rounded-lg overflow-hidden border-2 border-gray-700 bg-black/50 aspect-square max-h-[400px] flex items-center justify-center">
               <img src={localImage} alt="To Edit" className="max-h-full max-w-full object-contain" />
               <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-full font-bold hover:bg-gray-200 flex items-center gap-2">
                    <Upload size={18} />
                    更換圖片
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
               </div>
             </div>
           ) : (
             <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer bg-gray-800/50 hover:bg-gray-800 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">點擊上傳</span> 或拖放檔案</p>
                    <p className="text-xs text-gray-500">PNG, JPG (最大 5MB)</p>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
           )}
        </div>

        {/* Prompt Input */}
        <div className="flex flex-col gap-4">
          <div className="relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="例如：'添加復古故障濾鏡'、'將背景改為火星'..."
              className="w-full bg-black/50 border border-gray-700 rounded-md py-4 px-4 text-gray-300 focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
            />
            <div className="absolute right-2 top-2 bottom-2">
              <Button onClick={handleEdit} isLoading={loading} disabled={!localImage} variant="primary" className="h-full py-0 px-6 !text-sm">
                {apiKey ? <Sparkles className="mr-2 h-4 w-4" /> : <Lock className="mr-2 h-3 w-3" />}
                {apiKey ? "應用" : "啟用"}
              </Button>
            </div>
          </div>
          <div className="flex justify-between items-center text-xs text-gray-500">
            <p className="flex items-center gap-1">
               <Cpu size={12} />
               Model: <span className="font-mono text-gray-500">{MODEL_IDS.EDITING}</span>
            </p>
            {!apiKey && <p className="text-yellow-500 flex items-center gap-1"><Lock size={10} /> 未設定 API Key</p>}
          </div>
        </div>
      </div>
    </div>
  );
};