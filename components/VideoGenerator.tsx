import React, { useState } from 'react';
import { generateVeoVideo, AVAILABLE_VEO_MODELS } from '../services/geminiService';
import { Button } from './Button';
import { Video, Upload, AlertTriangle, Lock, Cpu, Layers } from 'lucide-react';

interface VideoGeneratorProps {
  apiKey: string;
  initialImage: string | null;
  onError: (msg: string) => void;
  onAuthRequired: () => void;
}

const DEFAULT_VEO_PROMPT = "一個歡快、充滿活力且節慶感十足的聖誕場景，主角散發著喜悅和能量。視覺風格應受到 Mariah Carey 標誌性歌曲《All I Want For Christmas Is You》音樂錄影帶的強烈啟發，尤其是其 90 年代初的美學、溫暖和慶祝氛圍。燈光： 溫暖、金色且閃閃發光。強調聖誕燈光的柔和光芒和整體歡快的照明。氛圍： 歡樂、懷舊、充滿活力，充滿聖誕精神。想像經典聖誕特輯那種健康、略帶奇幻的感覺。色彩： 主要為濃郁的紅色、森林綠、金色、銀色和暖白色。藝術風格/感覺： 寫實主義，帶有一點風格化的「音樂錄影帶」質感。清晰、明亮且視覺吸引力強。避免過於粗糙或沉悶的感覺。";

export const VideoGenerator: React.FC<VideoGeneratorProps> = ({ apiKey, initialImage, onError, onAuthRequired }) => {
  const [prompt, setPrompt] = useState(DEFAULT_VEO_PROMPT);
  const [loading, setLoading] = useState(false);
  const [localImage, setLocalImage] = useState<string | null>(initialImage);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_VEO_MODELS[1].id); // 默認 Fast 3.1

  React.useEffect(() => {
    if (initialImage) setLocalImage(initialImage);
  }, [initialImage]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalImage(reader.result as string);
        setVideoUrl(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      onAuthRequired();
      return;
    }

    if (!localImage) {
      onError("請先上傳一張圖片以進行動畫化。");
      return;
    }

    setLoading(true);
    setVideoUrl(null);
    try {
      const url = await generateVeoVideo(apiKey, localImage, prompt, aspectRatio, selectedModel);
      setVideoUrl(url);
    } catch (err: any) {
      onError(err.message || "影片生成失敗。請檢查您的 API Key 是否有 Veo 權限。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-bold text-electric-purple mb-6 flex items-center gap-2">
           <span className="w-2 h-8 bg-electric-purple rounded-full"></span>
           Veo 動畫師
        </h2>

        <div className="mb-6 bg-yellow-900/30 border border-yellow-600 text-yellow-200 p-4 rounded-lg flex items-start gap-3">
          <AlertTriangle className="shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-bold text-xs uppercase tracking-wider mb-1">開發者提示</h3>
            <p className="text-sm">Veo 需要計費專案 (GCP Paid Project)。如果請求失敗並顯示 404，請嘗試切換不同的模型版本。</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="relative group rounded-lg overflow-hidden border-2 border-gray-700 bg-black/50 aspect-video flex items-center justify-center shadow-inner">
               {localImage ? (
                 <>
                   <img src={localImage} alt="Source" className="max-h-full max-w-full object-contain" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-full font-bold hover:bg-gray-200 flex items-center gap-2 text-xs">
                            <Upload size={14} />
                            更換來源
                            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                        </label>
                    </div>
                 </>
               ) : (
                <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-gray-800 transition-colors">
                    <Upload className="w-10 h-10 mb-3 text-gray-400" />
                    <span className="text-sm text-gray-400">上傳來源圖片</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
               )}
            </div>

            <div>
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest flex items-center gap-1">
                      <Layers size={12} />
                      選擇 Veo 模型版本
                    </label>
                    <select 
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full bg-black border border-gray-700 rounded-md py-2.5 px-3 text-sm text-gray-300 focus:border-electric-purple focus:ring-1 focus:ring-electric-purple outline-none appearance-none"
                    >
                      {AVAILABLE_VEO_MODELS.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-gray-600 mt-1 italic">
                      {AVAILABLE_VEO_MODELS.find(m => m.id === selectedModel)?.description}
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">動畫提示詞</label>
                    <textarea
                        rows={2}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="描述動畫內容..."
                        className="w-full bg-black border border-gray-700 rounded-md py-2 px-3 text-xs text-gray-300 focus:border-electric-purple focus:ring-1 focus:ring-electric-purple outline-none resize-none"
                    />
                  </div>
                </div>
                
                <div className="flex gap-4 items-center mb-6">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">長寬比：</label>
                    <div className="flex bg-black rounded-lg p-1 border border-gray-700">
                        <button 
                            onClick={() => setAspectRatio('16:9')}
                            className={`px-3 py-1 rounded text-[10px] font-bold transition-colors ${aspectRatio === '16:9' ? 'bg-electric-purple text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            16:9
                        </button>
                        <button 
                            onClick={() => setAspectRatio('9:16')}
                            className={`px-3 py-1 rounded text-[10px] font-bold transition-colors ${aspectRatio === '9:16' ? 'bg-electric-purple text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            9:16
                        </button>
                    </div>
                </div>

                <Button onClick={handleGenerate} isLoading={loading} disabled={!localImage} variant="accent" className="w-full">
                    {apiKey ? <Video className="mr-2 h-5 w-5" /> : <Lock className="mr-2 h-5 w-5" />}
                    {apiKey ? "生成影片" : "解鎖 Veo"}
                </Button>
                
                <div className="mt-3 flex justify-between items-center text-[10px]">
                   <p className="text-gray-600 flex items-center gap-1">
                     <Cpu size={10} />
                     現正使用: <span className="font-mono text-gray-500">{selectedModel}</span>
                   </p>
                </div>
            </div>
          </div>

          <div className="border-2 border-gray-800 border-dashed rounded-lg bg-black/30 flex items-center justify-center aspect-video relative overflow-hidden shadow-2xl">
            {loading ? (
                <div className="text-center p-6 bg-black/40 backdrop-blur-sm inset-0 absolute flex flex-col items-center justify-center z-10">
                    <div className="animate-spin h-10 w-10 border-4 border-electric-purple border-t-transparent rounded-full mb-4"></div>
                    <p className="text-electric-purple font-bold animate-pulse text-sm">正在構築影片場景...</p>
                    <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest">Veo 正在計算光影與動作</p>
                </div>
            ) : videoUrl ? (
                <video src={videoUrl} controls autoPlay loop className="w-full h-full object-contain" />
            ) : (
                <div className="text-gray-600 flex flex-col items-center p-10 text-center">
                    <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mb-4 border border-gray-800">
                      <Video size={32} className="opacity-20" />
                    </div>
                    <p className="text-sm">待命狀態</p>
                    <p className="text-[10px] mt-1 text-gray-700">準備好後點擊「生成影片」</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};