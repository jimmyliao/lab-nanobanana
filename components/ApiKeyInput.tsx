import React, { useState } from 'react';
import { Button } from './Button';
import { Key, ShieldCheck, ExternalLink, Zap, X } from 'lucide-react';

interface ApiKeyInputProps {
  onKeySubmit: (key: string) => void;
  onClose?: () => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onKeySubmit, onClose }) => {
  const [inputKey, setInputKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputKey.trim()) {
      onKeySubmit(inputKey.trim());
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden animate-fadeIn">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-banana-yellow/10 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-electric-purple/10 rounded-full blur-3xl transform -translate-x-10 translate-y-10"></div>

      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      )}

      <div className="flex flex-col items-center text-center relative z-10">
        <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-6 shadow-lg border border-gray-700">
          <Key className="text-banana-yellow w-8 h-8" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2">
          輸入 API Key
        </h1>
        <p className="text-gray-400 mb-6 text-sm">
          為了啟動 Nano Banana 的生成引擎，請輸入您的 Google Gemini API Key。金鑰僅儲存於您的瀏覽器。
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <ShieldCheck className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="貼上您的 Gemini API Key"
              className="w-full pl-10 pr-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-banana-yellow focus:border-transparent transition-all"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={!inputKey.trim()}>
            驗證並啟用 <Zap className="ml-2 w-4 h-4" />
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-800 w-full flex flex-col items-center">
          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-sm text-banana-yellow hover:text-yellow-300 transition-colors"
          >
            獲取免費 API Key <ExternalLink className="ml-1 w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};