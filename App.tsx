import React, { useState, useEffect } from 'react';
import { CharacterGenerator } from './components/CharacterGenerator';
import { ImageEditor } from './components/ImageEditor';
import { VideoGenerator } from './components/VideoGenerator';
import { ApiKeyInput } from './components/ApiKeyInput';
import { AppMode } from './types';
import { Zap, Image as ImageIcon, Film, X, LogOut, Key, Download } from 'lucide-react';

const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// The AI Studio environment provides window.aistudio with a specific AIStudio type.
// We avoid redeclaring it to prevent TypeScript conflicts with modifier requirements.

export default function App() {
  // Temporarily set to true to bypass passcode
  const [isAccessGranted, setIsAccessGranted] = useState(true); 
  const [apiKey, setApiKey] = useState<string>('');
  const [activeMode, setActiveMode] = useState<AppMode>(AppMode.GENERATE);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Load API Key on startup or check for AI Studio key
  useEffect(() => {
    const checkApiKey = async () => {
      const aistudio = (window as any).aistudio;
      if (aistudio && typeof aistudio.hasSelectedApiKey === 'function' && await aistudio.hasSelectedApiKey()) {
        // In AI Studio environment, the key is handled automatically
        setApiKey(process.env.API_KEY || 'AI_STUDIO_MANAGED');
      } else {
        const storedKey = localStorage.getItem('nano_banana_api_key');
        if (storedKey) {
          setApiKey(storedKey);
        }
      }
    };
    checkApiKey();
  }, []);

  const handleKeySubmit = (key: string) => {
    setApiKey(key);
    localStorage.setItem('nano_banana_api_key', key);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setApiKey('');
    localStorage.removeItem('nano_banana_api_key');
  };

  const handleImageGenerated = (url: string) => {
    setCurrentImage(url);
  };

  const handleImageUpdated = (url: string) => {
    setCurrentImage(url);
  };

  const handleError = (msg: string) => {
    // If the request fails with this message, reset key and re-open dialog as per guidelines
    if (msg.includes("Requested entity was not found")) {
      handleLogout();
      openAuthModal();
    }
    setError(msg);
    setTimeout(() => setError(null), 5000);
  };

  const openAuthModal = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio && typeof aistudio.openSelectKey === 'function') {
      await aistudio.openSelectKey();
      // Assume the key selection was successful to mitigate race conditions
      setApiKey(process.env.API_KEY || 'AI_STUDIO_MANAGED');
    } else {
      setShowAuthModal(true);
    }
  };

  const handleDownload = async () => {
    if (!currentImage) return;
    
    try {
      const res = await fetch(currentImage);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const extension = blob.type.split('/')[1] || 'png';
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `jimmy-avatar-${Date.now()}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (err) {
      handleError("下載失敗，請重試。");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f12] text-white font-sans selection:bg-banana-yellow selection:text-black pb-20 relative animate-fadeIn">
      
      {showAuthModal && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <ApiKeyInput onKeySubmit={handleKeySubmit} onClose={() => setShowAuthModal(false)} />
        </div>
      )}

      <header className="sticky top-0 z-50 bg-[#0f0f12]/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-gradient-to-br from-banana-yellow to-orange-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,225,53,0.3)]">
                 <Zap className="text-black fill-black" size={24} />
               </div>
               <div>
                 <h1 className="text-xl font-bold tracking-tighter text-white">
                   NANO <span className="text-banana-yellow">BANANA</span>
                 </h1>
                 <p className="text-[10px] text-gray-400 tracking-widest uppercase">視覺 DNA 實驗室</p>
               </div>
            </div>

            <div className="flex items-center gap-4">
                <nav className="flex items-center gap-1 bg-gray-900/50 p-1 rounded-full border border-gray-800">
                <button
                    onClick={() => setActiveMode(AppMode.GENERATE)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 flex items-center gap-2 ${activeMode === AppMode.GENERATE ? 'bg-banana-yellow text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    <Zap size={16} />
                    <span className="hidden sm:inline">DNA</span>
                </button>
                <button
                    onClick={() => setActiveMode(AppMode.EDIT)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 flex items-center gap-2 ${activeMode === AppMode.EDIT ? 'bg-cyber-cyan text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    <ImageIcon size={16} />
                    <span className="hidden sm:inline">編輯</span>
                </button>
                <button
                    onClick={() => setActiveMode(AppMode.ANIMATE)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 flex items-center gap-2 ${activeMode === AppMode.ANIMATE ? 'bg-electric-purple text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    <Film size={16} />
                    <span className="hidden sm:inline">Veo</span>
                </button>
                </nav>
                
                {apiKey ? (
                  <button 
                      onClick={handleLogout}
                      className="text-gray-500 hover:text-red-400 transition-colors p-2"
                      title="清除 API Key"
                  >
                      <LogOut size={20} />
                  </button>
                ) : (
                  <button 
                      onClick={openAuthModal}
                      className="text-banana-yellow hover:text-white transition-colors p-2 animate-pulse"
                      title="輸入 API Key"
                  >
                      <Key size={20} />
                  </button>
                )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {error && (
          <div className="fixed bottom-4 right-4 z-50 animate-bounce">
            <div className="bg-red-500/90 text-white px-6 py-4 rounded-lg shadow-2xl backdrop-blur flex items-center gap-3 border border-red-400">
               <span className="font-bold">錯誤：</span> {error}
               <button onClick={() => setError(null)} className="ml-2 hover:bg-white/20 p-1 rounded"><X size={16}/></button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="min-h-[600px]">
              {activeMode === AppMode.GENERATE && (
                <div className="animate-fadeIn">
                  <div className="mb-4">
                     <h2 className="text-3xl font-bold mb-2">初始化 Jimmy</h2>
                     <p className="text-gray-400">使用 Nano Banana 協議鑄造您的角色形象。</p>
                  </div>
                  <CharacterGenerator apiKey={apiKey} onImageGenerated={handleImageGenerated} onError={handleError} onAuthRequired={openAuthModal} />
                </div>
              )}
              
              {activeMode === AppMode.EDIT && (
                <div className="animate-fadeIn">
                  <div className="mb-4">
                     <h2 className="text-3xl font-bold mb-2">Nano 編輯器</h2>
                     <p className="text-gray-400">使用文字提示修改圖片。</p>
                  </div>
                  <ImageEditor apiKey={apiKey} initialImage={currentImage} onImageUpdated={handleImageUpdated} onError={handleError} onAuthRequired={openAuthModal} />
                </div>
              )}

              {activeMode === AppMode.ANIMATE && (
                <div className="animate-fadeIn">
                  <div className="mb-4">
                     <h2 className="text-3xl font-bold mb-2">Veo 動畫師</h2>
                     <p className="text-gray-400">透過 Veo 生成高品質舞蹈影片。</p>
                  </div>
                  <VideoGenerator apiKey={apiKey} initialImage={currentImage} onError={handleError} onAuthRequired={openAuthModal} />
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 sticky top-24">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">當前資產</h3>
              
              {currentImage ? (
                <div className="space-y-4">
                  <div className="relative group rounded-lg overflow-hidden border-2 border-banana-yellow/30 shadow-[0_0_30px_rgba(255,225,53,0.1)]">
                    <img src={currentImage} alt="Current Context" className="w-full h-auto object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                      <p className="text-xs text-gray-300">啟用中的 DNA 序列</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                     <button 
                        onClick={handleDownload}
                        className="flex-1 bg-banana-yellow hover:bg-yellow-300 text-black text-xs font-bold py-3 px-4 rounded transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                      >
                        <Download size={16} />
                        下載高畫質原圖
                     </button>
                     <button 
                        onClick={() => {
                          setCurrentImage(null);
                        }}
                        className="bg-gray-800 hover:bg-red-900/50 text-white text-xs font-bold py-3 px-4 rounded transition-colors"
                      >
                        清除
                     </button>
                  </div>
                  
                  <div className="p-4 bg-black/40 rounded border border-gray-800 text-xs text-gray-400">
                    <p>💡 提示：切換分頁以在其他工具中使用此圖片。圖片會在生成、編輯和動畫模式間保留。</p>
                  </div>
                </div>
              ) : (
                <div className="h-64 border-2 border-dashed border-gray-800 rounded-lg flex flex-col items-center justify-center text-gray-600">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <Zap size={24} className="opacity-20" />
                  </div>
                  <p className="text-sm">無當前資產。</p>
                  <p className="text-xs mt-2">請生成或上傳圖片以開始。</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
